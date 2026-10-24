// Unit test for target -> emulator mapping. Run: npm run compile && npm test
const assert = require('assert');
const { TARGETS, targetInfo, executableBaseName, isKnownEmulator } = require('../dist/tools.js');

assert.deepStrictEqual(targetInfo('c64').emulators, ['x64sc', 'x64']);
assert.deepStrictEqual(targetInfo('c64').emulatorArgs, []);
assert.deepStrictEqual(targetInfo('C128').emulators, ['x128']);
assert.deepStrictEqual(targetInfo('vic20').emulatorArgs, ['-memory', 'none']);
assert.deepStrictEqual(targetInfo('vic20_8k').emulatorArgs, ['-memory', '8k']);
assert.deepStrictEqual(targetInfo('c16').emulatorArgs, ['-model', 'c16']);
assert.deepStrictEqual(targetInfo('pet4032').emulatorArgs, ['-model', '4032']);
assert.strictEqual(targetInfo('pet4032').emulators[0], 'xpet');
assert.strictEqual(targetInfo(undefined).id, 'c64');
assert.strictEqual(targetInfo('bogus').id, 'c64');

// Every target listed in package.json has a mapping
const enumTargets = require('../package.json').contributes.configuration[0].properties['xcbasic3.target'].enum;
assert.deepStrictEqual(TARGETS.map(t => t.id), enumTargets);

assert.strictEqual(executableBaseName('/opt/vice/bin/x64sc'), 'x64sc');
assert.strictEqual(executableBaseName('C:\\VICE\\X64SC.EXE'), 'x64sc');
assert.strictEqual(executableBaseName('/Applications/vice/x128.app'), 'x128');
assert.ok(isKnownEmulator('/usr/bin/xvic'));
assert.ok(isKnownEmulator('C:\\x16\\x16emu.exe'));
assert.ok(!isKnownEmulator('/home/me/run-my-emu.sh'));

console.log('tools: all tests passed');
