const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('orlof-xcbasic3.initializeTasks', function () {
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
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
}