![xcbasic logo](images/xcbasic_logo.png)

# XC=Basic 3 

Syntax highlighting for XC=BASIC 3, a cross compiling basic dialect for the C64.

## Features

### Grammar definition for syntax highlighting and more

![Syntax highlighting](images/syntaxhighlighting.png)

## Requirements

No requirements but XC=Basic 3 compiler and Vice are recommended for testing.
 - https://xc-basic.net/
 - https://vice-emu.sourceforge.io/

## Extension Settings

This extension contributes the following settings:

* `xcbasic.basefolder`: Absolute path of the XC-BASIC base folder (the one containing the 'bin' and 'third_party' folders).

For now this setting is not used directly by the extension, you can use it with the following `tasks.json` and simply hit Crtl+Shift+B or Cmd+Shift+B to build the currently open XC=BASIC 3 file to a C64 prg with the same name.

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build XC=BASIC 3 file to .prg",
            "type": "shell",
            "osx": {
                "command": "./bin/macOS/xcbasic3",
                "args": [
                    "${file}",
                    "${fileDirname}/${fileBasenameNoExtension}.prg"
                ]
            },
            "linux": {
                "command": "./xcb",
                "args": [
                    "${file}",
                    "${fileDirname}/${fileBasenameNoExtension}.prg"
                ]
            },
            "windows": {
                "command": "xcb.bat",
                "args": [
                    "${file}",
                    "${fileDirname}\\${fileBasenameNoExtension}.prg"
                ]
            },
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "options": {
                "cwd": "${config:xcbasic3.basefolder}"
            }
        }
    ]
}
```


## Known Issues

There is probably a lot of bugs and things are not implemented the right way.

## Release Notes

### 0.0.1

Initial release
