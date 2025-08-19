# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-08-19

### Added

- **Language Server Protocol (LSP) support** - Major new feature providing:
  - IntelliSense with auto-completion for keywords, built-in functions, and data types
  - Hover information with detailed documentation for keywords and functions
  - Error highlighting with compilation errors shown directly in the editor
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
