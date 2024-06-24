![xcbasic logo](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/icon.png)

# XC=Basic 3

Syntax highlighting for XC=BASIC 3.1, a cross compiled BASIC for 8-bit Commodore machines.

## Features

* Syntax Highlighting for XC=BASIC3 and DASM blocks
* Automatic management of XC=BASIC3 compiler and DASM assembler
* Works with external compiler, emulator, debugger, packer and builder

![Syntax highlighting](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/syntaxhighlighting.png)

## Requirements

No requirements but Vice, Retro Debugger and Exomizer are recommended.
* https://vice-emu.sourceforge.io/
* https://github.com/slajerek/RetroDebugger
* https://csdb.dk/release/?id=238365

## Installation

This extension manages the compilation toolchain automatically and doesn't need externally installed XC=Basic3 or DASM.

In MacOS the first attempt to compile code may fail with errors:
![Error MacOS](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/error_macos.png)

You must manually bypass Gatekeeper's restrictions for unverified applications:
* Open System Settings > Privacy & Security > General.
* Click Open Anyway next to the warning about the blocked application.

Other tools must still be installed manually.

## Extension Settings

Settings are needed only if you use them in `.vscode/tasks.json`.

* `xcbasic.basefolder`
  * OPTIONAL: Absolute path to external XC-BASIC base folder (the one containing the 'bin' folder). This is needed only if you don't want to use the managed compilation toolchain.
* `xcbasic.emulator`
  * Absolute path to external emulator of your choice (e.g. Vice).
* `xcbasic.debugger`
  * Absolute path to external debugger of your choice (e.g. Retro Debugger)
* `xcbasic.packer`
  * Absolute path to external packer of your choice (e.g. Exomizer)
* `xcbasic.builder`
  * Absolute path to external disc builder of your choice (e.g. c1541)

These settings can be used as file paths (e.g. `${config:xcbasic3.emulator}`) in `.vscode/tasks.json`. This allows you to store `.vscode/tasks.json` in version control and ensure that tasks work correctly in different computers regardless of the tool locations.

## Usage

During the first activation this extension will download latest release of XC=BASIC 3 and dasm v2.20.14.1 for your operating system. In each subsequent activation extension will update XC=BASIC 3 if needed.

This extension will also automatically create a default `vscode/tasks.json` file if it doesn't already exists. You can also manually create the file by using `XC=BASIC Initialize tasks.json` command from the command palette (Ctrl+Shift+B or Cmd+Shift+B on Mac).

The default `.vscode/tasks.json` defines following tasks as an example:

* XC=BASIC Compile File (shift+f5)
  * Compiles the current file .bas to .prg
* XC=BASIC Run File (ctrl+f5)
  * Compiles the current file and runs it in external emulator (must be configured)
* XC=BASIC Debug File (f5)
  * Compiles the current file and runs it in external debugger (must be configured)
* XC=BASIC Crunch File
  * Compiles the current file and crunches it with external cruncher (must be configured)
* XC=Basic Build Disk
  * Compiles the current file and creates disk image with external builder (must be configured)

This default `.vscode/tasks.json` provides a starting point for you to define the tasks that your project requires.

Tasks that don't have default key bindings can be invoked with Command Palette:
* Open the Command Palette:
  * Press Ctrl+Shift+P (Cmd+Shift+P) to open the Command Palette.
* Run the Task:
  * Type `Run Task` and select `Tasks: Run Task` from the dropdown list.
  * Select `Show All Tasks` if you cannot see your task
  * You will see a list of tasks that you have defined in your tasks.json file. Select the task you want to run from this list.

The built-in compiler is referenced with
* `${env:XCBASIC3_COMPILER}`

Note that you can define command line parameters for xc-basic3 by adding `args` to your compile task.

External tools can be referenced in `tasks.json` with:
* `${config:xcbasic3.builder}`
* `${config:xcbasic3.compiler}`
* `${config:xcbasic3.debugger}`
* `${config:xcbasic3.emulator}`
* `${config:xcbasic3.packer}`

## Notes

This extension is NOT
* Debugging Extension
  * NO support for VSCode's debugger integration e.g. stepping, variable evaluation etc.
* Language Server
  * This extension does not parse the source code. Color coding is based on guessing the token types in local context.

## Thanks

* Some syntax definitions for XC=BASIC and DASM are based on
  *  https://github.com/Viza74/xcbasiclanguagevscodeext
  *  https://github.com/zeh/vscode-dasm

* This extension downloads and uses
  * https://xc-basic.net/
  * https://dasm-assembler.github.io/


