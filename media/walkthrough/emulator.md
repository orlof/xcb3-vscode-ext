# Pick your emulator

To *run* a program you need a Commodore emulator. The recommended one is **VICE**, and the executable to use is `x64sc`.

1. Install VICE from <https://vice-emu.sourceforge.io/> if you have not already.
2. If it is installed in the usual place (Applications, Program Files, `PATH` …) the extension picks it up by itself and tells you which one it chose.
3. To use a different installation, run **XC=BASIC: Setup** (or click the status bar item). The wizard lists the VICE installations it finds; pick one, or choose **Browse…** to locate it yourself.

On macOS you can pick `x64sc.app` or the `x64sc` binary inside the VICE `bin` folder, either works.

The emulator path is saved in your **user settings** (`xcbasic3.emulator`), so it applies to every project on this computer.

## Other machines

Set `xcbasic3.target` to `c128`, `vic20`, `cplus4`, `pet…` and **Compile and Run** starts the matching VICE program (`x128`, `xvic`, `xplus4`, `xpet`) from the same installation, with the right memory or model options.
