import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import axios from 'axios';
import AdmZip = require('adm-zip');
import * as tar from 'tar';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

// Constants
const tasks = ['XC=BASIC Run File', 'XC=BASIC Debug File', 'XC=BASIC Compile File'];
const releasesUrl = 'https://api.github.com/repos/neilsf/xc-basic3/releases/latest';
const binDir = path.join(__dirname, '..', 'bin');
const compilerRootDir = path.join(binDir, 'xcbasic3');
// Older extension versions extracted the repository's main branch here
const legacyCompilerRootDir = path.join(binDir, 'xc-basic3-main');

// Release asset names are e.g. xcbasic3-v3.2.0-macOS.zip
const compilerPlatforms: { [key: string]: string } = {
  'darwin': 'macOS',
  'win32': 'Windows',
  'linux': 'Linux'
};

interface ReleaseInfo {
  version: string;
  assets: { name: string; browser_download_url: string }[];
}

const dasmVersion = '2.20.14.1';
const dasmPlatforms: { [key: string]: string } = {
  'darwin': 'osx-x64',
  'win32': 'win-x64',
  'linux': 'linux-x64'
};
const dasmExecutables: { [key: string]: string } = {
  'darwin': 'dasm',
  'win32': 'dasm.exe',
  'linux': 'dasm'
};
const dasmUrls: { [key: string]: string } = {
  'darwin': 'https://github.com/dasm-assembler/dasm/releases/download/2.20.14.1/dasm-2.20.14.1-osx-x64.tar.gz',
  'win32': 'https://github.com/dasm-assembler/dasm/releases/download/2.20.14.1/dasm-2.20.14.1-win-x64.zip',
  'linux': 'https://github.com/dasm-assembler/dasm/releases/download/2.20.14.1/dasm-2.20.14.1-linux-x64.tar.gz'
};

function getDasmId(platform: string): string {
  const dasmPlatform = dasmPlatforms[platform];
  return `dasm-${dasmVersion}-${dasmPlatform}`;
}

function getDasmPath(): string | null {
  const platform = os.platform();
  const dasmId = getDasmId(platform);
  const dasmExecutable = dasmExecutables[platform];

  if (!dasmId || !dasmExecutable) {
    vscode.window.showErrorMessage('Unsupported OS');
    return null;
  }

  return path.join(binDir, dasmId, dasmExecutable);
}

function getCompilerPath(): string | null {
  const platformPaths: { [key: string]: string } = {
    'darwin': path.join(compilerRootDir, 'bin', 'macOS', 'xcbasic3'),
    'win32': path.join(compilerRootDir, 'bin', 'Windows', 'xcbasic3.exe'),
    'linux': path.join(compilerRootDir, 'bin', 'Linux', 'xcbasic3')
  };
  const compilerPath = platformPaths[os.platform()];
  if (!compilerPath) {
    vscode.window.showErrorMessage('Unsupported OS');
  }
  return compilerPath;
}

async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const response = await axios.get(releasesUrl, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    return { version: response.data.tag_name, assets: response.data.assets || [] };
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to fetch the latest version: ${error.message}`);
    return null;
  }
}

function getLocalVersion(): string | null {
  const versionFilePath = path.join(compilerRootDir, 'version.txt');
  const compilerPath = getCompilerPath();
  if (fs.existsSync(versionFilePath) && compilerPath && fs.existsSync(compilerPath)) {
    return fs.readFileSync(versionFilePath, 'utf8').trim();
  }
  return null;
}

function saveLocalVersion(version: string): void {
  const versionFilePath = path.join(compilerRootDir, 'version.txt');
  fs.writeFileSync(versionFilePath, version);
}

async function updateCompiler(release: ReleaseInfo): Promise<boolean> {
  const platformName = compilerPlatforms[os.platform()];
  if (!platformName) {
    vscode.window.showErrorMessage('Unsupported OS');
    return false;
  }

  const asset = release.assets.find(a => a.name.endsWith(`-${platformName}.zip`));
  if (!asset) {
    vscode.window.showErrorMessage(`XC=BASIC3 release ${release.version} has no download for ${platformName}`);
    return false;
  }

  try {
    const response = await axios({
      url: asset.browser_download_url,
      method: 'GET',
      responseType: 'arraybuffer'
    });

    // Extract to a temporary directory first so a failed download keeps the old compiler
    const tmpDir = path.join(binDir, 'xcbasic3-download');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }
    const zip = new AdmZip(Buffer.from(response.data));
    zip.extractAllTo(tmpDir, true);

    // The zip contains a single top-level folder, e.g. xcbasic3-v3.2.0-macOS/
    const entries = fs.readdirSync(tmpDir);
    const extractedRoot = entries.length === 1 && fs.statSync(path.join(tmpDir, entries[0])).isDirectory()
      ? path.join(tmpDir, entries[0])
      : tmpDir;

    for (const dir of [compilerRootDir, legacyCompilerRootDir]) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
      }
    }
    fs.renameSync(extractedRoot, compilerRootDir);
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }

    const compilerPath = getCompilerPath();
    if (!compilerPath || !fs.existsSync(compilerPath)) {
      vscode.window.showErrorMessage(`XC=BASIC3 compiler not found after extraction: ${compilerPath}`);
      return false;
    }

    // Zip extraction does not keep the executable bit
    if (os.platform() === 'darwin' || os.platform() === 'linux') {
      fs.chmodSync(compilerPath, '755');
    }

    saveLocalVersion(release.version);
    return true;
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to update compiler: ${error.message}`);
    return false;
  }
}

async function ensureCompilerIsLatest(): Promise<void> {
  const release = await fetchLatestRelease();
  if (!release) {
    vscode.window.showErrorMessage('Could not fetch the latest version of XC=BASIC3 due to network issues.');
    return;
  }

  const localVersion = getLocalVersion();
  if (localVersion !== release.version) {
    if (await updateCompiler(release)) {
      vscode.window.showInformationMessage(`XC=BASIC3 updated to version ${release.version}`);
    }
  } else {
    console.log('XC=BASIC3 is already up to date');
    vscode.window.showInformationMessage(`XC=BASIC3 version ${localVersion} is up to date`);
  }
}

async function ensureDasmIsAvailable(): Promise<void> {
  const dasmPath = getDasmPath();
  if (!dasmPath) return;

  try {
    await fs.promises.access(dasmPath);
    console.log(`dasm already exists at ${dasmPath}`);
  } catch (error) {
    const platform = os.platform();
    const dasmUrl = dasmUrls[platform];
    if (!dasmUrl) {
      vscode.window.showErrorMessage('Unsupported OS for dasm');
      return;
    }

    try {
      const response = await axios({
        url: dasmUrl,
        method: 'GET',
        responseType: 'arraybuffer'
      });

      const dasmId = getDasmId(platform);

      if (dasmUrl.endsWith('.zip')) {
        const zip = new AdmZip(response.data);
        zip.extractAllTo(path.join(binDir, dasmId), true);
        vscode.window.showInformationMessage(`${dasmId} downloaded`);
      } else if (dasmUrl.endsWith('.tar.gz')) {
        const tarStream = new (require('stream').PassThrough)();
        tarStream.end(response.data);
        const dasmDir = path.dirname(dasmPath);
        fs.mkdirSync(dasmDir, { recursive: true });
        tarStream.pipe(tar.x({ C: dasmDir })).on('finish', () => {
          // Set executable permission for the dasm file if on Unix-like system
          if (platform === 'darwin' || platform === 'linux') {
            fs.chmodSync(dasmPath, '755');
          }
          vscode.window.showInformationMessage(`${dasmId} downloaded`);
        });
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to download and extract dasm: ${error.message}`);
    }
  }
}

function initializeTasks(context: vscode.ExtensionContext): void {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    // Define the path to the .vscode directory, tasks.json and tasks.json template
    const vscodeDirPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
    const tasksPath = path.join(vscodeDirPath, 'tasks.json');
    const defaultTasksPath = path.join(context.extensionPath, 'templates', 'tasks.json');

    // Check if the .vscode directory exists, and create it if it doesn't
    if (!fs.existsSync(vscodeDirPath)) {
      fs.mkdirSync(vscodeDirPath, { recursive: true });
    }

    // Copy the default tasks.json to the .vscode directory if it doesn't exist
    if (!fs.existsSync(tasksPath)) {
      fs.copyFileSync(defaultTasksPath, tasksPath);
      vscode.window.showInformationMessage('Initialized: .vscode/tasks.json');
    }
  } else {
    vscode.window.showErrorMessage('No workspace folder found.');
  }
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('XC=BASIC3 extension is now active!');

  // Start the language server
  const serverModule = context.asAbsolutePath(path.join('dist', 'server', 'server.js'));
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'xcbasic3' }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
    }
  };

  client = new LanguageClient(
    'xcbasic3LanguageServer',
    'XC=BASIC3 Language Server',
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();

  // Ensure the compiler is the latest version when the extension is activated
  try {
    await ensureCompilerIsLatest();
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error ensuring XC=BASIC3 is the latest version: ${error.message}`);
  }

  // Ensure dasm is available
  try {
    await ensureDasmIsAvailable();
  } catch (error: any) {
    vscode.window.showErrorMessage(`Error ensuring dasm is available: ${error.message}`);
  }

  // Set the environment variables for the extension
  const compilerPath = getCompilerPath();
  const dasmPath = getDasmPath();
  if (compilerPath && dasmPath) {
    // Inject xcbasic3 to environment variables
    process.env.XCBASIC3_COMPILER = compilerPath;

    // Set DASM_PATH environment variable for the --dasm parameter
    process.env.DASM_PATH = dasmPath;

    // Inject dasm to the PATH (keep for backward compatibility)
    process.env.PATH = `${path.dirname(dasmPath)}${path.delimiter}${process.env.PATH}`;
  }

  // Register the XC=BASICUpdate command
  let updateDisposable = vscode.commands.registerCommand('orlof-xcbasic3.XC=BASICUpdate', function () {
    ensureCompilerIsLatest();
  });
  context.subscriptions.push(updateDisposable);

  // Automatically initialize tasks if tasks.json doesn't exist
  initializeTasks(context);

  // Register the XC=BASICInitialize command
  let initializeDisposable = vscode.commands.registerCommand('orlof-xcbasic3.XC=BASICInitialize', function () {
    initializeTasks(context);
  });
  context.subscriptions.push(initializeDisposable);

  // Register commands for each task
  tasks.forEach(task => {
    let commandName = `orlof-xcbasic3.${task.replace(/\s+/g, '')}`;
    let disposable = vscode.commands.registerCommand(commandName, () => {
      vscode.tasks.fetchTasks().then(tasks => {
        let myTask = tasks.find(t => t.name === task);
        if (myTask) {
          vscode.tasks.executeTask(myTask);
        } else {
          vscode.window.showErrorMessage(`Task "${task}" not found`);
        }
      });
    });

    context.subscriptions.push(disposable);
  });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
