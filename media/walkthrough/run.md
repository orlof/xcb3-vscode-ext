# Compile and run

Run **XC=BASIC: New Project** to get a folder with a ready-to-run `main.bas`, or create a file called `hello.bas`:

```basic
PRINT "HELLO FROM XC=BASIC 3!"
```

| Keys | Action |
|---|---|
| **Ctrl+F5** (Cmd+F5 on macOS) | compile and start the emulator |
| **F5** | compile and start the debugger |
| **Shift+F5** | compile only |

Or click the **play** button in the editor title bar.

Press Ctrl+F5 again after a change: the previous emulator window is closed and the new build starts.

Compiled programs go to the `build` folder of your workspace (setting `xcbasic3.outputDir`).

Compilation errors are underlined in the editor and listed in the **Problems** panel. The full compiler output is in the **XC=BASIC** output channel.

## Finding your way around

The **Outline** view and the breadcrumbs list your `SUB`s, `FUNCTION`s, `TYPE`s, `CONST`s and labels. **F12** or Ctrl+click jumps to a definition, also when it lives in an `INCLUDE`d file.

## Projects with several files

If your program is split into files with `INCLUDE`, set `xcbasic3.mainFile` (for example `src/main.bas`) in the workspace settings. Then Ctrl+F5 builds the main program no matter which file is open. **New Project** sets this up for you.
