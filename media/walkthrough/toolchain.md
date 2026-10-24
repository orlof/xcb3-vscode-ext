# Compiler and assembler

The extension downloads the **XC=BASIC 3 compiler** and the **DASM assembler** the first time you open a `.bas` file, and keeps the compiler up to date once a day.

Nothing else needs to be installed to compile a program.

The status bar item at the bottom left shows what is going on:

| Status bar | Meaning |
|---|---|
| `⟳ XC=BASIC` | checking for updates |
| `⇩ XC=BASIC: downloading…` | first download in progress |
| `✓ XC=BASIC` | ready |
| `⚠ XC=BASIC: setup` | compiler ready, emulator not configured yet |
| `✖ XC=BASIC` | download failed, click for options |

Click the item at any time for a menu with all XC=BASIC actions.

**Offline or behind a proxy?** Download a release from <https://github.com/neilsf/xc-basic3/releases>, unzip it and point the setting `xcbasic3.basefolder` at the unzipped folder.
