// Unit test for compiler version tag helpers. Run: npm run compile && npm test
const assert = require('assert');
const { normalizeTag, compareTagsDesc, brokenReason, newestUsable, LATEST } = require('../dist/versionUtil.js');

// Known-broken releases are skipped only on the affected platform
assert.ok(brokenReason('v3.2.0', 'win32'));
assert.ok(brokenReason('3.2.0', 'win32'));
assert.strictEqual(brokenReason('v3.2.0', 'darwin'), undefined);
assert.strictEqual(brokenReason('v3.1.13', 'win32'), undefined);
assert.strictEqual(newestUsable(['v3.1.13', 'v3.2.0'], 'win32'), 'v3.1.13');
assert.strictEqual(newestUsable(['v3.1.13', 'v3.2.0'], 'linux'), 'v3.2.0');
assert.strictEqual(newestUsable(['v3.2.0'], 'win32'), undefined);
assert.strictEqual(newestUsable([], 'win32'), undefined);

assert.strictEqual(normalizeTag('3.1.13'), 'v3.1.13');
assert.strictEqual(normalizeTag(' V3.1.13 '), 'v3.1.13');
assert.strictEqual(normalizeTag('v3.2.0'), 'v3.2.0');
assert.strictEqual(normalizeTag(''), LATEST);
assert.strictEqual(normalizeTag('Latest'), LATEST);
assert.strictEqual(normalizeTag(undefined), LATEST);

const sorted = ['v3.1.13', 'v3.2.0-beta', 'v3.2.0', 'v3.1.9', 'v3.10.0', 'junk'].sort(compareTagsDesc);
assert.deepStrictEqual(sorted, ['v3.10.0', 'v3.2.0', 'v3.2.0-beta', 'v3.1.13', 'v3.1.9', 'junk']);

console.log('versionUtil: all tests passed');
