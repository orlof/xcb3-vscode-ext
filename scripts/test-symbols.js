// Unit test for the language server's symbol parser. Run: npm run compile && npm test
const assert = require('assert');
const { parseSymbols, findIncludes, findDefinitions, stripComment, wordAt } = require('../dist/server/symbols.js');

const source = [
  "' header comment with SUB fake()",                 // 0
  'INCLUDE "lib/util.bas"',                           // 1
  'CONST BORDER = $D020 \' border colour',            // 2
  'TYPE Point',                                       // 3
  '    x AS INT',                                     // 4
  '    y AS INT',                                     // 5
  'END TYPE',                                         // 6
  'DECLARE SUB draw(p AS Point) SHARED',              // 7
  'DIM pt AS Point',                                  // 8
  'sub draw(p AS Point) SHARED',                      // 9
  '    PRINT p.x: REM label: not a label',            // 10
  '    ASM',                                          // 11
  'asmlabel:',                                        // 12
  '    END ASM',                                      // 13
  'END SUB',                                          // 14
  'FUNCTION add AS INT (a AS INT, b AS INT) STATIC',  // 15
  '    RETURN a + b',                                 // 16
  'END FUNCTION',                                     // 17
  'main:',                                            // 18
  'PRINT: PRINT "x"',                                 // 19
  'GOTO main'                                         // 20
].join('\n');

const symbols = parseSymbols(source);
const names = symbols.map(s => `${s.kind}:${s.name}`);
assert.deepStrictEqual(names, ['const:BORDER', 'type:Point', 'sub:draw', 'sub:draw', 'function:add', 'label:main'], names.join(', '));

const [border, point, declared, draw, add, main] = symbols;
assert.strictEqual(border.detail, '= $D020');
assert.strictEqual(border.startChar, 6);
assert.deepStrictEqual(point.children.map(c => `${c.name} ${c.detail}`), ['x AS INT', 'y AS INT']);
assert.strictEqual(point.endLine, 6);
assert.strictEqual(declared.declaration, true);
assert.strictEqual(declared.line, 7);
assert.strictEqual(draw.declaration, undefined);
assert.strictEqual(draw.line, 9);
assert.strictEqual(draw.endLine, 14);
assert.strictEqual(draw.startChar, 4);
assert.strictEqual(draw.detail, '(p AS Point)');
assert.strictEqual(add.detail, '(a AS INT, b AS INT) AS INT');
assert.strictEqual(add.endLine, 17);
assert.strictEqual(main.line, 18);

// Body preferred over DECLARE, case-insensitive
assert.deepStrictEqual(findDefinitions(symbols, 'DRAW').map(s => s.line), [9]);
assert.deepStrictEqual(findDefinitions(symbols, 'point').map(s => s.line), [3]);
assert.deepStrictEqual(findDefinitions(symbols, 'nothing'), []);

assert.deepStrictEqual(findIncludes(source), [{ path: 'lib/util.bas', line: 1 }]);

assert.strictEqual(stripComment('PRINT "it\'s" \' comment'), 'PRINT "it\'s" ');
assert.strictEqual(stripComment('x = 1: REM note'), 'x = 1: ');
assert.strictEqual(stripComment('REMARK = 1'), 'REMARK = 1');

const text = 'CALL say_hello(i)';
assert.deepStrictEqual(wordAt(text, 7), { word: 'say_hello', start: 5, end: 14 });
assert.deepStrictEqual(wordAt(text, 4), { word: 'CALL', start: 0, end: 4 }); // end of a word still counts
assert.strictEqual(wordAt('a + 1', 2), undefined);
assert.strictEqual(wordAt('x 123', 3), undefined); // numbers are not identifiers

// Windows line endings and tabs
const crlf = parseSymbols('SUB a()\r\nEND SUB\r\n\tTYPE T\r\n\t\tv AS BYTE\r\n\tEND TYPE');
assert.deepStrictEqual(crlf.map(s => [s.name, s.endLine]), [['a', 1], ['T', 4]]);

console.log('symbols: all tests passed');
