// Setup wizard, "Check Setup" report and first-run nudge.

import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';
import { Toolchain, brokenReason } from './toolchain';
import {
  ToolKind,
  ToolLaunch,
  TOOLS,
  detectTools,
  resolveExecutable,
  ToolCandidate,
  targetInfo,
  isKnownEmulator,
  siblingExecutable,
  executableBaseName
} from './tools';

const SETUP_DONE_KEY = 'xcbasic3.setupDone';
const NUDGE_DISMISSED_KEY = 'xcbasic3.nudgeDismissed';
/** Emulators located by the user for a specific target (e.g. x128 outside the VICE folder), by executable name. */
const LOCATED_EMULATORS_KEY = 'xcbasic3.locatedEmulators';
export const WALKTHROUGH_ID = 'RealOrlof.orlof-xcbasic3#xcbasic3.gettingStarted';

interface PickItem extends vscode.QuickPickItem {
  action: 'use' | 'browse' | 'manual' | 'download' | 'skip';
  candidate?: ToolCandidate;
}

export class Setup {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly toolchain: Toolchain,
    private readonly output: vscode.OutputChannel
  ) {}

  // ---------------------------------------------------------------------------
  // Settings helpers

  configuredPath(kind: ToolKind): string {
    return vscode.workspace.getConfiguration('xcbasic3').get<string>(kind, '').trim();
  }

  /** Executable for the tool when the current setting is usable. */
  usableExecutable(kind: ToolKind): string | undefined {
    return resolveExecutable(this.configuredPath(kind));
  }

  private async storePath(kind: ToolKind, value: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('xcbasic3');
    const info = config.inspect<string>(kind);
    // Tool locations are machine specific: default to user settings unless the workspace already overrides it
    let target = vscode.ConfigurationTarget.Global;
    if (info?.workspaceFolderValue !== undefined) target = vscode.ConfigurationTarget.WorkspaceFolder;
    else if (info?.workspaceValue !== undefined) target = vscode.ConfigurationTarget.Workspace;
    await config.update(kind, value, target);
    this.updateContextKeys();
  }

  updateContextKeys(): void {
    vscode.commands.executeCommand('setContext', 'xcbasic3.emulatorConfigured', this.usableExecutable('emulator') !== undefined);
    vscode.commands.executeCommand('setContext', 'xcbasic3.debuggerConfigured', this.usableExecutable('debugger') !== undefined);
  }

  // ---------------------------------------------------------------------------
  // Picking a tool

  /**
   * Let the user choose the executable for a tool: detected installations, a file dialog,
   * or a typed path. Stores the choice in settings. Returns the launchable executable.
   */
  async pickTool(kind: ToolKind, stepLabel?: string): Promise<string | undefined> {
    const info = TOOLS[kind];
    const current = this.configuredPath(kind);

    for (;;) {
      const detected = detectTools(kind);
      const items: PickItem[] = [];

      const currentExe = resolveExecutable(current);
      if (currentExe && !detected.some(c => c.path === current)) {
        items.push({ label: `$(check) Keep current: ${path.basename(current)}`, detail: current, action: 'use', candidate: { path: current, label: current } });
      }
      for (const c of detected) {
        items.push({
          label: `$(${c.path === current ? 'check' : 'circle-outline'}) ${c.label}`,
          description: c.path === current ? 'current' : undefined,
          detail: c.path,
          action: 'use',
          candidate: c
        });
      }
      if (detected.length === 0 && !currentExe) {
        items.push({ label: `$(info) ${info.product} was not found in the usual places`, action: 'skip', alwaysShow: true, description: 'choose an option below' });
      }
      items.push({ label: '', kind: vscode.QuickPickItemKind.Separator, action: 'skip' });
      items.push({ label: '$(folder-opened) Browse…', description: `locate ${info.product} on this computer`, action: 'browse', alwaysShow: true });
      items.push({ label: '$(edit) Enter path or command…', action: 'manual', alwaysShow: true });
      items.push({ label: `$(cloud-download) Download ${info.product}…`, description: 'opens the download page', action: 'download', alwaysShow: true });
      items.push({ label: '$(close) Skip for now', action: 'skip', alwaysShow: true });

      const picked = await vscode.window.showQuickPick(items, {
        title: `XC=BASIC Setup${stepLabel ? ` ${stepLabel}` : ''}: ${kind === 'emulator' ? 'Emulator' : 'Debugger'}`,
        placeHolder: kind === 'emulator'
          ? 'Which emulator should Compile and Run (Ctrl+F5) start?'
          : 'Which debugger should Compile and Debug (F5) start? Optional.',
        ignoreFocusOut: true,
        matchOnDetail: true
      });
      if (!picked || picked.action === 'skip') return undefined;

      if (picked.action === 'download') {
        vscode.env.openExternal(vscode.Uri.parse(info.downloadUrl));
        continue;
      }

      let value: string | undefined;
      if (picked.action === 'use') {
        value = picked.candidate!.path;
      } else if (picked.action === 'browse') {
        const uris = await vscode.window.showOpenDialog({
          title: info.dialogTitle,
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          openLabel: `Use as ${kind}`,
          defaultUri: defaultDialogUri(current)
        });
        value = uris?.[0]?.fsPath;
        if (!value) continue;
      } else {
        value = await vscode.window.showInputBox({
          title: `${info.product} executable`,
          prompt: 'Full path to the executable, or a command found on PATH',
          value: current,
          ignoreFocusOut: true
        });
        if (value === undefined) continue;
        value = value.trim();
      }

      const exe = resolveExecutable(value);
      if (!exe) {
        const retry = await vscode.window.showErrorMessage(`XC=BASIC: "${value}" is not an executable file.`, 'Choose again');
        if (!retry) return undefined;
        continue;
      }
      await this.storePath(kind, value!);
      this.output.appendLine(`[setup] ${kind} = ${value} (${exe})`);
      return exe;
    }
  }

  /**
   * When nothing is configured for the tool but an installation is found in the usual places,
   * use it without asking. Returns the chosen candidate, or undefined when nothing was changed.
   */
  async autoConfigure(kind: ToolKind): Promise<ToolCandidate | undefined> {
    if (this.configuredPath(kind)) return undefined;
    const detected = detectTools(kind);
    if (!detected.length) return undefined;
    await this.storePath(kind, detected[0].path);
    this.output.appendLine(`[setup] ${kind} = ${detected[0].path} (detected automatically)`);
    return detected[0];
  }

  /** Auto-configure the tool and tell the user once what was picked, with a way to change it. */
  private async autoConfigureAndNotify(kind: ToolKind): Promise<string | undefined> {
    const picked = await this.autoConfigure(kind);
    if (!picked) return undefined;
    vscode.window
      .showInformationMessage(`XC=BASIC: using ${picked.label} as ${kind} (${picked.path}).`, 'Change…')
      .then(choice => {
        if (choice) this.pickTool(kind);
      });
    return resolveExecutable(picked.path);
  }

  /**
   * Used by Run/Debug: returns the tool's executable. A detected installation is used automatically
   * when nothing is configured; otherwise the user is offered to configure it.
   */
  async ensureTool(kind: ToolKind): Promise<string | undefined> {
    const configured = this.configuredPath(kind);
    const exe = resolveExecutable(configured);
    if (exe) return exe;

    if (!configured) {
      const auto = await this.autoConfigureAndNotify(kind);
      if (auto) return auto;
    }

    const info = TOOLS[kind];
    const message = configured
      ? `XC=BASIC: the configured ${kind} was not found: ${configured}`
      : `XC=BASIC: no ${kind} configured yet. ${info.product} is needed to ${kind === 'emulator' ? 'run' : 'debug'} programs.`;
    const choice = await vscode.window.showWarningMessage(message, `Choose ${kind}…`, ...(configured ? [] : [`Download ${info.product}`]));
    if (!choice) return undefined;
    if (choice.startsWith('Download')) {
      vscode.env.openExternal(vscode.Uri.parse(info.downloadUrl));
      return undefined;
    }
    return this.pickTool(kind);
  }

  // ---------------------------------------------------------------------------
  // Target specific emulator

  /**
   * The emulator to start for a compiler target. The configured emulator is used when it fits the target;
   * for other targets the matching VICE program from the same installation is used (x128 for c128, xvic
   * for vic20 ...), with the arguments the machine needs. Prompts when the right emulator cannot be found.
   */
  async launchFor(kind: ToolKind, target: string): Promise<ToolLaunch | undefined> {
    const exe = await this.ensureTool(kind);
    if (!exe) return undefined;
    if (kind === 'debugger') return { exe, args: [] };

    const info = targetInfo(target);
    const base = executableBaseName(exe);
    if (info.emulators.includes(base)) return { exe, args: info.emulatorArgs };
    // Something we do not know (a script, another emulator): the user knows best
    if (!isKnownEmulator(exe)) return { exe, args: [] };

    const found = this.findEmulatorFor(info, exe);
    if (found) {
      this.output.appendLine(`Target ${info.id} (${info.machine}): using ${found} instead of ${path.basename(exe)}`);
      return { exe: found, args: info.emulatorArgs };
    }

    const wanted = info.emulators[0];
    const locate = `Locate ${wanted}…`;
    const anyway = `Use ${base} anyway`;
    const choice = await vscode.window.showWarningMessage(
      `XC=BASIC: target ${info.id} (${info.machine}) runs on ${wanted}, which was not found next to ${base}.`,
      locate,
      anyway
    );
    if (choice === anyway) return { exe, args: [] };
    if (choice !== locate) return undefined;

    const uris = await vscode.window.showOpenDialog({
      title: `Select the ${wanted} executable`,
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: `Use for ${info.id}`,
      defaultUri: defaultDialogUri(exe)
    });
    const picked = uris?.[0]?.fsPath;
    const pickedExe = picked ? resolveExecutable(picked) : undefined;
    if (!picked || !pickedExe) return undefined;
    const located = { ...this.locatedEmulators(), [wanted]: picked };
    await this.context.globalState.update(LOCATED_EMULATORS_KEY, located);
    this.output.appendLine(`[setup] ${wanted} = ${picked} (for target ${info.id})`);
    return { exe: pickedExe, args: info.emulatorArgs };
  }

  private locatedEmulators(): Record<string, string> {
    return this.context.globalState.get<Record<string, string>>(LOCATED_EMULATORS_KEY, {});
  }

  /** Emulator for the target without prompting: located earlier, next to the configured one, or detected. */
  findEmulatorFor(info: ReturnType<typeof targetInfo>, configuredExe: string): string | undefined {
    const located = this.locatedEmulators();
    for (const name of info.emulators) {
      const exe = resolveExecutable(located[name]);
      if (exe) return exe;
    }
    const configured = this.configuredPath('emulator');
    for (const name of info.emulators) {
      const sibling = siblingExecutable(configured, configuredExe, name);
      if (sibling) return sibling;
    }
    const detected = detectTools('emulator').find(c => info.emulators.includes(executableBaseName(c.path)));
    return detected ? resolveExecutable(detected.path) : undefined;
  }

  // ---------------------------------------------------------------------------
  // Wizard

  async wizard(): Promise<void> {
    // Interactive, so the toolchain error (with its fix actions) is shown every time the user runs Setup,
    // not only once per session. The emulator / debugger can be chosen regardless of the toolchain state.
    const ready = await this.toolchain.ensureReady({ interactive: true });

    const emulator = await this.pickTool('emulator', '(1/2)');
    const debuggerExe = await this.pickTool('debugger', '(2/2)');
    await this.context.globalState.update(SETUP_DONE_KEY, true);

    const version = this.toolchain.versionLabel();
    const lines = [
      `Compiler: ${!ready ? 'NOT READY (see the XC=BASIC output)' : version ? `XC=BASIC 3 ${version}` : 'ready'}`,
      `Emulator: ${emulator ? path.basename(this.configuredPath('emulator')) : 'not set'}`,
      `Debugger: ${debuggerExe ? path.basename(this.configuredPath('debugger')) : 'not set'}`
    ];
    const hasBasic = vscode.window.activeTextEditor?.document.languageId === 'xcbasic3';
    const choice = await vscode.window.showInformationMessage(
      `XC=BASIC setup complete. ${lines.join(' · ')}`,
      ...(hasBasic && emulator && ready ? ['Compile and Run'] : []),
      'Open Walkthrough'
    );
    if (choice === 'Compile and Run') {
      vscode.commands.executeCommand('orlof-xcbasic3.XC=BASICRunFile');
    } else if (choice === 'Open Walkthrough') {
      vscode.commands.executeCommand('workbench.action.openWalkthrough', WALKTHROUGH_ID, false);
    }
  }

  /**
   * After installation: pick up VICE / Retro Debugger automatically when they are found, otherwise
   * show a one-time hint. Skipped once the user has been through the wizard (they may have chosen to skip).
   */
  async maybeNudge(): Promise<void> {
    if (this.context.globalState.get<boolean>(SETUP_DONE_KEY)) return;

    if (!this.usableExecutable('emulator')) {
      const emulator = await this.autoConfigure('emulator');
      const debuggerTool = await this.autoConfigure('debugger');
      if (emulator) {
        const parts = [`${emulator.label} as emulator`];
        if (debuggerTool) parts.push(`${debuggerTool.label} as debugger`);
        const choice = await vscode.window.showInformationMessage(
          `XC=BASIC: using ${parts.join(' and ')}. Ctrl+F5 compiles and runs your program.`,
          'Change…'
        );
        if (choice) await this.wizard();
        return;
      }
    } else {
      await this.autoConfigure('debugger');
      return;
    }

    if (this.context.globalState.get<boolean>(NUDGE_DISMISSED_KEY)) return;

    const choice = await vscode.window.showInformationMessage(
      'XC=BASIC: pick your emulator once and Ctrl+F5 will compile and run your program.',
      'Set up now',
      'Later',
      "Don't ask again"
    );
    if (choice === 'Set up now') {
      await this.wizard();
    } else if (choice === "Don't ask again") {
      await this.context.globalState.update(NUDGE_DISMISSED_KEY, true);
    }
  }

  // ---------------------------------------------------------------------------
  // Check Setup

  async check(): Promise<void> {
    const problems: string[] = [];
    const out: string[] = [];
    const ok = (label: string, detail: string) => out.push(`  [OK]      ${label}: ${detail}`);
    const bad = (label: string, detail: string, fix?: string) => {
      out.push(`  [PROBLEM] ${label}: ${detail}${fix ? `\n            -> ${fix}` : ''}`);
      problems.push(`${label}: ${detail}`);
    };
    const note = (label: string, detail: string) => out.push(`  [--]      ${label}: ${detail}`);

    const ext = vscode.extensions.getExtension('RealOrlof.orlof-xcbasic3');
    out.push('XC=BASIC 3 setup check');
    out.push(`  Extension ${ext?.packageJSON?.version ?? '?'}, VS Code ${vscode.version}, ${os.platform()} ${os.arch()}, Node ${process.versions.node}`);

    // Toolchain
    await this.toolchain.ensureReady({ interactive: false }).catch(() => false);
    const t = this.toolchain.report();
    if (!t.platformSupported && t.compilerSource === 'managed') {
      bad('Platform', this.toolchain.unsupportedReason() ?? `${os.platform()} ${os.arch()} is not supported`);
    }
    const rosettaMissing = this.toolchain.rosettaMissing;
    if (rosettaMissing) {
      bad('Rosetta', 'the XC=BASIC 3 and DASM binaries are x64 and need Rosetta on Apple silicon', 'Run: softwareupdate --install-rosetta');
    }
    const cannotRunFix = (dir: string) =>
      os.platform() === 'darwin'
        ? rosettaMissing
          ? 'Install Rosetta: softwareupdate --install-rosetta'
          : 'Open System Settings > Privacy & Security and allow xcbasic3, or run: xattr -dr com.apple.quarantine "' + dir + '"'
        : 'Check file permissions (chmod +x) and antivirus settings';
    if (t.compilerExists && t.compilerPath) {
      const probe = await probeExecutable(t.compilerPath, []);
      if (probe.ok) {
        const v = /version\s+(v?[\d.]+)/i.exec(probe.text);
        ok('Compiler', `${t.compilerPath} (${t.compilerSource}${v ? `, ${v[1]}` : ''})`);
      } else {
        bad('Compiler', `${t.compilerPath} exists but cannot be executed: ${probe.error}`, cannotRunFix(path.dirname(t.compilerPath)));
      }
    } else {
      bad('Compiler', t.compilerPath ? `not found at ${t.compilerPath}` : 'not available', t.lastError ?? 'Run "XC=BASIC: Update Compiler"');
    }
    if (t.compilerSource === 'managed') {
      note('Compiler version', t.selectedVersion === 'latest'
        ? `latest release (${t.activeVersion ?? 'unknown'}), updated automatically`
        : `pinned to ${t.selectedVersion}, no automatic updates`);
      if (t.skippedLatest) {
        note('Skipped release', `${t.skippedLatest.tag} is not used automatically on this platform: ${t.skippedLatest.reason}`);
      }
      if (t.selectedVersion !== 'latest') {
        const reason = brokenReason(t.selectedVersion);
        if (reason) bad('Pinned version', `${t.selectedVersion} is known to be broken on this platform: ${reason}`, 'Run "XC=BASIC: Select Compiler Version" and choose Latest release');
      }
      note('Installed versions', t.installedVersions.length ? t.installedVersions.join(', ') : 'none');
    }
    if (t.dasmExists) {
      const probe = await probeExecutable(t.dasmPath, []);
      if (probe.ok) ok('DASM', t.dasmPath);
      else bad('DASM', `${t.dasmPath} exists but cannot be executed: ${probe.error}`, cannotRunFix(path.dirname(t.dasmPath)));
    } else {
      bad('DASM', `not found at ${t.dasmPath}`, t.lastError ?? 'Run "XC=BASIC: Update Compiler"');
    }
    note('Storage folder', t.storageDir);

    // External tools
    for (const kind of ['emulator', 'debugger'] as ToolKind[]) {
      const configured = this.configuredPath(kind);
      const exe = resolveExecutable(configured);
      const label = kind === 'emulator' ? 'Emulator' : 'Debugger';
      if (exe) {
        ok(label, `${configured}${exe !== configured ? ` -> ${exe}` : ''}`);
      } else if (configured) {
        bad(label, `configured path does not exist or is not executable: ${configured}`, 'Run "XC=BASIC: Setup"');
      } else {
        const found = detectTools(kind);
        if (kind === 'emulator') {
          bad(label, 'not configured', found.length ? `Run "XC=BASIC: Setup" (found ${found[0].detail})` : `Install ${TOOLS[kind].product} and run "XC=BASIC: Setup"`);
        } else {
          note(label, `not configured (optional)${found.length ? `, found ${found[0].detail}` : ''}`);
        }
      }
    }

    // Workspace
    const editor = vscode.window.activeTextEditor;
    const folder = (editor && vscode.workspace.getWorkspaceFolder(editor.document.uri)) || vscode.workspace.workspaceFolders?.[0];
    const config = vscode.workspace.getConfiguration('xcbasic3', folder?.uri);
    if (folder) {
      note('Workspace', folder.uri.fsPath);
      const mainFile = config.get<string>('mainFile', '').trim();
      if (mainFile) {
        const full = path.isAbsolute(mainFile) ? mainFile : path.join(folder.uri.fsPath, mainFile);
        if (fs.existsSync(full)) ok('Main file', full);
        else bad('Main file', `xcbasic3.mainFile points to a missing file: ${full}`);
      } else {
        note('Main file', 'not set, the active editor file is compiled');
      }
      const outputDir = config.get<string>('outputDir', 'build').trim();
      note('Output folder', outputDir ? path.resolve(folder.uri.fsPath, outputDir) : 'next to the source file');

      const info = targetInfo(config.get<string>('target', 'c64'));
      const targetLabel = `${info.id} (${info.machine})`;
      const emulatorExe = this.usableExecutable('emulator');
      if (!emulatorExe) {
        note('Target', targetLabel);
      } else if (info.emulators.includes(executableBaseName(emulatorExe)) || !isKnownEmulator(emulatorExe)) {
        ok('Target', `${targetLabel} runs on ${emulatorExe}`);
      } else {
        const found = this.findEmulatorFor(info, emulatorExe);
        if (found) ok('Target', `${targetLabel} runs on ${found}`);
        else bad('Target', `${targetLabel} needs ${info.emulators[0]}, which was not found next to ${emulatorExe}`,
          `Install the complete VICE package, or choose "Locate ${info.emulators[0]}…" when Compile and Run asks for it`);
      }

      const tasksJson = path.join(folder.uri.fsPath, '.vscode', 'tasks.json');
      const useTasks = config.get<boolean>('useTasksJson', false);
      if (useTasks) {
        if (fs.existsSync(tasksJson)) note('tasks.json', `used for Compile/Run/Debug (xcbasic3.useTasksJson = true): ${tasksJson}`);
        else bad('tasks.json', 'xcbasic3.useTasksJson is enabled but .vscode/tasks.json does not exist', 'Run "XC=BASIC: Initialize tasks.json" or disable the setting');
      } else if (fs.existsSync(tasksJson)) {
        note('tasks.json', 'exists but is not used by the XC=BASIC commands (built-in build is active). Enable xcbasic3.useTasksJson to use it.');
      }
    } else {
      note('Workspace', 'no folder open; output is written next to the source file');
    }

    out.push(problems.length ? `  ${problems.length} problem(s) found.` : '  Everything looks good.');
    this.output.appendLine('');
    this.output.appendLine(out.join('\n'));
    this.output.show(true);

    if (problems.length) {
      const choice = await vscode.window.showWarningMessage(
        `XC=BASIC: ${problems.length} problem(s) found. ${problems[0]}`,
        'Run Setup',
        'Show Output'
      );
      if (choice === 'Run Setup') await this.wizard();
      else if (choice === 'Show Output') this.output.show(false);
    } else {
      vscode.window.showInformationMessage('XC=BASIC: everything looks good.');
    }
  }
}

function defaultDialogUri(current: string): vscode.Uri | undefined {
  if (current) {
    const dir = fs.existsSync(current) ? path.dirname(current) : undefined;
    if (dir) return vscode.Uri.file(dir);
  }
  if (os.platform() === 'darwin') return vscode.Uri.file('/Applications');
  if (os.platform() === 'win32') return vscode.Uri.file(process.env['ProgramFiles'] || 'C:\\Program Files');
  return undefined;
}

function probeExecutable(file: string, args: string[]): Promise<{ ok: boolean; text: string; error?: string }> {
  return new Promise(resolve => {
    try {
      execFile(file, args, { timeout: 8000, windowsHide: true }, (error, stdout, stderr) => {
        const text = `${stdout ?? ''}${stderr ?? ''}`;
        // A non-zero exit code is fine (usage message); failing to start is not
        if (error && (error as NodeJS.ErrnoException).code && typeof (error as NodeJS.ErrnoException).code === 'string') {
          resolve({ ok: false, text, error: `${(error as NodeJS.ErrnoException).code}: ${error.message}` });
        } else if (error && (error as any).signal) {
          resolve({ ok: false, text, error: `killed by ${(error as any).signal}` });
        } else {
          resolve({ ok: true, text });
        }
      });
    } catch (error: any) {
      resolve({ ok: false, text: '', error: error.message });
    }
  });
}
