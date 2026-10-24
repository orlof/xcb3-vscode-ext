// Minimal unit test for the compiler output parser. Run: npm run compile && npm test
const assert = require('assert');
const { parseCompilerOutput, summarize } = require('../dist/compilerOutput.js');

const sample = [
  'err.bas:2.6: syntax error near \'"X"\' in file err.bas in line 2',
  '/abs/path/main.bas:10.0: ERROR: Undefined symbol FOO',
  'lib/util.bas:3.1: WARNING: Unused variable',
  '** ERROR ** Failed to open source file - nofile.bas: No such file or directory',
  '/tmp/xcbtmp_1234.asm (57): error: Unknown Mnemonic \'foo\'.',
  'Fatal assembly error: Unable to open file.',
  'Complete. (0)',
  '|Program code   | $080D | $0852 |'
].join('\n');

const msgs = parseCompilerOutput(sample);
assert.strictEqual(msgs.length, 6, JSON.stringify(msgs, null, 2));

assert.deepStrictEqual(msgs[0], { file: 'err.bas', line: 2, column: 6, message: 'syntax error near \'"X"\' in file err.bas in line 2', severity: 'error' });
assert.deepStrictEqual(msgs[1], { file: '/abs/path/main.bas', line: 10, column: 0, message: 'Undefined symbol FOO', severity: 'error' });
assert.deepStrictEqual(msgs[2], { file: 'lib/util.bas', line: 3, column: 1, message: 'Unused variable', severity: 'warning' });
assert.strictEqual(msgs[3].file, undefined);
assert.strictEqual(msgs[3].message, 'Failed to open source file - nofile.bas: No such file or directory');
assert.strictEqual(msgs[4].message, "DASM: Unknown Mnemonic 'foo'. (generated assembly line 57)");
assert.strictEqual(msgs[5].message, 'DASM: Unable to open file.');

// Windows style paths with drive letters must keep the drive
const win = parseCompilerOutput('C:\\Users\\me\\proj\\main.bas:4.2: ERROR: boom');
assert.strictEqual(win.length, 1);
assert.strictEqual(win[0].file, 'C:\\Users\\me\\proj\\main.bas');
assert.strictEqual(win[0].line, 4);

assert.strictEqual(summarize(msgs), 'err.bas:2 syntax error near \'"X"\' in file err.bas in line 2');
assert.strictEqual(parseCompilerOutput('Complete. (0)').length, 0);

console.log('compilerOutput: all tests passed');
