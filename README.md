![xcbasic logo](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/icon.png)

# XC=Basic 3

Syntax highlighting for XC=BASIC 3.1, a cross compiled BASIC for 8-bit Commodore machines.

## Features

* Grammar definition for syntax highlighting

![Syntax highlighting](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/syntaxhighlighting.png)

## Requirements

No requirements but XC=Basic 3 compiler and Vice are recommended for testing.
* https://xc-basic.net/
* https://vice-emu.sourceforge.io/

## Extension Settings

This extension contributes the following settings:

* `xcbasic.basefolder`: Absolute path to XC-BASIC base folder (the one containing the 'bin' folder)
* `xcbasic.vice`: Absolute path to VICE base folder (the one containing the 'bin' folder)
* `xcbasic.debugger`: Absolute path to retro debugger base folder
* `xcbasic.packer`: Absolute path to packer (of your choice) base folder (e.g. Exomizer)

These setting are not needed by the extension, but you can use them in `.vscode/tasks.json` to simplify compilation process. By specifying the basefolder you can store .vscode/tasks.json to version control and reference tools with relative paths. Then multiple people with different installation folders can work with the project.

Following example allows you to hit Crtl+Shift+B or Cmd+Shift+B to build the currently open XC=BASIC 3 file to a C64 .prg with the same name.

Copy this to .vscode/tasks.json in your project folder.
```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "XC=BASIC3 Compile",
            "type": "shell",
            "osx": {
                "command": "${config:xcbasic3.basefolder}/bin/macOS/xcbasic3",
                "args": [
                    "${file}",
                    "${fileDirname}/${fileBasenameNoExtension}.prg"
                ]
            },
            "linux": {
                "command": "${config:xcbasic3.basefolder}/bin/Linux/xcbasic3",
                "args": [
                    "${file}",
                    "${fileDirname}/${fileBasenameNoExtension}.prg"
                ]
            },
            "windows": {
                "command": "${config:xcbasic3.basefolder}/bin/Windows/xcbasic3.exe",
                "args": [
                    "${file}",
                    "${fileDirname}/${fileBasenameNoExtension}.prg"
                ]
            },
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

[This](https://github.com/orlof/xcb3-vscode-ext/tree/main/example_vscode/example1_tasks.json) example
 - Compiles files part1.bas and part2.bas with XC=BASIC3
 - Compresses part1.bas with Exomizer
 - Creates a .d64 file.

[This](https://github.com/orlof/xcb3-vscode-ext/tree/main/example_vscode/example2_tasks.json) example
 - Compiles current XC=BASIC3 file
 - Runs the compiled file in VICE

## Known Issues

* Ugly colors
* Lot of bugs
* Some XC=Basic rules and DASM language definition is based on
  *  https://github.com/Viza74/xcbasiclanguagevscodeext
  *  https://github.com/zeh/vscode-dasm

