const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const AdmZip = require('adm-zip');

const tasks = ['XC=BASIC Run File', 'XC=BASIC Debug File', 'XC=BASIC Compile File'];
const compilerUrl = 'https://github.com/neilsf/xc-basic3/archive/refs/heads/main.zip';
const releasesUrl = 'https://api.github.com/repos/neilsf/xc-basic3/releases/latest';
const binDir = path.join(__dirname, 'bin');
const compilerRootDir = path.join(binDir, 'xc-basic3-main');

function getCompilerPath() {
    const platform = os.platform();
    if (platform === 'darwin') {
        return path.join(compilerRootDir, 'bin', 'macOS', 'xcbasic3');
    } else if (platform === 'win32') {
        return path.join(compilerRootDir, 'bin', 'Windows', 'xcbasic3.exe');
    } else if (platform === 'linux') {
        return path.join(compilerRootDir, 'bin', 'Linux', 'xcbasic3');
    } else {
        vscode.window.showErrorMessage('Unsupported OS');
        return null;
    }
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
            fs.rmdirSync(compilerRootDir, { recursive: true });
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

        // Show information message with the updated version
        vscode.window.showInformationMessage(`XC=BASIC3 compiler has been updated to ${version}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to update compiler: ${error.message}`);
    }
}

async function ensureCompilerIsLatest() {
    const latestVersion = await fetchLatestVersion();
    if (!latestVersion) {
        return;
    }

    const localVersion = getLocalVersion();

    if (localVersion !== latestVersion) {
        await updateCompiler(latestVersion);
    }
}

function initializeTasks(context) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        // Define the path to the .vscode directory and tasks.json
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
            vscode.window.showInformationMessage('Tasks configuration has been initialized.');
        }
    } else {
        vscode.window.showErrorMessage('No workspace folder found.');
    }
}

async function activate(context) {
    // Ensure the compiler is the latest version when the extension is activated
    await ensureCompilerIsLatest();

    // Set the environment variables for the extension
    const compilerPath = getCompilerPath();
    if (compilerPath) {
        process.env.XCBASIC3_COMPILER = compilerPath;
    }

    // Automatically run XC=BASICInitialize task
    initializeTasks(context);

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

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
