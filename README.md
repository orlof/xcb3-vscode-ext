![xcbasic logo](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/icon.png)

# XC=Basic 3

Syntax highlighting for XC=BASIC 3.1, a cross compiled BASIC for 8-bit Commodore machines.

## Features

* Syntax Highlighting for XC=BASIC3 and asm blocks
* Integrated XC=BASIC3 compiler
* Integration with emulator, debugger and build -tool

![Syntax highlighting](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/syntaxhighlighting.png)

## Requirements

No requirements but Vice and Retro Debugger are recommended.
* https://vice-emu.sourceforge.io/
* https://github.com/slajerek/RetroDebugger

## Installation

This extension contains XC=Basic3 compiler. In MacOS attempt to use it (compile) will fail with this error:
![Error MacOS](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/error_macos.png)

You must manually bypass Gatekeeper's restrictions for unverified applications:
* Open System Settings > Privacy & Security > General.
* Click Open Anyway next to the warning about the blocked application.

## Extension Settings

This extension contributes the following settings:

Settings are needed only if you use them in `.vscode/tasks.json`.

* `xcbasic.emulator`
  * Absolute path to emulator of your choice (e.g. Vice)
* `xcbasic.debugger`
  * Absolute path to debugger of your choice (e.g. Retro Debugger)
* `xcbasic.packer`
  * Absolute path to packer of your choice (e.g. Exomizer or ZX0)
* `xcbasic.builder`
  * Absolute path to builder of your choice (e.g. c1541)

These settings provide file paths that you CAN use when defining tasks in `.vscode/tasks.json`. This allows you to store `.vscode/tasks.json` in version control and ensure that it can work correctly in different computers regardless of the tool locations.

## Usage

To initialize your XC=BASIC3 project you can create a default `vscode/tasks.json` file by running `XC=BASIC Initialize tasks.json` from the command palette (Ctrl+Shift+B or Cmd+Shift+B on Mac).

Default `.vscode/tasks.json` defines three tasks:

* XC=BASIC Compile File (shift+f5)
  * Compiles the current file .bas to .prg
* XC=BASIC Run File (ctrl+f5)
  * Compiles the current file and runs it in external emulator
* XC=BASIC Debug File (f5)
  * Compiles the current file and runs it in external debugger
* XC=Basic Build
  * Compiles the current file and creates disk image with external builder

This default `.vscode/tasks.json` provides a starting point for you to define the tasks that your project requires.

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
