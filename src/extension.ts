import * as vscode from 'vscode';
import * as path from 'path';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

import { Toolchain } from './toolchain';
import { Runner } from './runner';
import { Setup } from './setup';
import { StatusBar } from './statusbar';
import { initializeTasks, maybeOfferLegacyTasks } from './tasks';
import { selectCompilerVersion } from './versions';
import { newProject, openPendingFile } from './project';

let client: LanguageClient | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel('XC=BASIC');
  const diagnostics = vscode.languages.createDiagnosticCollection('xcbasic3');
  context.subscriptions.push(output, diagnostics);

  startLanguageServer(context, output);

  const toolchain = new Toolchain(context, output);
  const setup = new Setup(context, toolchain, output);
  const runner = new Runner(toolchain, output, diagnostics, (kind, target) => setup.launchFor(kind, target));
  const statusBar = new StatusBar(toolchain, setup);
  context.subscriptions.push(toolchain, statusBar);

  const register = (id: string, handler: (...args: any[]) => any) =>
    context.subscriptions.push(vscode.commands.registerCommand(id, handler));

  register('orlof-xcbasic3.XC=BASICCompileFile', () => runner.compileCommand());
  register('orlof-xcbasic3.XC=BASICRunFile', () => runner.runCommand());
  register('orlof-xcbasic3.XC=BASICDebugFile', () => runner.debugCommand());
  register('orlof-xcbasic3.XC=BASICSetup', () => setup.wizard());
  register('orlof-xcbasic3.XC=BASICCheckSetup', () => setup.check());
  register('orlof-xcbasic3.XC=BASICUpdate', () => toolchain.ensureReady({ forceUpdateCheck: true, interactive: true }));
  register('orlof-xcbasic3.XC=BASICSelectVersion', () => selectCompilerVersion(toolchain));
  register('orlof-xcbasic3.XC=BASICShowOutput', () => output.show(false));
  register('orlof-xcbasic3.XC=BASICMenu', () => statusBar.showMenu());
  register('orlof-xcbasic3.XC=BASICInitialize', () => initializeTasks(context));
  register('orlof-xcbasic3.XC=BASICNewProject', () => newProject(context));

  // For tasks.json: "${command:orlof-xcbasic3.compilerPath}" / "${command:orlof-xcbasic3.dasmPath}".
  // (${env:...} in tasks.json is resolved from VS Code's own environment, which an extension cannot change.)
  register('orlof-xcbasic3.compilerPath', async () => {
    await toolchain.ensureReady();
    return toolchain.compilerPath ?? '';
  });
  register('orlof-xcbasic3.dasmPath', async () => {
    await toolchain.ensureReady();
    return toolchain.dasmPath;
  });

  // A project created by "New Project" in another window: open its main program
  openPendingFile(context).catch(error => output.appendLine(`[project] ${error?.message ?? error}`));

  // Context keys drive the walkthrough and menus
  setup.updateContextKeys();
  context.subscriptions.push(
    toolchain.onDidChangeStatus(status => vscode.commands.executeCommand('setContext', 'xcbasic3.toolchainReady', status === 'ready')),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('xcbasic3.emulator') || e.affectsConfiguration('xcbasic3.debugger')) {
        setup.updateContextKeys();
      }
      if (e.affectsConfiguration('xcbasic3.basefolder') || e.affectsConfiguration('xcbasic3.compilerVersion')) {
        toolchain.ensureReady();
      }
    }),
    // Clear stale compile errors for a file when it is edited
    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.languageId === 'xcbasic3' && e.contentChanges.length && diagnostics.has(e.document.uri)) {
        diagnostics.delete(e.document.uri);
      }
    })
  );

  // Download / update the toolchain in the background; never block activation
  toolchain
    .ensureReady()
    .then(async ready => {
      await maybeOfferLegacyTasks(context);
      if (ready) await setup.maybeNudge();
    })
    .catch(error => output.appendLine(`[toolchain] unexpected error: ${error?.message ?? error}`));
}

function startLanguageServer(context: vscode.ExtensionContext, output: vscode.OutputChannel): void {
  const serverModule = context.asAbsolutePath(path.join('dist', 'server', 'server.js'));
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'xcbasic3' }]
  };

  client = new LanguageClient('xcbasic3LanguageServer', 'XC=BASIC3 Language Server', serverOptions, clientOptions);
  context.subscriptions.push(client);
  client.start().catch(error => {
    output.appendLine(`[language server] failed to start: ${error?.message ?? error}`);
  });
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
