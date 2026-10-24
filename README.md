![xcbasic logo](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/xcbasic_logo.jpg)

# XC=BASIC 3

Language support and a zero-configuration build workflow for [XC=BASIC 3](https://xc-basic.net/), the cross compiled BASIC for 8-bit Commodore machines.

## Features

* **Compile, run and debug with one key** – `Shift+F5`, `Ctrl+F5` / `Cmd+F5`, `F5`, or the play button in the editor title
* **Automatic toolchain** – the XC=BASIC 3 compiler and the DASM assembler are downloaded and kept up to date, nothing to install
* **Finds your emulator** – VICE and Retro Debugger are picked up automatically; the right VICE program is started for the target (x128 for c128, xvic for vic20 …) and the previous instance is closed on re-run
* **New Project** command – a folder with `main.bas` and project settings, ready to run
* **Errors in the editor** – compile errors are underlined and listed in the Problems panel
* **Outline and Go to Definition** for your own `SUB`, `FUNCTION`, `TYPE`, `CONST` and labels, also across `INCLUDE`d files
* **IntelliSense** – completion and hover documentation for keywords, functions, data types, your own symbols and 6502 instructions inside `ASM` blocks
* **Rich syntax highlighting** for XC=BASIC 3 and embedded assembly
* **Cross-platform** – Windows, macOS and Linux

![Syntax highlighting](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/syntaxhighlighting.png)

## Quick start

1. Install the extension and run **XC=BASIC: New Project** from the Command Palette (or open a folder with a `.bas` file, or create `hello.bas`):
   ```basic
   PRINT "HELLO FROM XC=BASIC 3!"
   ```
2. The status bar shows `XC=BASIC: downloading…` while the compiler is fetched the first time, then `✓ XC=BASIC v3.x` when everything is in place. If no emulator was found it shows `⚠ XC=BASIC v3.x: setup`.
3. Press **Shift+F5** to compile. The `.prg` is written to the `build` folder.
4. To run it you need [VICE](https://vice-emu.sourceforge.io/). An installed VICE is picked up automatically; otherwise run **XC=BASIC: Setup** (or click the status bar item) and choose `x64sc` or browse to it.
5. Press **Ctrl+F5** (Cmd+F5 on macOS). The program compiles and starts in the emulator. Press it again after a change and the old emulator window is replaced by the new build.

The **Get Started with XC=BASIC 3** walkthrough (Help → Welcome, under Walkthroughs) covers the same steps interactively.

### Keys and commands

| Keys | Command | What it does |
|------|---------|--------------|
| `Shift+F5` | XC=BASIC: Compile File | Compiles to `build/<name>.prg` |
| `Ctrl+F5` / `Cmd+F5` | XC=BASIC: Compile and Run File | Compiles and starts the emulator |
| `F5` | XC=BASIC: Compile and Debug File | Compiles and starts the debugger |
| | XC=BASIC: New Project | Creates a folder with `main.bas`, `.vscode/settings.json` and `.gitignore`, and opens it |
| | XC=BASIC: Setup | Finds and selects emulator and debugger |
| | XC=BASIC: Check Setup | Verifies compiler, assembler, tools and project settings and reports problems |
| | XC=BASIC: Select Compiler Version | Follow the latest release or pin a version such as `v3.1.13` |
| | XC=BASIC: Update Compiler | Checks for a new compiler release now (when following the latest release) |
| | XC=BASIC: Show Output | Shows the full compiler output |

Clicking the **XC=BASIC** status bar item opens a menu with all of these.

## Requirements

Nothing is required to compile. To run and debug programs you need:

* **VICE** emulator: https://vice-emu.sourceforge.io/
* **Retro Debugger** (optional): https://github.com/slajerek/RetroDebugger

Installed in the usual place (Applications, Program Files, PATH …) they are found automatically. Otherwise run **XC=BASIC: Setup**.

### Other target machines

`xcbasic3.target` selects the machine the compiler builds for. **Compile and Run** starts the matching VICE program from the same installation as the configured emulator, with the options that machine needs:

| Target | Emulator |
|--------|----------|
| `c64` | `x64sc` (or `x64`) |
| `c128` | `x128` |
| `vic20`, `vic20_3k` … `vic20_24k` | `xvic -memory none/3k/8k/16k/24k` |
| `cplus4`, `c16` | `xplus4 -model plus4/c16` |
| `pet2001` … `pet8032` | `xpet -model 2001 … 8032` |
| `x16` | `x16emu -run -prg` (must be on `PATH` or set as `xcbasic3.emulator`) |
| `mega65` | `xmega65 -prg` (must be on `PATH` or set as `xcbasic3.emulator`) |

If `xcbasic3.emulator` points at something the extension does not recognise (a script of your own, another emulator), it is used for every target as is.

## Settings

All settings are under `xcbasic3.*` in File → Preferences → Settings. The first two are filled in automatically or by the setup wizard.

| Setting | Default | Description |
|---------|---------|-------------|
| `xcbasic3.emulator` | | Emulator executable (`x64sc`). On macOS the `.app` bundle also works. Other targets use the matching VICE program next to it. |
| `xcbasic3.debugger` | | Debugger executable (Retro Debugger). Optional. |
| `xcbasic3.target` | `c64` | Target machine passed as `--target` (c64, c128, vic20, cplus4, c16, pet…, x16, mega65). |
| `xcbasic3.outputDir` | `build` | Where `.prg` files go, relative to the workspace folder. Empty = next to the source. |
| `xcbasic3.mainFile` | | Main program of the project, e.g. `src/main.bas`. Set this when your program uses `INCLUDE`, so that `Ctrl+F5` builds the whole program from any file. |
| `xcbasic3.compilerArgs` | `[]` | Extra compiler arguments, e.g. `["--optimize=false"]`. |
| `xcbasic3.emulatorArgs` / `debuggerArgs` | `[]` | Extra arguments passed before the `.prg` file. |
| `xcbasic3.restartEmulator` | `true` | Close the emulator / debugger from the previous run before starting the new one. |
| `xcbasic3.compilerVersion` | `latest` | Compiler version: `latest` follows the newest release, or a pinned tag such as `v3.1.13`. See below. |
| `xcbasic3.autoUpdateCompiler` | `true` | With `latest`, check for a new compiler release once a day. |
| `xcbasic3.basefolder` | | Advanced: use your own XC=BASIC 3 installation (folder containing `bin`). |
| `xcbasic3.useTasksJson` | `false` | Advanced: run `.vscode/tasks.json` tasks instead of the built-in build. |

Emulator and debugger paths are stored in your user settings because they are specific to the computer. Project settings such as `target`, `outputDir` and `mainFile` can be put in `.vscode/settings.json` so they travel with the project.

## Choosing the compiler version

By default the extension follows the newest XC=BASIC 3 release on GitHub. If a release has a bug that affects your project, pin an older version:

1. Run **XC=BASIC: Select Compiler Version** (also in the status bar menu).
2. Pick a version from the list, for example `v3.1.13`. It is downloaded once and kept next to the other versions, so switching back and forth is instant.

The status bar shows the active version, with a pin icon when it is pinned. Pinned versions are never updated automatically; choose **Latest release** in the same menu to go back to automatic updates. The choice is stored in `xcbasic3.compilerVersion` and can also be set per workspace.

Versions from v3.2.0 on are downloaded from the GitHub release assets, older ones from the release tag's source archive, which contains the prebuilt binaries.

## Troubleshooting

Run **XC=BASIC: Check Setup** first. It tests that the compiler and assembler actually start, that the emulator and debugger paths exist, and that project settings point to real files. The report is written to the **XC=BASIC** output channel with a suggested fix for each problem.

**Compiler v3.2.0 on Windows** – this release fails on Windows with `Fatal assembly error: Unable to open file` because of a quoting bug in the compiler's DASM call (reported upstream). The extension knows this and, when following the latest release, uses `v3.1.13` on Windows until a fixed release is published. The status bar tooltip and **Check Setup** tell you when a release was skipped. If you pinned `v3.2.0` yourself, pick **Latest release** in **XC=BASIC: Select Compiler Version**.

**Paths with spaces** – the compiler (both v3.1.13 and v3.2.0) cannot pass a DASM path or an output path containing spaces to DASM. The built-in build works around this: DASM is found via `PATH`, and when the output folder contains spaces the program is compiled in a temporary folder and moved into place. Custom `tasks.json` builds have to avoid such paths themselves.

**The status bar shows `✖ XC=BASIC`** – the compiler could not be downloaded (no network, proxy, GitHub rate limit). Click the item and choose *Retry*. Offline machines: download a release from https://github.com/neilsf/xc-basic3/releases, unzip it and set `xcbasic3.basefolder` to the unzipped folder.

**macOS: "xcbasic3 cannot be opened because the developer cannot be verified"** – the extension removes the quarantine flag from downloaded binaries automatically. If the warning still appears, open System Settings → Privacy & Security and click *Open Anyway*, then compile again.

**The emulator starts but nothing loads** – make sure `xcbasic3.emulator` points at `x64sc` (not `VICE.app` or `c1541`). Run **XC=BASIC: Setup** and pick it from the list.

**"target c128 runs on x128, which was not found"** – the VICE installation next to your `x64sc` does not contain the other machines (some packages ship only x64sc). Install the complete VICE package, or choose **Locate x128…** in the message and point at the executable; the location is remembered.

**My program uses INCLUDE and compiling an included file fails** – set `xcbasic3.mainFile` in the workspace settings.

**Upgrading from 3.0.x** – the compiler is now stored in VS Code's global storage instead of the extension folder, so it survives extension updates. Existing `.vscode/tasks.json` files are no longer used by `Ctrl+F5` / `F5` / `Shift+F5` unless you enable `xcbasic3.useTasksJson`. The settings `xcbasic3.cruncher` and `xcbasic3.builder` were removed; see below for how to run Exomizer or c1541.

Report issues at https://github.com/orlof/xcb3-vscode-ext/issues.

## Advanced: custom build steps with tasks.json

For things the built-in build does not do, such as crunching with Exomizer, building `.d64` images with `c1541` or multi-part programs, use VS Code tasks:

1. Run **XC=BASIC: Initialize tasks.json** to create `.vscode/tasks.json` with the three standard tasks.
2. Edit the tasks or add your own. The extension provides `${env:XCBASIC3_COMPILER}`, puts the DASM folder on `PATH` (so no `--dasm` argument is needed) and contributes `$xcbasic3` as problem matcher. Avoid `--dasm=<full path>` and output paths with spaces: the compiler does not quote them correctly.
3. Enable `xcbasic3.useTasksJson` to make `Shift+F5` / `Ctrl+F5` / `F5` run the `XC=BASIC Compile File` / `Run File` / `Debug File` tasks instead of the built-in build.

Example: compile, crunch with Exomizer and put the result on a disk image.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "XC=BASIC Compile File",
      "type": "shell",
      "command": "${env:XCBASIC3_COMPILER}",
      "args": ["${file}", "${workspaceFolder}/build/${fileBasenameNoExtension}.prg"],
      "group": { "kind": "build", "isDefault": true },
      "problemMatcher": "$xcbasic3"
    },
    {
      "label": "Crunch",
      "type": "shell",
      "command": "/path/to/exomizer",
      "args": ["sfx", "basic", "build/${fileBasenameNoExtension}.prg", "-o", "build/${fileBasenameNoExtension}-packed.prg", "-x", "'inc $d020'"],
      "dependsOn": ["XC=BASIC Compile File"],
      "problemMatcher": []
    },
    {
      "label": "Build Disk",
      "type": "shell",
      "command": "/path/to/vice/bin/c1541",
      "args": ["-format", "${fileBasenameNoExtension},01", "d64", "build/${fileBasenameNoExtension}.d64",
               "-attach", "build/${fileBasenameNoExtension}.d64",
               "-write", "build/${fileBasenameNoExtension}-packed.prg", "${fileBasenameNoExtension}"],
      "dependsOn": ["Crunch"],
      "problemMatcher": []
    }
  ]
}
```

More examples are in the `example_vscode` folder of the repository.

## Language features

* Syntax highlighting for keywords, built-in functions, strings, numbers, comments (`REM` and `'`) and `ASM` blocks with 6502 instruction highlighting
* Completion for keywords, functions and data types; snippets for control structures (`FOR`, `IF`, `WHILE`, `SELECT`, `SUB`, `FUNCTION`, `ASM` …) and for most statements and built-in functions
* Hover documentation for keywords, functions and 6502 instructions, and for your own `SUB` / `FUNCTION` / `TYPE` / `CONST` (shows the definition line)
* **Outline** view and breadcrumbs with `SUB`, `FUNCTION`, `TYPE` (with fields), `CONST` and labels
* **Go to Definition** (F12, Ctrl+click) for your own symbols: in the current file, in `INCLUDE`d files, and in other `.bas` files of the workspace
* Completion of your own symbols next to the built-in keywords and functions
* Folding for `SUB`, `FUNCTION` and `ASM` blocks

The extension does not provide VS Code debugger integration (breakpoints, stepping). Use Retro Debugger via `F5` for that.

## Thanks

* Syntax definitions based on work by
  * https://github.com/Viza74/xcbasiclanguagevscodeext
  * https://github.com/zeh/vscode-dasm
* This extension downloads and uses
  * **XC=BASIC 3**: https://xc-basic.net/
  * **DASM assembler**: https://dasm-assembler.github.io/

## License

MIT, see LICENSE.
