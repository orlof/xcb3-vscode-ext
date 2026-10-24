// Built-in compile / run / debug. Replaces the tasks.json based build of versions <= 3.0.3.

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawn, ChildProcess } from 'child_process';
import { Toolchain } from './toolchain';
import { parseCompilerOutput, summarize, CompilerMessage } from './compilerOutput';
import { ToolKind, ToolLaunch } from './tools';
import { runTask } from './tasks';

export interface BuildPlan {
  source: string;
  output: string;
  cwd: string;
  folder: vscode.WorkspaceFolder | undefined;
}

export interface BuildResult extends BuildPlan {
  success: boolean;
}

/**
 * Supplied by the setup module: returns the executable (and machine specific arguments) for the tool
 * and compiler target, prompting the user if needed.
 */
export type ToolResolver = (kind: ToolKind, target: string) => Promise<ToolLaunch | undefined>;

const TASK_LABELS: Record<'compile' | 'run' | 'debug', string> = {
  compile: 'XC=BASIC Compile File',
  run: 'XC=BASIC Run File',
  debug: 'XC=BASIC Debug File'
};

export class Runner {
  private running = false;
  /** Emulator / debugger started by the previous Run / Debug, closed before the next one. */
  private readonly launched = new Map<ToolKind, ChildProcess>();

  constructor(
    private readonly toolchain: Toolchain,
    private readonly output: vscode.OutputChannel,
    private readonly diagnostics: vscode.DiagnosticCollection,
    private readonly resolveTool: ToolResolver
  ) {}

  // ---------------------------------------------------------------------------
  // Commands

  async compileCommand(): Promise<void> {
    if (this.useTasksJson()) return runTask(TASK_LABELS.compile);
    await this.compile();
  }

  async runCommand(): Promise<void> {
    if (this.useTasksJson()) return runTask(TASK_LABELS.run);
    await this.compileAndLaunch('emulator');
  }

  async debugCommand(): Promise<void> {
    if (this.useTasksJson()) return runTask(TASK_LABELS.debug);
    await this.compileAndLaunch('debugger');
  }

  private useTasksJson(): boolean {
    return vscode.workspace.getConfiguration('xcbasic3', vscode.window.activeTextEditor?.document).get<boolean>('useTasksJson', false);
  }

  // ---------------------------------------------------------------------------
  // Planning

  /** Decide what to compile and where the .prg goes. Shows a message and returns undefined when it cannot. */
  async plan(): Promise<BuildPlan | undefined> {
    const editor = vscode.window.activeTextEditor;
    const editorDoc = editor?.document;
    const editorIsBasic = editorDoc?.languageId === 'xcbasic3' || (editorDoc && editorDoc.fileName.toLowerCase().endsWith('.bas'));

    let folder = editorDoc ? vscode.workspace.getWorkspaceFolder(editorDoc.uri) : undefined;
    if (!folder) folder = vscode.workspace.workspaceFolders?.[0];

    const config = vscode.workspace.getConfiguration('xcbasic3', folder?.uri ?? editorDoc?.uri);
    const mainFile = config.get<string>('mainFile', '').trim();

    let source: string | undefined;
    if (mainFile) {
      source = path.isAbsolute(mainFile) ? mainFile : path.join(folder?.uri.fsPath ?? path.dirname(editorDoc?.fileName ?? ''), mainFile);
      if (!fs.existsSync(source)) {
        const choice = await vscode.window.showErrorMessage(
          `XC=BASIC: main file not found: ${mainFile}`,
          'Open Settings'
        );
        if (choice) vscode.commands.executeCommand('workbench.action.openSettings', 'xcbasic3.mainFile');
        return undefined;
      }
    } else if (editorDoc && editorIsBasic) {
      if (editorDoc.isUntitled) {
        vscode.window.showWarningMessage('XC=BASIC: save the file before compiling.');
        return undefined;
      }
      source = editorDoc.fileName;
    } else {
      vscode.window.showWarningMessage('XC=BASIC: open a .bas file to compile, or set xcbasic3.mainFile for the project.');
      return undefined;
    }

    // Save unsaved XC=BASIC files so that INCLUDEd files are compiled as seen in the editor
    const dirty = vscode.workspace.textDocuments.filter(d => d.isDirty && !d.isUntitled && d.languageId === 'xcbasic3');
    for (const doc of dirty) {
      await doc.save();
    }

    const sourceDir = path.dirname(source);
    const baseDir = folder?.uri.fsPath ?? sourceDir;
    const outputDir = config.get<string>('outputDir', 'build').trim();
    const outDir = outputDir ? (path.isAbsolute(outputDir) ? outputDir : path.join(baseDir, outputDir)) : sourceDir;
    const output = path.join(outDir, path.basename(source, path.extname(source)) + '.prg');

    return { source, output, cwd: baseDir, folder };
  }

  private configFor(plan: BuildPlan): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('xcbasic3', plan.folder?.uri ?? vscode.Uri.file(plan.source));
  }

  // ---------------------------------------------------------------------------
  // Compile

  async compile(prepared?: BuildPlan): Promise<BuildResult | undefined> {
    if (this.running) {
      vscode.window.showInformationMessage('XC=BASIC: a build is already running.');
      return undefined;
    }
    this.running = true;
    try {
      const plan = prepared ?? (await this.plan());
      if (!plan) return undefined;

      if (!(await this.toolchain.ensureReady())) return undefined;
      const compiler = this.toolchain.compilerPath;
      if (!compiler) return undefined;

      const config = this.configFor(plan);
      const target = config.get<string>('target', 'c64');
      const extraArgs = config.get<string[]>('compilerArgs', []);

      fs.mkdirSync(path.dirname(plan.output), { recursive: true });

      // The compiler hands the output path to DASM through a shell / argument list that does not cope with
      // spaces (xc-basic3 v3.1.13 and v3.2.0 both fail). Compile into a space-free temp folder in that case
      // and move the result afterwards. DASM itself is found through PATH for the same reason (no --dasm=).
      const compileOutput = needsSafePath(plan.output) ? safeTempOutput(plan.output) : plan.output;
      if (compileOutput !== plan.output) {
        this.output.appendLine(`Output path contains spaces, compiling via ${compileOutput}`);
      }

      const args = [`--target=${target}`, ...extraArgs, plan.source, compileOutput];
      this.output.appendLine('');
      this.output.appendLine(`[${new Date().toLocaleTimeString()}] ${path.basename(compiler)} ${args.map(quoteForDisplay).join(' ')}`);

      this.diagnostics.clear();
      const env = withPathPrepended(process.env, path.dirname(this.toolchain.dasmPath));
      let { code, text, spawnError } = await this.spawnCompiler(compiler, args, plan.cwd, env);

      if (compileOutput !== plan.output) {
        try {
          if (code === 0 && fs.existsSync(compileOutput)) {
            fs.copyFileSync(compileOutput, plan.output);
          }
        } catch (error: any) {
          text += `\n** ERROR ** Could not copy ${compileOutput} to ${plan.output}: ${error.message}\n`;
          code = code === 0 ? 1 : code;
        } finally {
          fs.rmSync(path.dirname(compileOutput), { recursive: true, force: true });
        }
      }

      if (spawnError) {
        this.output.appendLine(`Failed to start compiler: ${spawnError.message}`);
        this.output.show(true);
        const choice = await vscode.window.showErrorMessage(
          `XC=BASIC: could not start the compiler (${spawnError.message}).`,
          'Check Setup'
        );
        if (choice) vscode.commands.executeCommand('orlof-xcbasic3.XC=BASICCheckSetup');
        return { ...plan, success: false };
      }

      const messages = parseCompilerOutput(text);
      this.publishDiagnostics(messages, plan);

      if (code !== 0) {
        this.output.show(true);
        const errors = messages.filter(m => m.severity === 'error');
        const detail = errors.length ? summarize(errors) : `compiler exited with code ${code}`;
        const choice = await vscode.window.showErrorMessage(`XC=BASIC: ${detail}`, ...(errors.length ? ['Go to Error'] : []), 'Show Output');
        if (choice === 'Go to Error') await this.revealFirstError(plan);
        if (choice === 'Show Output') this.output.show(false);
        return { ...plan, success: false };
      }

      const shown = plan.folder ? path.relative(plan.folder.uri.fsPath, plan.output) : plan.output;
      vscode.window.setStatusBarMessage(`$(check) XC=BASIC: compiled ${shown}`, 5000);
      return { ...plan, success: true };
    } finally {
      this.running = false;
    }
  }

  private spawnCompiler(compiler: string, args: string[], cwd: string, env: NodeJS.ProcessEnv): Promise<{ code: number | null; text: string; spawnError?: Error }> {
    return new Promise(resolve => {
      let text = '';
      let child;
      try {
        child = spawn(compiler, args, { cwd, windowsHide: true, env });
      } catch (error: any) {
        resolve({ code: null, text, spawnError: error });
        return;
      }
      const onData = (chunk: Buffer) => {
        const s = chunk.toString();
        text += s;
        this.output.append(s);
      };
      child.stdout?.on('data', onData);
      child.stderr?.on('data', onData);
      child.on('error', error => resolve({ code: null, text, spawnError: error }));
      child.on('close', code => {
        if (!text.endsWith('\n')) this.output.appendLine('');
        resolve({ code, text });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Diagnostics

  private resolveMessageFile(file: string | undefined, plan: BuildPlan): string {
    if (!file) return plan.source;
    if (path.isAbsolute(file) && fs.existsSync(file)) return file;
    const candidates = [
      path.resolve(plan.cwd, file),
      path.resolve(path.dirname(plan.source), file),
      ...(plan.folder ? [path.resolve(plan.folder.uri.fsPath, file)] : [])
    ];
    const hit = candidates.find(c => fs.existsSync(c));
    if (hit) return hit;
    if (path.basename(file) === path.basename(plan.source)) return plan.source;
    return plan.source;
  }

  private publishDiagnostics(messages: CompilerMessage[], plan: BuildPlan): void {
    const byFile = new Map<string, vscode.Diagnostic[]>();
    for (const m of messages) {
      const file = this.resolveMessageFile(m.file, plan);
      const line = Math.max(0, m.line - 1);
      const lineText = this.lineText(file, line);
      const start = Math.min(Math.max(0, m.column), Math.max(0, lineText.length - 1));
      // Highlight from the reported column to the end of the token, or the whole line when the column is unknown
      let end = lineText.length;
      if (m.column > 0) {
        const rest = lineText.slice(start);
        const token = /^\S+/.exec(rest);
        end = token ? start + token[0].length : lineText.length;
      }
      const range = new vscode.Range(line, m.column > 0 ? start : 0, line, Math.max(end, start + 1));
      const diag = new vscode.Diagnostic(
        range,
        m.message,
        m.severity === 'warning' ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error
      );
      diag.source = 'xcbasic3';
      const list = byFile.get(file) ?? [];
      list.push(diag);
      byFile.set(file, list);
    }
    for (const [file, list] of byFile) {
      this.diagnostics.set(vscode.Uri.file(file), list);
    }
  }

  private lineText(file: string, line: number): string {
    const open = vscode.workspace.textDocuments.find(d => d.uri.fsPath === file);
    if (open) {
      return line < open.lineCount ? open.lineAt(line).text : '';
    }
    try {
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      return lines[line] ?? '';
    } catch {
      return '';
    }
  }

  private async revealFirstError(plan: BuildPlan): Promise<void> {
    let first: { uri: vscode.Uri; diag: vscode.Diagnostic } | undefined;
    this.diagnostics.forEach((uri, diags) => {
      const error = diags.find(d => d.severity === vscode.DiagnosticSeverity.Error);
      if (error && (!first || uri.fsPath === plan.source)) first = { uri, diag: error };
    });
    if (!first) return;
    const doc = await vscode.workspace.openTextDocument(first.uri);
    const editor = await vscode.window.showTextDocument(doc);
    editor.selection = new vscode.Selection(first.diag.range.start, first.diag.range.start);
    editor.revealRange(first.diag.range, vscode.TextEditorRevealType.InCenter);
  }

  // ---------------------------------------------------------------------------
  // Launch

  private async compileAndLaunch(kind: ToolKind): Promise<void> {
    const plan = await this.plan();
    if (!plan) return;
    const config = this.configFor(plan);

    // Resolve the tool first so that a missing emulator is reported before a long compile
    const tool = await this.resolveTool(kind, config.get<string>('target', 'c64'));
    if (!tool) return;

    const result = await this.compile(plan);
    if (!result || !result.success) return;

    const extraArgs = config.get<string[]>(kind === 'emulator' ? 'emulatorArgs' : 'debuggerArgs', []);
    const args = [...tool.args, ...extraArgs, result.output];

    if (config.get<boolean>('restartEmulator', true)) this.closePrevious(kind);

    this.output.appendLine(`Launching ${kind}: ${quoteForDisplay(tool.exe)} ${args.map(quoteForDisplay).join(' ')}`);
    try {
      const child = spawn(tool.exe, args, {
        cwd: path.dirname(result.output),
        detached: true,
        stdio: 'ignore',
        windowsHide: false
      });
      child.on('error', async (error: Error) => {
        this.output.appendLine(`Failed to launch ${kind}: ${error.message}`);
        const choice = await vscode.window.showErrorMessage(`XC=BASIC: could not start the ${kind} (${error.message}).`, 'Run Setup');
        if (choice) vscode.commands.executeCommand('orlof-xcbasic3.XC=BASICSetup');
      });
      child.on('exit', () => {
        if (this.launched.get(kind) === child) this.launched.delete(kind);
      });
      child.unref();
      this.launched.set(kind, child);
    } catch (error: any) {
      vscode.window.showErrorMessage(`XC=BASIC: could not start the ${kind} (${error.message}).`);
    }
  }

  /** Close the emulator / debugger started by the previous run so that only the new build is on screen. */
  private closePrevious(kind: ToolKind): void {
    const previous = this.launched.get(kind);
    this.launched.delete(kind);
    if (!previous || previous.exitCode !== null || previous.killed) return;
    try {
      if (previous.kill()) this.output.appendLine(`Closed previous ${kind} (pid ${previous.pid})`);
    } catch (error: any) {
      this.output.appendLine(`Could not close previous ${kind}: ${error.message}`);
    }
  }
}

function quoteForDisplay(arg: string): string {
  return /\s/.test(arg) ? `"${arg}"` : arg;
}

/** True when a path would be mangled by the compiler's unquoted / double-quoted DASM invocation. */
export function needsSafePath(p: string): boolean {
  return /[\s'"`$&;|<>()]/.test(p);
}

/** A temp location for the .prg, in a folder without problematic characters; undefined-safe fallback is the original. */
function safeTempOutput(finalOutput: string): string {
  const tmpRoot = os.tmpdir();
  if (needsSafePath(tmpRoot)) return finalOutput;
  const dir = fs.mkdtempSync(path.join(tmpRoot, 'xcbasic3-'));
  const name = path.basename(finalOutput);
  return path.join(dir, needsSafePath(name) ? 'out.prg' : name);
}

/** Copy of env with dir first on PATH. Handles the Windows "Path" spelling. */
export function withPathPrepended(env: NodeJS.ProcessEnv, dir: string): NodeJS.ProcessEnv {
  const copy: NodeJS.ProcessEnv = { ...env };
  const key = Object.keys(copy).find(k => k.toUpperCase() === 'PATH') ?? 'PATH';
  const current = copy[key] ?? '';
  const parts = current.split(path.delimiter);
  copy[key] = parts[0] === dir ? current : `${dir}${path.delimiter}${current}`;
  return copy;
}
