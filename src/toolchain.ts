// Manages the XC=BASIC 3 compiler and the DASM assembler.
//
// Binaries live in the extension's global storage folder (survives extension updates),
// not inside the extension installation folder as in versions <= 3.0.3.
//
// Several compiler versions can be installed side by side (one folder per version) and the
// active one is chosen with the setting xcbasic3.compilerVersion ("latest" or a tag such as v3.1.13).
// Versions are fetched from GitHub release assets when available (v3.2.0 and later) and from the
// tag's source archive otherwise (v3.1.13 and earlier shipped the binaries in the repository).

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { execFile } from 'child_process';
import axios from 'axios';
import AdmZip = require('adm-zip');
import * as tar from 'tar';
import { LATEST, normalizeTag, compareTagsDesc, brokenReason, newestUsable } from './versionUtil';

export type ToolchainStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

const REPO = 'neilsf/xc-basic3';
const API = `https://api.github.com/repos/${REPO}`;
const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const LAST_UPDATE_CHECK_KEY = 'xcbasic3.lastUpdateCheck';
const LATEST_VERSION_KEY = 'xcbasic3.latestVersion';
const SKIPPED_LATEST_KEY = 'xcbasic3.skippedLatest';
export { LATEST, normalizeTag, compareTagsDesc, brokenReason };

/** Versions offered even when GitHub cannot be reached. */
export const KNOWN_VERSIONS = ['v3.2.0', 'v3.1.13'];

// Release asset names are e.g. xcbasic3-v3.2.0-macOS.zip and the zip contains bin/<Platform>/xcbasic3
const COMPILER_PLATFORMS: { [key: string]: string } = {
  darwin: 'macOS',
  win32: 'Windows',
  linux: 'Linux'
};

const DASM_VERSION = '2.20.14.1';
const DASM_PLATFORMS: { [key: string]: string } = {
  darwin: 'osx-x64',
  win32: 'win-x64',
  linux: 'linux-x64'
};
const DASM_URLS: { [key: string]: string } = {
  darwin: `https://github.com/dasm-assembler/dasm/releases/download/${DASM_VERSION}/dasm-${DASM_VERSION}-osx-x64.tar.gz`,
  win32: `https://github.com/dasm-assembler/dasm/releases/download/${DASM_VERSION}/dasm-${DASM_VERSION}-win-x64.zip`,
  linux: `https://github.com/dasm-assembler/dasm/releases/download/${DASM_VERSION}/dasm-${DASM_VERSION}-linux-x64.tar.gz`
};

interface ReleaseInfo {
  version: string;
  assets: { name: string; browser_download_url: string }[];
}

export interface VersionInfo {
  tag: string;
  installed: boolean;
  /** Published date when known (from the GitHub API). */
  date?: string;
  prerelease?: boolean;
  /** Reason when the version is known to be broken on this platform. */
  broken?: string;
}

export interface ToolchainReport {
  platformSupported: boolean;
  compilerSource: 'managed' | 'external';
  compilerPath: string | undefined;
  compilerExists: boolean;
  /** Setting value: "latest" or a tag. */
  selectedVersion: string;
  /** Tag actually in use (resolved "latest"), when known. */
  activeVersion: string | undefined;
  /** Set when the newest GitHub release was skipped because it is broken on this platform. */
  skippedLatest: { tag: string; reason: string } | undefined;
  installedVersions: string[];
  dasmPath: string;
  dasmExists: boolean;
  storageDir: string;
  status: ToolchainStatus;
  lastError: string | undefined;
}

const isUnix = os.platform() === 'darwin' || os.platform() === 'linux';
const exeSuffix = os.platform() === 'win32' ? '.exe' : '';

function exists(p: string | undefined): boolean {
  if (!p) return false;
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise(resolve => {
    execFile(cmd, args, () => resolve());
  });
}

export class Toolchain implements vscode.Disposable {
  private _status: ToolchainStatus = 'idle';
  private readonly _onDidChangeStatus = new vscode.EventEmitter<ToolchainStatus>();
  readonly onDidChangeStatus = this._onDidChangeStatus.event;

  lastError: string | undefined;
  private inFlight: Promise<boolean> | undefined;
  private errorShownThisSession = false;

  readonly storageDir: string;
  private readonly legacyBinDir: string;

  constructor(private readonly context: vscode.ExtensionContext, private readonly output: vscode.OutputChannel) {
    this.storageDir = context.globalStorageUri.fsPath;
    this.legacyBinDir = path.join(context.extensionPath, 'bin');
  }

  dispose(): void {
    this._onDidChangeStatus.dispose();
  }

  get status(): ToolchainStatus {
    return this._status;
  }

  private setStatus(status: ToolchainStatus, error?: string): void {
    this._status = status;
    this.lastError = status === 'error' ? error : undefined;
    if (error) this.log(`ERROR: ${error}`);
    this._onDidChangeStatus.fire(status);
  }

  private log(message: string): void {
    this.output.appendLine(`[toolchain] ${message}`);
  }

  get platformSupported(): boolean {
    return os.platform() in COMPILER_PLATFORMS;
  }

  // ---------------------------------------------------------------------------
  // Versions and paths

  /** The setting value: "latest" or a tag. */
  get selectedVersion(): string {
    return normalizeTag(vscode.workspace.getConfiguration('xcbasic3').get<string>('compilerVersion', LATEST));
  }

  /** Last tag that GitHub reported as the latest release. */
  get knownLatest(): string | undefined {
    return this.context.globalState.get<string>(LATEST_VERSION_KEY);
  }

  /** Tag in use: the pinned one, or the latest known usable release, or the newest usable installed version. */
  get activeVersion(): string | undefined {
    const selected = this.selectedVersion;
    if (selected !== LATEST) return selected;
    const latest = this.knownLatest;
    if (latest) return latest;
    return newestUsable(this.installedVersions());
  }

  /** The newest GitHub release when it was skipped as broken on this platform. */
  get skippedLatest(): { tag: string; reason: string } | undefined {
    const tag = this.context.globalState.get<string>(SKIPPED_LATEST_KEY);
    const reason = tag ? brokenReason(tag) : undefined;
    return tag && reason ? { tag, reason } : undefined;
  }

  private versionDir(tag: string): string {
    return path.join(this.storageDir, `xcbasic3-${tag}`);
  }

  private compilerPathFor(tag: string): string {
    const platform = COMPILER_PLATFORMS[os.platform()] || 'unknown';
    return path.join(this.versionDir(tag), 'bin', platform, `xcbasic3${exeSuffix}`);
  }

  isInstalled(tag: string): boolean {
    return exists(this.compilerPathFor(tag));
  }

  /** Installed tags, newest first. */
  installedVersions(): string[] {
    let entries: string[] = [];
    try {
      entries = fs.readdirSync(this.storageDir);
    } catch {
      return [];
    }
    return entries
      .filter(e => e.startsWith('xcbasic3-v'))
      .map(e => e.substring('xcbasic3-'.length))
      .filter(tag => this.isInstalled(tag))
      .sort(compareTagsDesc);
  }

  private get dasmDir(): string {
    return path.join(this.storageDir, `dasm-${DASM_VERSION}-${DASM_PLATFORMS[os.platform()] || 'unknown'}`);
  }

  get dasmPath(): string {
    return path.join(this.dasmDir, `dasm${exeSuffix}`);
  }

  private externalBaseFolder(): string | undefined {
    const value = vscode.workspace.getConfiguration('xcbasic3').get<string>('basefolder', '').trim();
    return value || undefined;
  }

  /** Where the compiler should be: the user's own installation when configured, otherwise the managed one. */
  resolveCompiler(): { path: string | undefined; source: 'managed' | 'external' } {
    const base = this.externalBaseFolder();
    if (base) {
      const platform = COMPILER_PLATFORMS[os.platform()] || '';
      const candidates = [
        path.join(base, 'bin', platform, `xcbasic3${exeSuffix}`),
        path.join(base, 'bin', `xcbasic3${exeSuffix}`),
        path.join(base, `xcbasic3${exeSuffix}`)
      ];
      return { path: candidates.find(exists) || candidates[0], source: 'external' };
    }
    const tag = this.activeVersion;
    return { path: tag ? this.compilerPathFor(tag) : undefined, source: 'managed' };
  }

  /** Compiler path when it actually exists on disk, otherwise undefined. */
  get compilerPath(): string | undefined {
    const resolved = this.resolveCompiler();
    return exists(resolved.path) ? resolved.path : undefined;
  }

  get isReady(): boolean {
    return this.compilerPath !== undefined && exists(this.dasmPath);
  }

  /** Version label for the status bar: tag of the managed compiler, "external" for a user installation. */
  versionLabel(): string | undefined {
    const resolved = this.resolveCompiler();
    if (resolved.source === 'external') return 'external';
    return this.activeVersion;
  }

  report(): ToolchainReport {
    const resolved = this.resolveCompiler();
    return {
      platformSupported: this.platformSupported,
      compilerSource: resolved.source,
      compilerPath: resolved.path,
      compilerExists: exists(resolved.path),
      selectedVersion: this.selectedVersion,
      activeVersion: resolved.source === 'managed' ? this.activeVersion : undefined,
      skippedLatest: this.selectedVersion === LATEST ? this.skippedLatest : undefined,
      installedVersions: this.installedVersions(),
      dasmPath: this.dasmPath,
      dasmExists: exists(this.dasmPath),
      storageDir: this.storageDir,
      status: this._status,
      lastError: this.lastError
    };
  }

  // ---------------------------------------------------------------------------
  // Migration from older layouts

  private readVersionFile(dir: string): string | undefined {
    try {
      const v = fs.readFileSync(path.join(dir, 'version.txt'), 'utf8').trim();
      return v ? normalizeTag(v) : undefined;
    } catch {
      return undefined;
    }
  }

  private migrateLegacy(): void {
    try {
      fs.mkdirSync(this.storageDir, { recursive: true });

      // Unversioned folder written by a pre-release of this extension version
      const unversioned = path.join(this.storageDir, 'xcbasic3');
      if (exists(unversioned)) {
        const tag = this.readVersionFile(unversioned);
        if (tag && !this.isInstalled(tag)) {
          fs.renameSync(unversioned, this.versionDir(tag));
          this.log(`Moved ${unversioned} to ${this.versionDir(tag)}`);
        } else {
          fs.rmSync(unversioned, { recursive: true, force: true });
        }
      }

      // <= 3.0.3 kept binaries inside the extension folder
      if (exists(this.legacyBinDir)) {
        for (const legacy of ['xcbasic3', 'xc-basic3-main']) {
          const dir = path.join(this.legacyBinDir, legacy);
          if (!exists(dir)) continue;
          const tag = this.readVersionFile(dir);
          if (tag && !this.isInstalled(tag)) {
            fs.cpSync(dir, this.versionDir(tag), { recursive: true });
            if (!this.isInstalled(tag)) fs.rmSync(this.versionDir(tag), { recursive: true, force: true });
            else this.log(`Migrated compiler ${tag} from ${dir}`);
          }
        }
        if (!exists(this.dasmPath)) {
          const legacyDasm = path.join(this.legacyBinDir, path.basename(this.dasmDir));
          if (exists(legacyDasm)) {
            fs.cpSync(legacyDasm, this.dasmDir, { recursive: true });
            this.log(`Migrated DASM from ${legacyDasm}`);
          }
        }
      }
    } catch (error: any) {
      this.log(`Legacy migration skipped: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // GitHub

  private async apiGet(url: string): Promise<any> {
    const response = await axios.get(url, {
      timeout: 20000,
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'xcb3-vscode-ext' }
    });
    return response.data;
  }

  /**
   * Newest release that is not known to be broken on this platform, plus the release that was
   * skipped to get there (if any).
   */
  private async fetchLatestUsable(): Promise<{ usable: string; skipped?: string }> {
    const releases: any[] = await this.apiGet(`${API}/releases?per_page=15`);
    const tags = releases
      .filter(r => !r.draft && !r.prerelease)
      .map(r => normalizeTag(r.tag_name))
      .sort(compareTagsDesc);
    if (tags.length === 0) throw new Error('GitHub returned no releases');
    const usable = newestUsable(tags);
    if (!usable) throw new Error(`No release works on this platform (newest is ${tags[0]})`);
    return { usable, skipped: usable !== tags[0] ? tags[0] : undefined };
  }

  private async fetchRelease(tag: string): Promise<ReleaseInfo | undefined> {
    try {
      const data = await this.apiGet(`${API}/releases/tags/${encodeURIComponent(tag)}`);
      return { version: normalizeTag(data.tag_name), assets: data.assets || [] };
    } catch (error: any) {
      if (error?.response?.status === 404) return undefined;
      throw error;
    }
  }

  /** Versions available for the picker: GitHub tags when reachable, otherwise the built-in list, plus installed ones. */
  async availableVersions(): Promise<{ versions: VersionInfo[]; online: boolean }> {
    const installed = new Set(this.installedVersions());
    const byTag = new Map<string, VersionInfo>();
    let online = false;
    try {
      const releases: any[] = await this.apiGet(`${API}/releases?per_page=15`);
      for (const r of releases) {
        const tag = normalizeTag(r.tag_name);
        byTag.set(tag, {
          tag,
          installed: installed.has(tag),
          date: (r.published_at || '').slice(0, 10),
          prerelease: !!r.prerelease,
          broken: brokenReason(tag)
        });
      }
      online = true;
    } catch (error: any) {
      this.log(`Could not list releases: ${error.message}`);
    }
    for (const tag of [...KNOWN_VERSIONS, ...installed]) {
      if (!byTag.has(tag)) byTag.set(tag, { tag, installed: installed.has(tag), broken: brokenReason(tag) });
    }
    const versions = [...byTag.values()].sort((a, b) => compareTagsDesc(a.tag, b.tag));
    return { versions, online };
  }

  private async download(url: string): Promise<Buffer> {
    this.log(`Downloading ${url}`);
    const response = await axios({ url, method: 'GET', responseType: 'arraybuffer', timeout: 180000 });
    return Buffer.from(response.data);
  }

  private async makeRunnable(file: string, dir: string): Promise<void> {
    if (!isUnix) return;
    try {
      fs.chmodSync(file, 0o755);
    } catch (error: any) {
      this.log(`chmod failed for ${file}: ${error.message}`);
    }
    if (os.platform() === 'darwin') {
      // Gatekeeper: strip the quarantine flag so the user is not asked to allow the binary by hand
      await run('/usr/bin/xattr', ['-dr', 'com.apple.quarantine', dir]);
    }
  }

  /**
   * Install one compiler version into its own folder. Uses the release asset for this platform
   * when the release has one, otherwise the tag's source archive (older versions shipped binaries in bin/).
   */
  private async installVersion(tag: string): Promise<void> {
    const platformName = COMPILER_PLATFORMS[os.platform()];
    let url: string | undefined;

    const release = await this.fetchRelease(tag);
    const asset = release?.assets.find(a => a.name.endsWith(`-${platformName}.zip`));
    if (asset) {
      url = asset.browser_download_url;
    } else {
      url = `https://github.com/${REPO}/archive/refs/tags/${tag}.zip`;
      this.log(`Release ${tag} has no ${platformName} asset, using the tag archive`);
    }

    const data = await this.download(url);

    // Extract to a temporary folder first so that a broken download never replaces a working install
    const tmpDir = path.join(this.storageDir, `download-${tag}`);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    new AdmZip(data).extractAllTo(tmpDir, true);

    // Both archive kinds contain a single top-level folder (xcbasic3-v3.2.0-macOS/ or xc-basic3-3.1.13/)
    const entries = fs.readdirSync(tmpDir);
    const extractedRoot =
      entries.length === 1 && fs.statSync(path.join(tmpDir, entries[0])).isDirectory()
        ? path.join(tmpDir, entries[0])
        : tmpDir;

    const compilerInArchive = path.join(extractedRoot, 'bin', platformName, `xcbasic3${exeSuffix}`);
    if (!exists(compilerInArchive)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      throw new Error(`XC=BASIC 3 ${tag} has no ${platformName} binary`);
    }

    const target = this.versionDir(tag);
    fs.rmSync(target, { recursive: true, force: true });
    fs.renameSync(extractedRoot, target);
    fs.rmSync(tmpDir, { recursive: true, force: true });

    const compiler = this.compilerPathFor(tag);
    await this.makeRunnable(compiler, target);
    fs.writeFileSync(path.join(target, 'version.txt'), tag);
    this.log(`Installed XC=BASIC 3 ${tag} to ${target}`);
  }

  private async installDasm(): Promise<void> {
    const url = DASM_URLS[os.platform()];
    if (!url) throw new Error('DASM is not available for this operating system');

    const data = await this.download(url);
    fs.rmSync(this.dasmDir, { recursive: true, force: true });
    fs.mkdirSync(this.dasmDir, { recursive: true });

    if (url.endsWith('.zip')) {
      new AdmZip(data).extractAllTo(this.dasmDir, true);
    } else {
      const tmpFile = path.join(this.storageDir, 'dasm-download.tar.gz');
      fs.writeFileSync(tmpFile, data);
      try {
        await tar.x({ file: tmpFile, cwd: this.dasmDir });
      } finally {
        fs.rmSync(tmpFile, { force: true });
      }
    }

    if (!exists(this.dasmPath)) {
      // Some archives nest the files one level deeper; look for the executable and move it up
      const nested = this.findFile(this.dasmDir, `dasm${exeSuffix}`);
      if (nested) {
        fs.cpSync(path.dirname(nested), this.dasmDir, { recursive: true });
      }
    }
    if (!exists(this.dasmPath)) {
      throw new Error(`DASM not found after extraction: ${this.dasmPath}`);
    }
    await this.makeRunnable(this.dasmPath, this.dasmDir);
    this.log(`Installed DASM ${DASM_VERSION} to ${this.dasmDir}`);
  }

  private findFile(dir: string, name: string, depth = 0): string | undefined {
    if (depth > 3) return undefined;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === name) return full;
      if (entry.isDirectory()) {
        const found = this.findFile(full, name, depth + 1);
        if (found) return found;
      }
    }
    return undefined;
  }

  // ---------------------------------------------------------------------------
  // Public API

  /**
   * Make sure the selected compiler version and DASM are installed. Downloads what is missing and,
   * when "latest" is selected and a check is due, asks GitHub for a newer release. Safe to call concurrently.
   *
   * @param options.forceUpdateCheck  check for a new release even if checked recently
   * @param options.interactive       show "up to date" / failure messages even when nothing changed
   */
  ensureReady(options: { forceUpdateCheck?: boolean; interactive?: boolean } = {}): Promise<boolean> {
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.doEnsureReady(options).finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  private async doEnsureReady(options: { forceUpdateCheck?: boolean; interactive?: boolean }): Promise<boolean> {
    if (!this.platformSupported) {
      this.setStatus('error', `Unsupported operating system: ${os.platform()}`);
      return false;
    }

    this.migrateLegacy();

    const resolved = this.resolveCompiler();

    if (resolved.source === 'external') {
      if (!exists(resolved.path)) {
        const message = `Compiler not found in the configured xcbasic3.basefolder: ${resolved.path}`;
        this.setStatus('error', message);
        this.offerFix(message, options.interactive);
        return false;
      }
      this.log(`Using external compiler ${resolved.path}`);
    } else if (this.selectedVersion === LATEST) {
      if (!(await this.ensureLatest(options))) return false;
    } else {
      if (!(await this.ensurePinned(this.selectedVersion, options))) return false;
    }

    if (!exists(this.dasmPath)) {
      this.setStatus('downloading');
      try {
        await this.withDownloadProgress('XC=BASIC: downloading DASM assembler', () => this.installDasm(), true);
      } catch (error: any) {
        const message = `Could not install the DASM assembler: ${error.message}`;
        this.setStatus('error', message);
        this.offerFix(message, options.interactive);
        return false;
      }
    }

    this.applyEnvironment();
    this.setStatus('ready');
    return true;
  }

  /** "latest" mode: follow GitHub's latest release, checking at most once a day. */
  private async ensureLatest(options: { forceUpdateCheck?: boolean; interactive?: boolean }): Promise<boolean> {
    const known = this.knownLatest;
    const haveCompiler = known !== undefined && this.isInstalled(known);
    const haveAny = this.installedVersions().length > 0;
    const autoUpdate = vscode.workspace.getConfiguration('xcbasic3').get<boolean>('autoUpdateCompiler', true);
    const lastCheck = this.context.globalState.get<number>(LAST_UPDATE_CHECK_KEY, 0);
    const checkDue = options.forceUpdateCheck || !known || (autoUpdate && Date.now() - lastCheck > UPDATE_CHECK_INTERVAL_MS);

    let latest = known;
    if (!haveCompiler || checkDue) {
      this.setStatus('checking');
      try {
        const result = await this.fetchLatestUsable();
        latest = result.usable;
        await this.context.globalState.update(LATEST_VERSION_KEY, latest);
        await this.context.globalState.update(SKIPPED_LATEST_KEY, result.skipped);
        await this.context.globalState.update(LAST_UPDATE_CHECK_KEY, Date.now());
        if (result.skipped) {
          this.log(`Skipping ${result.skipped}: ${brokenReason(result.skipped)}. Using ${latest} instead.`);
        }
      } catch (error: any) {
        const fallback = newestUsable(this.installedVersions());
        if (haveCompiler || fallback) {
          // Offline or rate limited: keep using what we have, no popup
          this.log(`Update check skipped: ${error.message}`);
          if (options.interactive) {
            vscode.window.showWarningMessage(`XC=BASIC: could not check for updates (${error.message}).`);
          }
          if (!haveCompiler) this.log(`Using installed ${fallback} until GitHub is reachable`);
          return true;
        }
        const message = `Could not download the XC=BASIC 3 compiler: ${error.message}`;
        this.setStatus('error', message);
        this.offerFix(message, options.interactive);
        return false;
      }
    }

    if (latest && !this.isInstalled(latest)) {
      this.setStatus('downloading');
      try {
        await this.withDownloadProgress(
          `XC=BASIC: ${haveAny ? 'updating' : 'downloading'} compiler ${latest}`,
          () => this.installVersion(latest!),
          !haveAny || !!options.interactive
        );
        vscode.window.showInformationMessage(
          haveAny ? `XC=BASIC 3 compiler updated to ${latest}.` : `XC=BASIC 3 compiler ${latest} installed.`
        );
      } catch (error: any) {
        if (haveAny) {
          this.log(`Update to ${latest} failed, keeping ${newestUsable(this.installedVersions()) ?? this.installedVersions()[0]}: ${error.message}`);
          return true;
        }
        const message = `Could not install the XC=BASIC 3 compiler: ${error.message}`;
        this.setStatus('error', message);
        this.offerFix(message, options.interactive);
        return false;
      }
    } else if (options.interactive && latest) {
      vscode.window.showInformationMessage(`XC=BASIC 3 compiler ${latest} is up to date.`);
    }
    return true;
  }

  /** Pinned mode: install the chosen tag once, never check for updates. */
  private async ensurePinned(tag: string, options: { interactive?: boolean }): Promise<boolean> {
    if (this.isInstalled(tag)) {
      if (options.interactive) vscode.window.showInformationMessage(`XC=BASIC 3 compiler is pinned to ${tag}.`);
      return true;
    }
    this.setStatus('downloading');
    try {
      await this.withDownloadProgress(`XC=BASIC: downloading compiler ${tag}`, () => this.installVersion(tag), true);
      vscode.window.showInformationMessage(`XC=BASIC 3 compiler ${tag} installed.`);
      return true;
    } catch (error: any) {
      const message = `Could not install XC=BASIC 3 ${tag}: ${error.message}`;
      this.setStatus('error', message);
      this.offerFix(message, options.interactive, true);
      return false;
    }
  }

  /** Change the selected version (setting) and install it if needed. */
  async selectVersion(tag: string): Promise<boolean> {
    const value = normalizeTag(tag);
    const config = vscode.workspace.getConfiguration('xcbasic3');
    const info = config.inspect<string>('compilerVersion');
    let target = vscode.ConfigurationTarget.Global;
    if (info?.workspaceFolderValue !== undefined) target = vscode.ConfigurationTarget.WorkspaceFolder;
    else if (info?.workspaceValue !== undefined) target = vscode.ConfigurationTarget.Workspace;
    await config.update('compilerVersion', value, target);
    this.log(`Compiler version set to ${value}`);
    return this.ensureReady({ forceUpdateCheck: value === LATEST, interactive: true });
  }

  private withDownloadProgress<T>(title: string, work: () => Promise<T>, visible: boolean): Promise<T> {
    if (!visible) return work();
    return Promise.resolve(vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title }, () => work()));
  }

  private offerFix(message: string, interactive?: boolean, versionProblem = false): void {
    if (!interactive && this.errorShownThisSession) return;
    this.errorShownThisSession = true;
    const actions = versionProblem
      ? ['Retry', 'Select Compiler Version…', 'Show Output']
      : ['Retry', 'Show Output', 'Use own installation…'];
    vscode.window.showErrorMessage(message, ...actions).then(choice => {
      if (choice === 'Retry') {
        this.ensureReady({ forceUpdateCheck: true, interactive: true });
      } else if (choice === 'Show Output') {
        this.output.show(true);
      } else if (choice === 'Use own installation…') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'xcbasic3.basefolder');
      } else if (choice === 'Select Compiler Version…') {
        vscode.commands.executeCommand('orlof-xcbasic3.XC=BASICSelectVersion');
      }
    });
  }

  /**
   * Expose the tool paths to tasks.json users (${env:XCBASIC3_COMPILER}, ${env:DASM_PATH})
   * and to the integrated terminal.
   */
  private applyEnvironment(): void {
    const compiler = this.compilerPath;
    if (!compiler) return;
    process.env.XCBASIC3_COMPILER = compiler;
    process.env.DASM_PATH = this.dasmPath;
    const dasmDir = path.dirname(this.dasmPath);
    if (!(process.env.PATH || '').split(path.delimiter).includes(dasmDir)) {
      process.env.PATH = `${dasmDir}${path.delimiter}${process.env.PATH || ''}`;
    }

    const env = this.context.environmentVariableCollection;
    env.description = 'XC=BASIC 3 compiler and DASM assembler';
    env.replace('XCBASIC3_COMPILER', compiler);
    env.replace('DASM_PATH', this.dasmPath);
    env.prepend('PATH', `${dasmDir}${path.delimiter}`);
  }
}
