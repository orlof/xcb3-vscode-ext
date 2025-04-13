const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const AdmZip = require('adm-zip');
const tar = require('tar');

// Constants
const tasks = ['XC=BASIC Run File', 'XC=BASIC Debug File', 'XC=BASIC Compile File'];
const compilerUrl = 'https://github.com/neilsf/xc-basic3/archive/refs/heads/main.zip';
const releasesUrl = 'https://api.github.com/repos/neilsf/xc-basic3/releases/latest';
const binDir = path.join(__dirname, 'bin');
const compilerRootDir = path.join(binDir, 'xc-basic3-main');

const dasmVersion = '2.20.14.1';
const dasmPlatforms = {
    'darwin': 'osx-x64',
    'win32': 'win-x64',
    'linux': 'linux-x64'
};
const dasmExecutables = {
    'darwin': 'dasm',
    'win32': 'dasm.exe',
    'linux': 'dasm'
};
const dasmUrls = {
    'darwin': 'https://github.com/dasm-assembler/dasm/releases/download/2.20.14.1/dasm-2.20.14.1-osx-x64.tar.gz',
    'win32': 'https://github.com/dasm-assembler/dasm/releases/download/2.20.14.1/dasm-2.20.14.1-win-x64.zip',
    'linux': 'https://github.com/dasm-assembler/dasm/releases/download/2.20.14.1/dasm-2.20.14.1-linux-x64.tar.gz'
};

function getDasmId(platform) {
    const dasmPlatform = dasmPlatforms[platform];
    return `dasm-${dasmVersion}-${dasmPlatform}`;
}

function getDasmPath() {
    const platform = os.platform();
    const dasmId = getDasmId(platform);
    const dasmExecutable = dasmExecutables[platform];

    if (!dasmId || !dasmExecutable) {
        vscode.window.showErrorMessage('Unsupported OS');
        return null;
    }

    return path.join(binDir, dasmId, dasmExecutable);
}

function getCompilerPath() {
    const platformPaths = {
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

async function fetchLatestVersion() {
    try {
        const response = await axios.get(releasesUrl);
        return response.data.tag_name;
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to fetch the latest version: ${error.message}`);
        return null;
    }
}

function getLocalVersion() {
    const versionFilePath = path.join(compilerRootDir, 'version.txt');
    if (fs.existsSync(versionFilePath)) {
        return fs.readFileSync(versionFilePath, 'utf8').trim();
    }
    return null;
}

function saveLocalVersion(version) {
    const versionFilePath = path.join(compilerRootDir, 'version.txt');
    fs.writeFileSync(versionFilePath, version);
}

async function updateCompiler(version) {
    try {
        // Remove the existing compiler directory
        if (fs.existsSync(compilerRootDir)) {
            fs.rmSync(compilerRootDir, { recursive: true });
        }

        // Download and extract the new compiler version
        const response = await axios({
            url: compilerUrl,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        const zip = new AdmZip(response.data);
        zip.extractAllTo(binDir, true);

        // Set executable permission for the compiler file if on Unix-like system
        const compilerPath = getCompilerPath();
        if (compilerPath && (os.platform() === 'darwin' || os.platform() === 'linux')) {
            fs.chmodSync(compilerPath, '755');
        }

        // Save the new version locally
        saveLocalVersion(version);

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to update compiler: ${error.message}`);
    }
}

async function ensureCompilerIsLatest() {
    const latestVersion = await fetchLatestVersion();
    if (!latestVersion) {
        vscode.window.showErrorMessage('Could not fetch the latest version of XC=BASIC3 due to network issues.');
        return;
    }

    const localVersion = getLocalVersion();
    if (localVersion !== latestVersion) {
        await updateCompiler(latestVersion);
        vscode.window.showInformationMessage(`XC=BASIC3 updated to version ${latestVersion}`);
    } else {
        console.log('XC=BASIC3 is already up to date');
        vscode.window.showInformationMessage(`XC=BASIC3 version ${localVersion} is up to date`);
    }
}

const { promises: fsPromises } = require('fs');

async function ensureDasmIsAvailable() {
    const dasmPath = getDasmPath();
    try {
        await fsPromises.access(dasmPath);
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
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to download and extract dasm: ${error.message}`);
        }
    }
}

function initializeTasks(context) {
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

async function activate(context) {
    console.log('XC=BASIC3 extension is now active!');

    // Ensure the compiler is the latest version when the extension is activated
    try {
        await ensureCompilerIsLatest();
    } catch (error) {
        vscode.window.showErrorMessage(`Error ensuring XC=BASIC3 is the latest version: ${error.message}`);
    }

    // Ensure dasm is available
    try {
        await ensureDasmIsAvailable();
    } catch (error) {
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

    // Register the XC=BASICInitialize command
    let updateDisposable = vscode.commands.registerCommand('orlof-xcbasic3.XC=BASICUpdate', function () {
        ensureCompilerIsLatest(context);
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

function deactivate() {
    console.log('XC=BASIC3 extension is now deactivated!');
}

module.exports = {
    activate,
    deactivate
};
