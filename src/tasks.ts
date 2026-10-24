// Optional tasks.json support for advanced users (xcbasic3.useTasksJson).

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function runTask(label: string): Promise<void> {
  const tasks = await vscode.tasks.fetchTasks();
  const task = tasks.find(t => t.name === label);
  if (task) {
    await vscode.tasks.executeTask(task);
    return;
  }
  const choice = await vscode.window.showErrorMessage(
    `XC=BASIC: task "${label}" not found in .vscode/tasks.json.`,
    'Initialize tasks.json',
    'Use built-in build'
  );
  if (choice === 'Initialize tasks.json') {
    vscode.commands.executeCommand('orlof-xcbasic3.XC=BASICInitialize');
  } else if (choice === 'Use built-in build') {
    await vscode.workspace.getConfiguration('xcbasic3').update('useTasksJson', false, vscode.ConfigurationTarget.Workspace);
  }
}

const LEGACY_TASKS_ASKED_KEY = 'xcbasic3.legacyTasksAsked';

/**
 * Projects opened with extension <= 3.0.3 got a generated .vscode/tasks.json that the keybindings used to run.
 * The built-in build now ignores it. Ask once per workspace which one to use, so customised tasks are not
 * silently dropped.
 */
export async function maybeOfferLegacyTasks(context: vscode.ExtensionContext): Promise<void> {
  const folders = vscode.workspace.workspaceFolders ?? [];
  if (folders.length === 0) return;
  if (context.workspaceState.get<boolean>(LEGACY_TASKS_ASKED_KEY)) return;

  const config = vscode.workspace.getConfiguration('xcbasic3', folders[0].uri);
  const info = config.inspect<boolean>('useTasksJson');
  const explicitlySet =
    info?.globalValue !== undefined || info?.workspaceValue !== undefined || info?.workspaceFolderValue !== undefined;
  if (explicitlySet) return;

  const folder = folders.find(f => hasXcbasicTasks(path.join(f.uri.fsPath, '.vscode', 'tasks.json')));
  if (!folder) return;

  await context.workspaceState.update(LEGACY_TASKS_ASKED_KEY, true);

  const useTasks = 'Keep using tasks.json';
  const useBuiltin = 'Use built-in build';
  const choice = await vscode.window.showInformationMessage(
    'XC=BASIC: this workspace has XC=BASIC tasks in .vscode/tasks.json from an earlier version. ' +
      'Shift+F5 / Ctrl+F5 / F5 now use the built-in build (output in the "build" folder) and ignore those tasks. ' +
      'Which one do you want for this workspace?',
    useTasks,
    useBuiltin
  );
  if (choice === useTasks) {
    await config.update('useTasksJson', true, vscode.ConfigurationTarget.Workspace);
  } else if (choice === useBuiltin) {
    await config.update('useTasksJson', false, vscode.ConfigurationTarget.Workspace);
  }
}

function hasXcbasicTasks(tasksPath: string): boolean {
  try {
    if (!fs.existsSync(tasksPath)) return false;
    const text = fs.readFileSync(tasksPath, 'utf8');
    return /"label"\s*:\s*"XC=BASIC (Compile|Run|Debug) File"/.test(text);
  } catch {
    return false;
  }
}

export async function initializeTasks(context: vscode.ExtensionContext): Promise<void> {
  const folder = vscode.window.activeTextEditor
    ? vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri) ?? vscode.workspace.workspaceFolders?.[0]
    : vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    vscode.window.showErrorMessage('XC=BASIC: open a folder first.');
    return;
  }

  const vscodeDir = path.join(folder.uri.fsPath, '.vscode');
  const tasksPath = path.join(vscodeDir, 'tasks.json');
  const template = path.join(context.extensionPath, 'templates', 'tasks.json');

  if (fs.existsSync(tasksPath)) {
    const choice = await vscode.window.showWarningMessage(
      'XC=BASIC: .vscode/tasks.json already exists.',
      { modal: true },
      'Overwrite',
      'Open'
    );
    if (choice === 'Open') {
      await vscode.window.showTextDocument(vscode.Uri.file(tasksPath));
      return;
    }
    if (choice !== 'Overwrite') return;
  }

  fs.mkdirSync(vscodeDir, { recursive: true });
  fs.copyFileSync(template, tasksPath);

  const config = vscode.workspace.getConfiguration('xcbasic3', folder.uri);
  const choice = await vscode.window.showInformationMessage(
    'XC=BASIC: created .vscode/tasks.json. Enable "xcbasic3.useTasksJson" to make Ctrl+F5 / F5 / Shift+F5 run these tasks instead of the built-in build.',
    'Enable for this workspace',
    'Open tasks.json'
  );
  if (choice === 'Enable for this workspace') {
    await config.update('useTasksJson', true, vscode.ConfigurationTarget.Workspace);
  } else if (choice === 'Open tasks.json') {
    await vscode.window.showTextDocument(vscode.Uri.file(tasksPath));
  }
}
