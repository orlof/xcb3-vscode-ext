# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-10-24

### Added

- **Built-in build**: Compile / Run / Debug no longer depend on `.vscode/tasks.json`. The extension runs the compiler itself, shows the output in the **XC=BASIC** output channel and puts compile errors in the Problems panel with a "Go to Error" action.
- **Setup wizard** (`XC=BASIC: Setup`): detects VICE and Retro Debugger installations (PATH, Applications, Program Files…), offers a file picker, accepts macOS `.app` bundles, and stores the result in user settings.
- **Check Setup** (`XC=BASIC: Check Setup`): verifies that compiler and assembler start, that emulator/debugger paths exist and that project settings are valid, with a suggested fix for each problem.
- **Status bar item** showing toolchain state (downloading / ready / setup needed / error) with a quick menu.
- **Get Started walkthrough** in VS Code's welcome page.
- Play and debug buttons in the editor title for `.bas` files.
- Settings `xcbasic3.target`, `xcbasic3.outputDir` (default `build`), `xcbasic3.mainFile`, `xcbasic3.compilerArgs`, `xcbasic3.emulatorArgs`, `xcbasic3.debuggerArgs`, `xcbasic3.autoUpdateCompiler`, `xcbasic3.useTasksJson`.
- First-run hint offering to set up the emulator.
- **Known-broken releases are skipped automatically**: compiler v3.2.0 fails on Windows (DASM quoting bug in the compiler), so on Windows "latest" uses the newest working release (v3.1.13) until a fixed release is published. The version picker, status bar tooltip and Check Setup show when a release was skipped; pinning it explicitly is still possible.
- **Compiler version selection** (`XC=BASIC: Select Compiler Version`, setting `xcbasic3.compilerVersion`): follow the latest release or pin a specific version such as `v3.1.13`. Versions are installed side by side so switching is instant; the status bar shows the active version. Older versions without release assets are fetched from the tag's source archive.
- **Emulator picked up automatically**: when `xcbasic3.emulator` is empty and VICE is installed in a usual place, it is used without running the wizard (a message says which one was chosen, with a *Change…* button). Same for Retro Debugger.
- **Emulator per target machine**: Compile and Run starts the VICE program for `xcbasic3.target` from the same installation as the configured emulator (`x128` for c128, `xvic -memory …` for the VIC-20 variants, `xplus4 -model …` for cplus4/c16, `xpet -model …` for the PETs; `x16emu` / `xmega65` for x16 / mega65). Unknown emulators are left alone. *Locate …* in the warning remembers an emulator installed elsewhere.
- **Previous emulator is closed** before the new build is started (setting `xcbasic3.restartEmulator`, default on), so only the latest program is on screen.
- **Outline, breadcrumbs and Go to Definition** for user defined `SUB`, `FUNCTION`, `TYPE` (with fields), `CONST` and labels. Definitions are found in the current file, in `INCLUDE`d files and in other `.bas` files of the workspace. Hover shows the definition line and completion offers your own symbols.
- **`XC=BASIC: New Project`**: asks for a name, target machine and location, creates `main.bas`, `.vscode/settings.json` (`mainFile`, `target`) and `.gitignore`, and opens the folder with `main.bas` in the editor.

### Changed

- Compiler and DASM are stored in VS Code's global storage instead of the extension folder, so they survive extension updates (fixes #2). Existing binaries are migrated automatically.
- Compiler is downloaded from the GitHub release assets for the current platform instead of the repository `main` branch.
- Update check runs at most once a day and never blocks activation; network failures are silent when a compiler is already installed.
- On macOS the quarantine flag is removed from downloaded binaries so Gatekeeper does not block them.
- Compile errors on files you edit are cleared until the next compile.
- Works with paths containing spaces: DASM is located via `PATH` instead of `--dasm=<path>` (the global storage folder on macOS is `~/Library/Application Support/...`), and when the output folder contains spaces the program is compiled in a temporary folder and moved into place. The compiler itself cannot quote such paths.
- Workspaces that already contain the generated XC=BASIC tasks in `.vscode/tasks.json` get a one-time prompt to choose between those tasks and the built-in build (sets `xcbasic3.useTasksJson` for the workspace).
- `tasks.json` is no longer created automatically. `XC=BASIC: Initialize tasks.json` still creates one for advanced setups, used when `xcbasic3.useTasksJson` is enabled.
- Command titles now use the `XC=BASIC:` category in the Command Palette.
- Minimum VS Code version is 1.82.

### Removed

- Settings `xcbasic3.cruncher` and `xcbasic3.builder` and the Exomizer / c1541 tasks from the default template. See the README for running them from a custom `tasks.json`.

## [3.0.3] - 2025-11-01

### Changed

- Fixed error in some XC=Basic command tooltips
- Removed color selector in ASM blocks 

## [3.0.0] - 2025-09-17

### Added

- **Language Server Protocol (LSP) support** - Major new feature providing:
  - IntelliSense with auto-completion for keywords, built-in functions, and data types
  - Hover information with detailed documentation for keywords and functions
  - Error highlighting with compilation errors shown directly in the editor
- **6502 Assembly instruction hover support** - Added comprehensive hover documentation for 6502 assembly instructions within ASM blocks:
  - Complete 6502 instruction set with descriptions
  - Processor flags affected by each instruction
  - Supported addressing modes for each instruction
  - Context-aware detection of ASM blocks vs XC=BASIC code
- Built-in XC=BASIC 3 language definitions with comprehensive keyword and function documentation

### Changed

- **BREAKING**: Built-in functions now colored as keywords instead of functions
- Improved syntax highlighting for various statement types:
  - `SWAP`, `WAIT`, `VOLUME` now colored as statement keywords
  - `FAST` now colored as declaration modifier (like `PRIVATE`, `SHARED`)
  - `MEMCPY`, `MEMSHIFT` now colored as statement keywords
  - Declaration modifiers `OVERLOAD`, `PRIVATE`, `STATIC`, `SHARED` now colored as sub-commands
  - OPTION statement keywords now properly distinguished from option names
- Enhanced ON statement syntax highlighting with proper differentiation between interrupt keywords and values
- Added support for missing built-in functions: `FLOOR`, `JOY`, `KEY`, `SCAN`
- String functions now properly recognize both `$` and non-`$` suffixes (e.g., `CHR$` and `CHR`)

### Technical

- Added TypeScript Language Server implementation
- Updated webpack configuration for dual-target build (extension + language server)
- Enhanced TextMate grammar with more precise syntax rules

## [2.0.2] - 2025-04-13

### Changed

- Switched to webpack for bundling the extension
- Improved package size and loading performance

## [2.0.1] - 2024-07-18

### Fixed

- Added syntax highlighting for DOKE and DEEK

## [2.0.0] - 2024-07-03

### Changes

This update from 1.0.4 to 2 is only if you want the managed compilers

- Breaking change: configuration parameter `vice` is renamed to `emulator`
  - Redefine the configuration parameter
  - Replace `${config:xcbasic3.vice}` with `${config:xcbasic3.emulator}` in tasks.json
- Added task `XCBASIC Initialize tasks.json`
- Managed XC=BASIC compiler and DASM assembler

## [1.0.4] - 2024-6-16

### Fixed

- Fix to image URLs

## [1.0.3] - 2024-6-16

### Improved

- Documentation

## [1.0.2] - 2024-6-14

### Fixed

- Added CHARSET
- Small changes in SPRITE and VOICE coloring

## [1.0.1] - 2023-1-11

### Fixed

- Added missing OPTIONs
- Removed node modules from package

## [1.0.0] - 2023-11-28

### Added

- CHANGELOG.md

### Fixed

- Semantic versioning

## [0.0.4] - 2023-11-27

### Added

- "OPTION FASTINTERRUPT"
- Folding SUB and FUNCTION
- Config parameters for VICE and packer

## [0.0.3] - 2023-xx-xx

### Fixed

- Here and there...

## [0.0.2] - 2022-xx-xx

### Fixed

- Here and there...

## [0.0.1] - 2021-xx-xx

### Added

- Initial release
