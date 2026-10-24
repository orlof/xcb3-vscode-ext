// Pure helpers for compiler version tags. No VS Code dependency so they can be unit tested with plain Node.

export const LATEST = 'latest';

export interface BrokenVersion {
  tag: string;
  /** process.platform values on which the version must not be chosen automatically. */
  platforms: string[];
  reason: string;
}

/**
 * Compiler releases that are known not to work on some platform. "latest" skips these and
 * uses the newest working release instead; the user can still pin them explicitly.
 * Remove entries once upstream ships a fixed release (latest then moves on by itself anyway).
 */
export const BROKEN_VERSIONS: BrokenVersion[] = [
  {
    tag: 'v3.2.0',
    platforms: ['win32'],
    reason: 'passes quoted file names to DASM, every build fails on Windows (xc-basic3 commit c6a519e)'
  }
];

/** Why the tag must not be used automatically on this platform, or undefined when it is fine. */
export function brokenReason(tag: string, platform: string = process.platform): string | undefined {
  const hit = BROKEN_VERSIONS.find(b => b.tag === normalizeTag(tag) && b.platforms.includes(platform));
  return hit?.reason;
}

/** Newest tag from the list that is not known to be broken on this platform. */
export function newestUsable(tags: string[], platform: string = process.platform): string | undefined {
  return [...tags].sort(compareTagsDesc).find(t => !brokenReason(t, platform));
}

/** Normalise user input such as "3.1.13" or " V3.1.13 " to "v3.1.13"; empty or "latest" to "latest". */
export function normalizeTag(input: string): string {
  const t = (input ?? '').trim();
  if (!t || t.toLowerCase() === LATEST) return LATEST;
  return /^v/i.test(t) ? 'v' + t.slice(1) : 'v' + t;
}

/** Sort comparator: newest first, final release before its pre-releases (v3.2.0, v3.2.0-beta, v3.1.13 ...). */
export function compareTagsDesc(a: string, b: string): number {
  const parse = (t: string) => {
    const m = /^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(t);
    return m ? { nums: [+m[1], +m[2], +m[3]], pre: m[4] ?? '' } : { nums: [-1, -1, -1], pre: t };
  };
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa.nums[i] !== pb.nums[i]) return pb.nums[i] - pa.nums[i];
  }
  if (!pa.pre && pb.pre) return -1;
  if (pa.pre && !pb.pre) return 1;
  return pa.pre.localeCompare(pb.pre);
}
