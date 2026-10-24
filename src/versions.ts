// "XC=BASIC: Select Compiler Version" quick pick.

import * as vscode from 'vscode';
import { Toolchain, LATEST, normalizeTag } from './toolchain';

interface VersionItem extends vscode.QuickPickItem {
  tag?: string;
  action: 'select' | 'manual';
}

export async function selectCompilerVersion(toolchain: Toolchain): Promise<void> {
  const selected = toolchain.selectedVersion;
  const active = toolchain.activeVersion;

  const { versions, online } = await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Window, title: 'XC=BASIC: listing compiler versions' },
    () => toolchain.availableVersions()
  );

  const items: VersionItem[] = [];
  const latestTag = toolchain.knownLatest ?? versions.find(v => !v.prerelease && !v.broken)?.tag;
  const skipped = toolchain.skippedLatest;
  items.push({
    label: `$(${selected === LATEST ? 'check' : 'circle-outline'}) Latest release`,
    description: latestTag ? `${latestTag}, updates automatically` : 'updates automatically',
    detail: [
      selected === LATEST ? 'current choice' : undefined,
      skipped ? `${skipped.tag} is skipped on this platform: ${skipped.reason}` : undefined
    ].filter(Boolean).join(' · ') || undefined,
    tag: LATEST,
    action: 'select'
  });
  items.push({ label: 'Pin to a version', kind: vscode.QuickPickItemKind.Separator, action: 'select' });
  for (const v of versions) {
    const isCurrent = selected === v.tag;
    const notes: string[] = [];
    if (v.date) notes.push(v.date);
    if (v.prerelease) notes.push('pre-release');
    if (v.installed) notes.push('installed');
    else notes.push('will be downloaded');
    const details: string[] = [];
    if (isCurrent) details.push('current choice');
    else if (v.tag === active && selected === LATEST) details.push('in use via "Latest release"');
    if (v.broken) details.push(`Known problem on this platform: ${v.broken}`);
    items.push({
      label: `$(${isCurrent ? 'check' : v.broken ? 'warning' : 'circle-outline'}) ${v.tag}`,
      description: notes.join(' · '),
      detail: details.join(' · ') || undefined,
      tag: v.tag,
      action: 'select'
    });
  }
  items.push({ label: '', kind: vscode.QuickPickItemKind.Separator, action: 'select' });
  items.push({ label: '$(edit) Enter a tag…', description: 'for example v3.1.12', action: 'manual', alwaysShow: true });

  const picked = await vscode.window.showQuickPick(items, {
    title: 'XC=BASIC: Compiler Version',
    placeHolder: online
      ? 'Choose the XC=BASIC 3 compiler version to use. Pinned versions are never updated automatically.'
      : 'GitHub could not be reached: showing known and installed versions only.',
    matchOnDescription: true,
    ignoreFocusOut: true
  });
  if (!picked) return;

  let tag = picked.tag;
  if (picked.action === 'manual') {
    const input = await vscode.window.showInputBox({
      title: 'XC=BASIC compiler version',
      prompt: 'Git tag of the release, e.g. v3.1.13. Versions before v3.2.0 are fetched from the tag archive.',
      value: selected === LATEST ? '' : selected,
      validateInput: v => (/^v?\d+\.\d+\.\d+(-[\w.]+)?$/i.test(v.trim()) || v.trim().toLowerCase() === LATEST ? undefined : 'Expected a version like v3.1.13'),
      ignoreFocusOut: true
    });
    if (!input) return;
    tag = normalizeTag(input);
  }
  if (!tag) return;

  if (tag === selected) {
    vscode.window.showInformationMessage(
      tag === LATEST ? 'XC=BASIC already follows the latest release.' : `XC=BASIC compiler is already pinned to ${tag}.`
    );
    return;
  }
  await toolchain.selectVersion(tag);
}
