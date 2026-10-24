// Locating external tools (emulator, debugger) on the user's machine.
// No VS Code dependency so the detection logic can be exercised outside the extension host.

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export type ToolKind = 'emulator' | 'debugger';

/** A resolved tool ready to spawn: executable plus the arguments that go before the user's own. */
export interface ToolLaunch {
  exe: string;
  args: string[];
}

export interface ToolCandidate {
  /** Path as it should be stored in settings (may be a macOS .app bundle). */
  path: string;
  /** Short label for quick picks, e.g. "x64sc (VICE 3.10)". */
  label: string;
  detail?: string;
}

export interface ToolInfo {
  kind: ToolKind;
  /** Human readable name of the recommended product. */
  product: string;
  /** Executable base names in priority order (without .exe). */
  executables: string[];
  downloadUrl: string;
  /** Regex matched against folder / app names to decide whether to look inside. */
  folderPattern: RegExp;
  /** Open-dialog filter description. */
  dialogTitle: string;
}

export const TOOLS: Record<ToolKind, ToolInfo> = {
  emulator: {
    kind: 'emulator',
    product: 'VICE',
    executables: ['x64sc', 'x64', 'x128', 'xvic', 'xplus4', 'xpet', 'xscpu64', 'x16emu', 'xmega65'],
    downloadUrl: 'https://vice-emu.sourceforge.io/index.html#download',
    folderPattern: /vice/i,
    dialogTitle: 'Select the emulator executable (for example x64sc)'
  },
  debugger: {
    kind: 'debugger',
    product: 'Retro Debugger',
    executables: ['RetroDebugger', 'Retro Debugger', 'retrodebugger'],
    downloadUrl: 'https://github.com/slajerek/RetroDebugger/releases',
    folderPattern: /retro\s*debugger/i,
    dialogTitle: 'Select the Retro Debugger executable'
  }
};

const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';

// ---------------------------------------------------------------------------
// Target machines

export interface TargetInfo {
  /** Value of xcbasic3.target / --target. */
  id: string;
  /** Human readable machine name. */
  machine: string;
  /** Emulator executables (base names) that run this machine, preferred first. */
  emulators: string[];
  /** Arguments the emulator needs for this exact machine, placed before the user's emulatorArgs. */
  emulatorArgs: string[];
}

const VIC20 = (id: string, memory: string, label: string): TargetInfo => ({
  id,
  machine: `VIC-20 (${label})`,
  emulators: ['xvic'],
  emulatorArgs: ['-memory', memory]
});
const PET = (model: string): TargetInfo => ({
  id: `pet${model}`,
  machine: `PET ${model}`,
  emulators: ['xpet'],
  emulatorArgs: ['-model', model]
});

/** All compiler targets, in the order shown to the user. */
export const TARGETS: TargetInfo[] = [
  { id: 'c64', machine: 'Commodore 64', emulators: ['x64sc', 'x64'], emulatorArgs: [] },
  { id: 'c128', machine: 'Commodore 128', emulators: ['x128'], emulatorArgs: [] },
  VIC20('vic20', 'none', 'unexpanded'),
  VIC20('vic20_3k', '3k', '3K expansion'),
  VIC20('vic20_8k', '8k', '8K expansion'),
  VIC20('vic20_16k', '16k', '16K expansion'),
  VIC20('vic20_24k', '24k', '24K expansion'),
  { id: 'cplus4', machine: 'Commodore Plus/4', emulators: ['xplus4'], emulatorArgs: ['-model', 'plus4'] },
  { id: 'c16', machine: 'Commodore 16', emulators: ['xplus4'], emulatorArgs: ['-model', 'c16'] },
  PET('2001'), PET('3008'), PET('3016'), PET('3032'), PET('4016'), PET('4032'), PET('8032'),
  { id: 'x16', machine: 'Commander X16', emulators: ['x16emu'], emulatorArgs: ['-run', '-prg'] },
  { id: 'mega65', machine: 'MEGA65', emulators: ['xmega65', 'xemu-xmega65'], emulatorArgs: ['-prg'] }
];

/** Which emulator a target runs on. Unknown targets are treated like c64. */
export function targetInfo(target: string | undefined): TargetInfo {
  const id = (target ?? '').trim().toLowerCase();
  return TARGETS.find(t => t.id === id) ?? TARGETS[0];
}

/** "x64sc" for "/opt/vice/bin/x64sc", "C:\\VICE\\x64sc.exe" or "/Applications/vice/x64sc.app". */
export function executableBaseName(p: string): string {
  const last = p.split(/[\\/]/).filter(Boolean).pop() ?? '';
  return last.replace(/\.(exe|bat|cmd|app)$/i, '').toLowerCase();
}

/** True when the name is one of the emulators this extension knows (VICE family, X16, MEGA65). */
export function isKnownEmulator(p: string): boolean {
  const base = executableBaseName(p);
  return TOOLS.emulator.executables.some(e => e.toLowerCase() === base) || TARGETS.some(t => t.emulators.includes(base));
}

/**
 * Find another emulator from the same installation, e.g. x128 next to the configured x64sc.
 * `configured` is the settings value (may be a macOS .app), `resolvedExe` the launchable file for it.
 */
export function siblingExecutable(configured: string, resolvedExe: string, name: string): string | undefined {
  const dirs = [path.dirname(resolvedExe)];
  if (isMac) {
    const conf = expandHome(configured.trim());
    if (conf.endsWith('.app')) {
      const parent = path.dirname(conf);
      dirs.push(path.join(parent, 'bin'));
      const app = path.join(parent, `${name}.app`);
      if (isDir(app)) {
        const exe = resolveAppBundle(app);
        if (exe) return exe;
      }
    }
  }
  for (const dir of dirs) {
    for (const file of exeNames(name)) {
      const candidate = path.join(dir, file);
      if (isFile(candidate)) return candidate;
    }
  }
  return undefined;
}

function exists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function isFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function listDir(p: string): string[] {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

/** Expand a leading ~ to the home directory. */
export function expandHome(p: string): string {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) return path.join(os.homedir(), p.slice(2));
  return p;
}

/**
 * Resolve a macOS .app bundle to the executable inside it.
 * Returns undefined when the bundle cannot be resolved.
 */
export function resolveAppBundle(appPath: string): string | undefined {
  const macosDir = path.join(appPath, 'Contents', 'MacOS');
  if (!isDir(macosDir)) return undefined;

  const appName = path.basename(appPath, '.app');

  // Prefer the executable named in Info.plist (XML plists only, which is the common case).
  let bundleExe: string | undefined;
  const plist = path.join(appPath, 'Contents', 'Info.plist');
  try {
    const xml = fs.readFileSync(plist, 'utf8');
    const m = /<key>CFBundleExecutable<\/key>\s*<string>([^<]+)<\/string>/.exec(xml);
    if (m) {
      const candidate = path.join(macosDir, m[1].trim());
      if (isFile(candidate)) bundleExe = candidate;
    }
  } catch {
    // binary plist or unreadable: fall through
  }

  // VICE ships x64sc.app etc. as AppleScript droplets that cannot take a .prg on the command line.
  // Use the real binary from the sibling bin folder instead.
  if (bundleExe && /^(droplet|applet)$/i.test(path.basename(bundleExe))) {
    const sibling = path.join(path.dirname(appPath), 'bin', appName);
    if (isFile(sibling)) return sibling;
  }
  if (bundleExe) return bundleExe;

  // Fall back to the app name, then to the first file in Contents/MacOS.
  const byName = path.join(macosDir, appName);
  if (isFile(byName)) return byName;
  const first = listDir(macosDir).map(f => path.join(macosDir, f)).find(isFile);
  return first;
}

/**
 * Turn a user supplied path (settings value, dialog result) into something spawnable.
 * Returns undefined when the path does not point to an existing executable.
 */
export function resolveExecutable(userPath: string | undefined): string | undefined {
  if (!userPath || !userPath.trim()) return undefined;
  let p = expandHome(userPath.trim());

  if (isMac && p.endsWith('.app') && isDir(p)) {
    return resolveAppBundle(p);
  }
  if (isMac && isDir(p)) {
    // User picked a VICE install folder: look for bin/x64sc
    for (const exe of TOOLS.emulator.executables) {
      const inBin = path.join(p, 'bin', exe);
      if (isFile(inBin)) return inBin;
    }
    return undefined;
  }
  if (isWindows && !/\.(exe|bat|cmd)$/i.test(p) && isFile(p + '.exe')) {
    p = p + '.exe';
  }
  if (isFile(p)) return p;

  // A bare command name: look it up on PATH
  if (!p.includes(path.sep) && !p.includes('/')) {
    return findOnPath(p);
  }
  return undefined;
}

function exeNames(base: string): string[] {
  return isWindows ? [`${base}.exe`, `${base}.bat`, `${base}.cmd`] : [base];
}

export function findOnPath(command: string): string | undefined {
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  for (const dir of dirs) {
    for (const name of exeNames(command)) {
      const candidate = path.join(dir, name);
      if (isFile(candidate)) return candidate;
    }
  }
  return undefined;
}

function searchRoots(): string[] {
  const home = os.homedir();
  const roots: string[] = [];
  if (isMac) {
    roots.push('/Applications', path.join(home, 'Applications'), '/opt/homebrew/bin', '/usr/local/bin', '/opt/local/bin', path.join(home, 'Downloads'));
  } else if (isWindows) {
    const pf = process.env['ProgramFiles'] || 'C:\\Program Files';
    const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const local = process.env['LOCALAPPDATA'] || path.join(home, 'AppData', 'Local');
    roots.push(pf, pf86, path.join(local, 'Programs'), 'C:\\', path.join(home, 'Downloads'), path.join(home, 'Desktop'), path.join(home, 'scoop', 'apps'), 'C:\\tools');
  } else {
    roots.push('/usr/bin', '/usr/local/bin', '/usr/games', '/opt', path.join(home, '.local', 'bin'), path.join(home, 'opt'), '/snap/bin', path.join(home, 'Applications'), path.join(home, 'Downloads'));
  }
  return roots.filter(isDir);
}

function describeVersion(p: string): string | undefined {
  // Try to pull a version number out of the path, e.g. vice-arm64-gtk3-3.10 or GTK3VICE-3.8-win64
  const m = /(\d+\.\d+(?:\.\d+)?)/.exec(p);
  return m ? m[1] : undefined;
}

function addCandidate(list: ToolCandidate[], seen: Set<string>, p: string, product: string, exeName: string): void {
  let real = p;
  try {
    real = fs.realpathSync(p);
  } catch {
    return;
  }
  if (seen.has(real)) return;
  seen.add(real);
  const version = describeVersion(p);
  list.push({
    path: p,
    label: version ? `${exeName} (${product} ${version})` : `${exeName} (${product})`,
    detail: p
  });
}

/**
 * Look in the usual places for the given tool. Fast (synchronous file system checks only,
 * one directory level deep) so it can be run from a quick pick without a progress bar.
 */
export function detectTools(kind: ToolKind): ToolCandidate[] {
  const info = TOOLS[kind];
  const found: ToolCandidate[] = [];
  const seen = new Set<string>();

  // 1. PATH
  for (const exe of info.executables) {
    const onPath = findOnPath(exe);
    if (onPath) addCandidate(found, seen, onPath, info.product, exe);
  }

  // 2. Well-known folders, one level deep
  for (const root of searchRoots()) {
    // Executables directly in the root (e.g. /usr/local/bin/x64sc, /Applications/x64sc.app)
    for (const exe of info.executables) {
      for (const name of exeNames(exe)) {
        const direct = path.join(root, name);
        if (isFile(direct)) addCandidate(found, seen, direct, info.product, exe);
      }
      if (isMac) {
        const app = path.join(root, `${exe}.app`);
        if (isDir(app) && resolveAppBundle(app)) addCandidate(found, seen, app, info.product, exe);
      }
    }

    // Folders whose name matches the product (vice-arm64-gtk3-3.10, GTK3VICE-3.8-win64, RetroDebugger v0.64.72 ...)
    for (const entry of listDir(root)) {
      const full = path.join(root, entry);
      if (!info.folderPattern.test(entry)) continue;

      if (isMac && entry.endsWith('.app')) {
        if (resolveAppBundle(full)) addCandidate(found, seen, full, info.product, path.basename(entry, '.app'));
        continue;
      }
      if (!isDir(full)) continue;

      for (const exe of info.executables) {
        let foundBinary = false;
        for (const sub of ['bin', '']) {
          for (const name of exeNames(exe)) {
            const candidate = path.join(full, sub, name);
            if (isFile(candidate)) {
              addCandidate(found, seen, candidate, info.product, exe);
              foundBinary = true;
            }
          }
        }
        // Only offer the .app when there is no plain binary next to it (VICE .apps are droplet wrappers)
        if (isMac && !foundBinary) {
          for (const sub of ['', 'bin']) {
            const app = path.join(full, sub, `${exe}.app`);
            if (isDir(app) && resolveAppBundle(app)) addCandidate(found, seen, app, info.product, exe);
          }
        }
      }
    }
  }

  // Preferred executable first (x64sc before x64 before the others), then newest version first
  const rank = (c: ToolCandidate): number => {
    const base = path.basename(c.path).replace(/\.(exe|app)$/i, '').toLowerCase();
    const i = info.executables.findIndex(e => e.toLowerCase() === base);
    return i < 0 ? info.executables.length : i;
  };
  found.sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    const va = describeVersion(a.path) || '';
    const vb = describeVersion(b.path) || '';
    return vb.localeCompare(va, undefined, { numeric: true });
  });
  return found;
}

/** True when the configured value points at something we can launch. */
export function isToolUsable(configured: string | undefined): boolean {
  return resolveExecutable(configured) !== undefined;
}

export function pathExists(p: string): boolean {
  return exists(p);
}
