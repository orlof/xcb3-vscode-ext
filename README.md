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

* `xcbasic.basefolder`
  * Absolute path to XC-BASIC base folder (the one containing the 'bin' folder)

Optional settings are needed only if you want to use them in `.vscode/tasks.json`.

* `xcbasic.emulator`
  * Absolute path to emulator of your choice (e.g. Vice)
* `xcbasic.debugger`
  * Absolute path to debugger of your choice (e.g. Retro Debugger)
* `xcbasic.packer`
  * Absolute path to packer of your choice (e.g. Exomizer or ZX0)

XC=BASIC extension does not use these optional settings. Their only purpose is to provide file paths that you CAN use when defining tasks in `.vscode/tasks.json`. This allows you to store `.vscode/tasks.json` in version control and ensure that it can work correctly in different computers regardless of the tool locations.

## Tasks

Tasks can be set up to perform actions such as:

* Compile individual source files from `.bas` to `.prg`
* Compress compiled binaries using tools like exomizer or zx0
* Launch compiled `.prg` files in emulators or debuggers, such as Vice or Retro Debugger
* Create `.d64` files
* Execute various other tasks

A default `vscode/tasks.json` file can be created for your project by running a task called `XC=BASIC Initialize tasks.json`. It is run by selecting it from the VSCode Command Palette Ctrl+Shift+B (or Cmd+Shift+B on Mac).

Default `.vscode/tasks.json` defines three tasks:

* XC=BASIC Compile
  * Compiles the current file .bas to .prg
* XC=BASIC Run
  * Compiles the current file and runs it with Vice
* XC=Basic .d64
  * Compiles the current file and creates disk image

This default tasks.json provides a starting point for you to define the tasks that your project requires. Extension's repository contains some examples of `tasks.json`:

[This](https://github.com/orlof/xcb3-vscode-ext/tree/main/example_vscode/example1_tasks.json) example
 - Compiles files part1.bas and part2.bas with XC=BASIC3
 - Compresses part1.bas with Exomizer
 - Creates a .d64 file.

[This](https://github.com/orlof/xcb3-vscode-ext/tree/main/example_vscode/example2_tasks.json) example
 - Compiles current XC=BASIC3 file
 - Runs the compiled file in VICE

## Notes

This extension is NOT
* Debugging Extension
  * NO support for VSCode's (F5) debugger, line stepping, variable evaluation etc.
* Language Server
  * This extension does not parse the source code or build AST. Color coding is based on guessing the token types in local context.

## Thanks

* Some syntax definitions for XC=BASIC and DASM are based on
  *  https://github.com/Viza74/xcbasiclanguagevscodeext
  *  https://github.com/zeh/vscode-dasm
