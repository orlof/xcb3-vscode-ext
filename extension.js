const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getCompilerPath() {

}

const tasks = ['XC=BASIC Run File', 'XC=BASIC Debug File', 'XC=BASIC Compile File'];

function activate(context) {
    // Set the environment variables for the extension
    const platform = os.platform();
    if (platform === 'darwin') {
        process.env.XCBASIC3_COMPILER = path.join(__dirname, 'bin', 'xc-basic3-main', 'bin', 'macOS', 'xcbasic3');
    } else if (platform === 'win32') {
        process.env.XCBASIC3_COMPILER = path.join(__dirname, 'bin', 'xc-basic3-main', 'bin', 'Windows', 'xcbasic3.exe');
    } else if (platform === 'linux') {
        process.env.XCBASIC3_COMPILER = path.join(__dirname, 'bin', 'xc-basic3-main', 'bin', 'Linux', 'xcbasic3');
    } else {
        vscode.window.showErrorMessage('Unsupported OS');
    }

    let disposable = vscode.commands.registerCommand('orlof-xcbasic3.XC=BASICInitialize', function () {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            // Define the path to the .vscode directory and tasks.json
            const vscodeDirPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode');
            const tasksPath = path.join(vscodeDirPath, 'tasks.json');
            const defaultTasksPath = path.join(context.extensionPath, 'templates', 'tasks.json');

            // Check if the .vscode directory exists, and create it if it doesn't
            if (!fs.existsSync(vscodeDirPath)) {
                fs.mkdirSync(vscodeDirPath, { recursive: true });
                vscode.window.showInformationMessage('.vscode directory created.');
            }

            // Copy the default tasks.json to the .vscode directory
            fs.copyFileSync(defaultTasksPath, tasksPath);
            vscode.window.showInformationMessage('Tasks configuration has been initialized.');
        } else {
            vscode.window.showErrorMessage('No workspace folder found.');
        }
    });

    context.subscriptions.push(disposable);

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
