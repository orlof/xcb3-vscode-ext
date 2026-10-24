// "XC=BASIC: New Project": creates a folder with a main program and workspace settings, then opens it.

import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { TARGETS } from './tools';

/** File to open when the new project's window starts (globalState, shared between windows). */
const OPEN_ON_START_KEY = 'xcbasic3.openOnStart';
const OPEN_ON_START_MAX_AGE_MS = 10 * 60 * 1000;

interface OpenOnStart {
  file: string;
  time: number;
}

const MAIN_BAS = `' main.bas - created by the XC=BASIC 3 extension
' Ctrl+F5 (Cmd+F5 on macOS): compile and run    Shift+F5: compile    F5: debug

DIM i AS BYTE

SUB say_hello(n AS BYTE) STATIC
    PRINT "HELLO FROM XC=BASIC 3! #"; n
END SUB

FOR i = 1 TO 5
    CALL say_hello(i)
NEXT i
`;

export async function newProject(context: vscode.ExtensionContext): Promise<void> {
  const name = await vscode.window.showInputBox({
    title: 'New XC=BASIC 3 Project (1/3): name',
    prompt: 'Folder name of the new project',
    value: 'hello',
    ignoreFocusOut: true,
    validateInput: value => {
      const v = value.trim();
      if (!v) return 'Enter a name';
      if (!/^[A-Za-z0-9._-]+$/.test(v)) return 'Use letters, digits, dot, dash and underscore only';
      return undefined;
    }
  });
  if (!name) return;

  const target = await vscode.window.showQuickPick(
    TARGETS.map(t => ({ label: t.id, description: t.machine, id: t.id })),
    { title: 'New XC=BASIC 3 Project (2/3): target machine', placeHolder: 'c64 is the usual choice; can be changed later in xcbasic3.target', ignoreFocusOut: true }
  );
  if (!target) return;

  const parents = await vscode.window.showOpenDialog({
    title: `New XC=BASIC 3 Project (3/3): where to create the "${name.trim()}" folder`,
    canSelectFolders: true,
    canSelectFiles: false,
    canSelectMany: false,
    openLabel: 'Create project here',
    defaultUri: defaultParent()
  });
  const parent = parents?.[0]?.fsPath;
  if (!parent) return;

  const dir = path.join(parent, name.trim());
  try {
    if (fs.existsSync(dir) && fs.readdirSync(dir).length > 0) {
      vscode.window.showErrorMessage(`XC=BASIC: the folder already exists and is not empty: ${dir}`);
      return;
    }
    fs.mkdirSync(path.join(dir, '.vscode'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'main.bas'), MAIN_BAS);
    fs.writeFileSync(
      path.join(dir, '.vscode', 'settings.json'),
      JSON.stringify({ 'xcbasic3.mainFile': 'main.bas', 'xcbasic3.target': target.id }, null, 4) + '\n'
    );
    fs.writeFileSync(path.join(dir, '.gitignore'), 'build/\n');
  } catch (error: any) {
    vscode.window.showErrorMessage(`XC=BASIC: could not create the project: ${error.message}`);
    return;
  }

  const mainFile = path.join(dir, 'main.bas');
  const folderUri = vscode.Uri.file(dir);
  if (vscode.workspace.getWorkspaceFolder(vscode.Uri.file(mainFile))) {
    // Created inside the current workspace: just open the file
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(mainFile));
    return;
  }

  // Opening a folder restarts the extension host (or opens a new window); open main.bas from there
  const pending: OpenOnStart = { file: mainFile, time: Date.now() };
  await context.globalState.update(OPEN_ON_START_KEY, pending);
  const hasWorkspace = (vscode.workspace.workspaceFolders?.length ?? 0) > 0;
  await vscode.commands.executeCommand('vscode.openFolder', folderUri, { forceNewWindow: hasWorkspace });
}

/** Called on activation: open the main program of a project created by newProject just before. */
export async function openPendingFile(context: vscode.ExtensionContext): Promise<void> {
  const pending = context.globalState.get<OpenOnStart>(OPEN_ON_START_KEY);
  if (!pending) return;
  if (Date.now() - pending.time > OPEN_ON_START_MAX_AGE_MS) {
    await context.globalState.update(OPEN_ON_START_KEY, undefined);
    return;
  }
  const uri = vscode.Uri.file(pending.file);
  if (!vscode.workspace.getWorkspaceFolder(uri)) return; // another window
  await context.globalState.update(OPEN_ON_START_KEY, undefined);
  if (!fs.existsSync(pending.file)) return;
  await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri), { preview: false });
}

function defaultParent(): vscode.Uri {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (folder) return vscode.Uri.file(path.dirname(folder.uri.fsPath));
  return vscode.Uri.file(os.homedir());
}
