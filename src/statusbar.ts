// Status bar item showing toolchain state, with a quick menu on click.

import * as vscode from 'vscode';
import * as path from 'path';
import { Toolchain } from './toolchain';
import { Setup, WALKTHROUGH_ID } from './setup';

export class StatusBar implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(private readonly toolchain: Toolchain, private readonly setup: Setup) {
    this.item = vscode.window.createStatusBarItem('xcbasic3.status', vscode.StatusBarAlignment.Left, 50);
    this.item.name = 'XC=BASIC 3';
    this.item.command = 'orlof-xcbasic3.XC=BASICMenu';
    this.disposables.push(
      this.item,
      toolchain.onDidChangeStatus(() => this.refresh()),
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('xcbasic3')) this.refresh();
      })
    );
    this.refresh();
    this.item.show();
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose());
  }

  refresh(): void {
    const emulator = this.setup.configuredPath('emulator');
    const emulatorOk = this.setup.usableExecutable('emulator') !== undefined;
    const version = this.toolchain.versionLabel();
    const pinned = this.toolchain.selectedVersion !== 'latest';
    const versionText = version ? ` ${version}${pinned ? ' $(pinned)' : ''}` : '';
    this.item.backgroundColor = undefined;

    switch (this.toolchain.status) {
      case 'checking':
        this.item.text = '$(sync~spin) XC=BASIC';
        this.item.tooltip = 'Checking for compiler updates…';
        break;
      case 'downloading':
        this.item.text = '$(cloud-download) XC=BASIC: downloading…';
        this.item.tooltip = 'Downloading compiler / assembler';
        break;
      case 'error':
        this.item.text = '$(error) XC=BASIC';
        this.item.tooltip = `${this.toolchain.lastError ?? 'Toolchain error'}\n\nClick for options`;
        this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
      case 'ready':
        if (emulatorOk) {
          this.item.text = `$(check) XC=BASIC${versionText}`;
          const skipped = !pinned ? this.toolchain.skippedLatest : undefined;
          this.item.tooltip =
            `XC=BASIC 3 compiler ${version ?? ''}${pinned ? ' (pinned)' : ' (latest release)'}` +
            (skipped ? `\n${skipped.tag} skipped on this platform: ${skipped.reason}` : '') +
            `\nEmulator: ${path.basename(emulator)}\n\nCtrl+F5 compile and run · F5 debug · Shift+F5 compile\nClick for menu`;
        } else {
          this.item.text = `$(warning) XC=BASIC${versionText}: setup`;
          this.item.tooltip = emulator
            ? `Configured emulator not found: ${emulator}\nClick to fix`
            : 'No emulator configured. Click to set up.';
          this.item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        break;
      default:
        this.item.text = 'XC=BASIC';
        this.item.tooltip = 'XC=BASIC 3';
    }
  }

  async showMenu(): Promise<void> {
    interface Item extends vscode.QuickPickItem { command?: string; args?: any[] }
    const emulatorOk = this.setup.usableExecutable('emulator') !== undefined;
    const items: Item[] = [];

    if (this.toolchain.status === 'error') {
      items.push({ label: '$(error) ' + (this.toolchain.lastError ?? 'Toolchain error'), detail: 'Retry download', command: 'orlof-xcbasic3.XC=BASICUpdate' });
    }
    if (!emulatorOk) {
      items.push({ label: '$(warning) Set up emulator', detail: 'Needed for Compile and Run', command: 'orlof-xcbasic3.XC=BASICSetup' });
    }
    items.push(
      { label: '$(tools) Compile File', description: 'Shift+F5', command: 'orlof-xcbasic3.XC=BASICCompileFile' },
      { label: '$(play) Compile and Run', description: 'Ctrl+F5', command: 'orlof-xcbasic3.XC=BASICRunFile' },
      { label: '$(debug-alt) Compile and Debug', description: 'F5', command: 'orlof-xcbasic3.XC=BASICDebugFile' },
      { label: '', kind: vscode.QuickPickItemKind.Separator },
      { label: '$(new-folder) New Project…', detail: 'Create a folder with main.bas and project settings', command: 'orlof-xcbasic3.XC=BASICNewProject' },
      { label: '$(gear) Setup', detail: 'Find emulator and debugger', command: 'orlof-xcbasic3.XC=BASICSetup' },
      { label: '$(checklist) Check Setup', command: 'orlof-xcbasic3.XC=BASICCheckSetup' },
      { label: '$(settings) Open Settings', command: 'workbench.action.openSettings', args: ['xcbasic3'] },
      { label: '$(versions) Select Compiler Version', description: this.toolchain.selectedVersion === 'latest' ? `latest (${this.toolchain.activeVersion ?? '?'})` : `pinned to ${this.toolchain.selectedVersion}`, command: 'orlof-xcbasic3.XC=BASICSelectVersion' },
      { label: '$(cloud-download) Update Compiler', description: this.toolchain.selectedVersion === 'latest' ? 'check for a new release now' : 'disabled while pinned', command: 'orlof-xcbasic3.XC=BASICUpdate' },
      { label: '$(output) Show Output', command: 'orlof-xcbasic3.XC=BASICShowOutput' },
      { label: '$(book) Getting Started', command: 'workbench.action.openWalkthrough', args: [WALKTHROUGH_ID, false] }
    );

    const picked = await vscode.window.showQuickPick(items, { title: 'XC=BASIC 3', placeHolder: 'Choose an action' });
    if (picked?.command) {
      vscode.commands.executeCommand(picked.command, ...(picked.args ?? []));
    }
  }
}
