![xcbasic logo](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/xcbasic_logo.jpg)

# XC=Basic 3

Syntax highlighting for XC=BASIC 3, a cross compiled BASIC for 8-bit Commodore machines.

## Features

* **Rich Syntax Highlighting** for XC=BASIC3 (including ASM blocks)
* **Error Highlighting** - Compilation errors are highlighted directly in the editor
* **Automatic Toolchain Management** - XC=BASIC3 compiler and DASM assembler are downloaded and managed automatically
* **Integrated Build System** - Compile, run, and debug with keyboard shortcuts
* **External Tool Integration** - Works with Vice emulator, Retro Debugger, Exomizer, and c1541
* **Cross-Platform** - Supports Windows, macOS, and Linux

![Syntax highlighting](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/syntaxhighlighting.png)

## Requirements

No requirements for basic compilation, but these external tools are recommended for a complete development experience:

* **Vice Emulator**: https://vice-emu.sourceforge.io/
* **Retro Debugger**: https://github.com/slajerek/RetroDebugger
* **Exomizer**: https://csdb.dk/release/?id=238365

## Installation

1. Install the extension from the VS Code Marketplace
2. Open a folder containing `.bas` files
3. The extension will automatically download and set up the XC=BASIC3 compiler and DASM assembler

### macOS Security Note

On macOS, the first compilation attempt may fail with security warnings:

![Error MacOS](https://raw.githubusercontent.com/orlof/xcb3-vscode-ext/main/images/error_macos.png)

**Fix**: Open System Settings > Privacy & Security > General, then click "Open Anyway" next to the warning.

## Quick Start

1. **Create a new `.bas` file**:
   ```basic
   PRINT "Hello, World!"
   ```

2. **Compile and run**:
   - Press `Shift+F5` to compile
   - Press `Ctrl+F5` (or `Cmd+F5` on Mac) to compile and run in emulator

3. **View compilation errors**:
   - Errors appear as red squiggly lines in the editor
   - Check the Problems panel (View → Problems) for detailed error messages
   - XC-Basic compiles in 2 phases. Second phase is Dasm compilation and errors in 2nd phase cannot be tracked back to the basic code.

## Configuration

### Extension Settings

Configure these settings in VS Code's settings (File → Preferences → Settings):

| Setting | Description | Example (macOS) | Example (Windows) |
|---------|-------------|-----------------|-------------------|
| `xcbasic3.basefolder` | External XC=BASIC installation (optional) | `/Applications/xc-basic3` | `C:\Program Files\xc-basic3` |
| `xcbasic3.emulator` | Vice emulator executable | `/Applications/vice-x86-64-gtk3-3.8/bin/x64sc` | `C:\Program Files\GTK3VICE-3.8-win64\bin\x64sc.exe` |
| `xcbasic3.debugger` | Retro Debugger executable | `/Applications/Retro Debugger.app/Contents/MacOS/Retro Debugger` | `C:\Program Files\RetroDebugger\RetroDebugger.exe` |
| `xcbasic3.builder` | c1541 disk builder | `/Applications/vice-x86-64-gtk3-3.8/bin/c1541` | `C:\Program Files\GTK3VICE-3.8-win64\bin\c1541.exe` |
| `xcbasic3.cruncher` | Exomizer executable | `/Applications/exomizer-3.1.2/src/exomizer` | `C:\Program Files\exomizer-3.1.2\src\exomizer.exe` |

### Tasks Configuration

The extension automatically creates `.vscode/tasks.json` with predefined build tasks. You can customize these tasks or create new ones.

#### Default Tasks

| Task | Shortcut | Description |
|------|----------|-------------|
| XC=BASIC Compile File | `Shift+F5` | Compiles `.bas` to `.prg` |
| XC=BASIC Run File | `Ctrl+F5` | Compiles and runs in emulator |
| XC=BASIC Debug File | `F5` | Compiles and opens in debugger |
| XC=BASIC Crunch File | - | Compiles and compresses with Exomizer |
| XC=BASIC Build Disk | - | Compiles and creates disk image |

#### Example Custom Task

Add this to your `.vscode/tasks.json` to create a custom compilation task:

```json
{
  "label": "XC=BASIC Compile with Custom Args",
  "type": "shell",
  "command": "${env:XCBASIC3_COMPILER}",
  "args": [
    "--dasm=${env:DASM_PATH}",
    "--target=c64",
    "--optimize",
    "${file}",
    "${fileBasenameNoExtension}.prg"
  ],
  "group": "build",
  "problemMatcher": "$xcbasic3"
}
```

## Usage Examples

### Basic Compilation

1. **Create a simple program** (`hello.bas`):
   ```basic
   PRINT "Hello from XC=BASIC!"
   FOR I = 1 TO 10
       PRINT "Count: "; I
   NEXT I
   ```

2. **Compile**: Press `Shift+F5` or use Command Palette → "Tasks: Run Task" → "XC=BASIC Compile File"

### Using Assembly Blocks

```basic
PRINT "Hello from XC=BASIC!"

ASM
loop
    INC $D020    ; Change border color
    JMP loop
END ASM
```

### Error Handling Example

If you have an error in your code:
```basic
PRONT "This has a typo!"  ; PRONT should be PRINT
```

The extension will:
- Show a red squiggly line under the error
- Display the error in the Problems panel
- Show the exact line and column of the error

### Working with External Tools

#### Running in Vice Emulator

1. Configure the emulator path in settings
2. Press `Ctrl+F5` to compile and run
3. The program will automatically load in Vice

#### Debugging with Retro Debugger

1. Configure the debugger path in settings
2. Press `F5` to compile and debug
3. The program will load in Retro Debugger with symbols

#### Creating Disk Images

Use the "XC=BASIC Build Disk" task to create a `.d64` disk image:
1. Run the task from Command Palette
2. The compiled program will be added to a new disk image
3. Load the disk in your emulator

## Commands

Access these commands via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `XC=BASIC Initialize tasks.json` | Creates/updates build tasks |
| `XC=BASIC Update Compiler` | Downloads latest XC=BASIC3 version |
| `XC=BASIC Run File` | Compile and run current file |
| `XC=BASIC Debug File` | Compile and debug current file |
| `XC=BASIC Compile File` | Compile current file |

## Advanced Configuration

### Using External XC=BASIC Installation

If you prefer to use your own XC=BASIC installation:

1. Set `xcbasic3.basefolder` to your installation path
2. Update your tasks to use `${config:xcbasic3.basefolder}/bin/xcbasic3` instead of `${env:XCBASIC3_COMPILER}`

### Custom Compiler Arguments

Add compiler arguments in your task configuration:

```json
{
  "label": "XC=BASIC Compile Optimized",
  "command": "${env:XCBASIC3_COMPILER}",
  "args": [
    "--dasm=${env:DASM_PATH}",
    "--target=c64",
    "--optimize",
    "--verbose",
    "${file}",
    "${fileBasenameNoExtension}.prg"
  ]
}
```

## Troubleshooting

### Common Issues

**Q: Error highlighting doesn't appear**
A: Make sure your task uses `"problemMatcher": "$xcbasic3"` in `.vscode/tasks.json`.

**Q: External tools don't work**
A: Check that the tool paths in settings are correct and the executables exist.

**Q: macOS security warnings**
A: Go to System Settings > Privacy & Security and click "Open Anyway" for blocked applications.

### Getting Help

1. Check the Problems panel (View → Problems) for detailed error messages
2. Look at the Terminal output for compilation details
3. Verify your settings in File → Preferences → Settings
4. Report issues at: https://github.com/orlof/xcb3-vscode-ext/issues

## Language Features

### Syntax Highlighting

The extension provides rich syntax highlighting for:
- XC=BASIC keywords and built-in functions
- String literals and numeric constants
- Comments (both `REM` and `'` style)
- Assembly blocks with 6502 instruction highlighting
- Type declarations and function definitions

### Code Folding

Fold these code blocks:
- `SUB` / `END SUB`
- `FUNCTION` / `END FUNCTION`
- `ASM` / `END ASM`

### Auto-Completion

Basic auto-completion for:
- Bracket pairs: `()`, `{}`
- String quotes: `""`

## Notes

**This extension is NOT:**
- **A Debugging Extension**: No support for VS Code's integrated debugger (stepping, breakpoints, variable inspection)
- **A Language Server**: No real-time code analysis, IntelliSense, or refactoring support

**This extension IS:**
- A syntax highlighter with build system integration
- A tool for managing the XC=BASIC compilation toolchain
- A bridge between VS Code and external Commodore development tools

## Thanks

* Syntax definitions based on work by:
  * https://github.com/Viza74/xcbasiclanguagevscodeext
  * https://github.com/zeh/vscode-dasm

* This extension downloads and uses:
  * **XC=BASIC 3**: https://xc-basic.net/
  * **DASM Assembler**: https://dasm-assembler.github.io/

## License

This extension is released under the MIT License. See LICENSE file for details.
