export interface FunctionSignature {
  name: string;
  description: string;
  parameters: Parameter[];
  returnType: string;
  example?: string;
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
}

export interface KeywordInfo {
  name: string;
  description: string;
  syntax?: string;
  example?: string;
}

// XC-BASIC3 Reserved Keywords
export const KEYWORDS: KeywordInfo[] = [
  { name: 'AND', description: 'Logical AND operator' },
  { name: 'AS', description: 'Type declaration keyword', syntax: 'variable AS type' },
  { name: 'ASM', description: 'Begin inline assembly block', syntax: 'ASM ... END ASM' },
  { name: 'BACKGROUND', description: 'Set background color', syntax: 'BACKGROUND color' },
  { name: 'BORDER', description: 'Set border color', syntax: 'BORDER color' },
  { name: 'BYTE', description: 'Byte data type (0-255)' },
  { name: 'CALL', description: 'Call a subroutine', syntax: 'CALL subroutine_name' },
  { name: 'CASE', description: 'Case statement in SELECT CASE', syntax: 'CASE value' },
  { name: 'CHARAT', description: 'Get/set character at screen position', syntax: 'CHARAT x, y, char' },
  { name: 'CHARSET', description: 'Switch character set', syntax: 'CHARSET RAM|ROM' },
  { name: 'CLOSE', description: 'Close a file', syntax: 'CLOSE #channel' },
  { name: 'CONST', description: 'Declare a constant', syntax: 'CONST name = value' },
  { name: 'CONTINUE', description: 'Continue to next iteration of loop' },
  { name: 'DATA', description: 'Define data for READ statements', syntax: 'DATA value1, value2, ...' },
  { name: 'DECIMAL', description: 'Decimal data type' },
  { name: 'DECLARE', description: 'Forward declare a function/subroutine', syntax: 'DECLARE SUB|FUNCTION name' },
  { name: 'DIM', description: 'Declare an array', syntax: 'DIM array(size) AS type' },
  { name: 'DO', description: 'Begin DO loop', syntax: 'DO ... LOOP' },
  { name: 'DOKE', description: 'Store word to memory', syntax: 'DOKE address, value' },
  { name: 'ELSE', description: 'Else clause in IF statement' },
  { name: 'END', description: 'End program or block', syntax: 'END [SUB|FUNCTION|SELECT|TYPE]' },
  { name: 'ERROR', description: 'Generate runtime error', syntax: 'ERROR code' },
  { name: 'EXIT', description: 'Exit from loop or subroutine', syntax: 'EXIT DO|FOR|SUB|FUNCTION' },
  { name: 'FAST', description: 'Enable fast mode (disable interrupts)' },
  { name: 'FILTER', description: 'Configure SID filter', syntax: 'FILTER CUTOFF|RESONANCE|LOW PASS|BAND PASS|HIGH PASS' },
  { name: 'FLOAT', description: 'Floating point data type' },
  { name: 'FOR', description: 'Begin FOR loop', syntax: 'FOR variable = start TO end [STEP increment]' },
  { name: 'FUNCTION', description: 'Define a function', syntax: 'FUNCTION name(params) AS type' },
  { name: 'GET', description: 'Get character from keyboard', syntax: 'GET variable' },
  { name: 'GOSUB', description: 'Call subroutine (legacy)', syntax: 'GOSUB label' },
  { name: 'GOTO', description: 'Jump to label (legacy)', syntax: 'GOTO label' },
  { name: 'HSCROLL', description: 'Horizontal scroll screen', syntax: 'HSCROLL direction' },
  { name: 'IF', description: 'Conditional statement', syntax: 'IF condition THEN ... [ELSE ...] END IF' },
  { name: 'INCBIN', description: 'Include binary file', syntax: 'INCBIN "filename"' },
  { name: 'INCLUDE', description: 'Include source file', syntax: 'INCLUDE "filename"' },
  { name: 'INLINE', description: 'Inline assembly (deprecated)' },
  { name: 'INPUT', description: 'Input from user or file', syntax: 'INPUT [#channel,] variable' },
  { name: 'INT', description: 'Integer data type (-32768 to 32767)' },
  { name: 'INTERRUPT', description: 'Interrupt control', syntax: 'TIMER|RASTER|SPRITE|BACKGROUND|SYSTEM INTERRUPT ON|OFF' },
  { name: 'LET', description: 'Assign value to variable (optional)', syntax: 'LET variable = value' },
  { name: 'LOAD', description: 'Load file from disk', syntax: 'LOAD "filename", device' },
  { name: 'LOCATE', description: 'Set cursor position', syntax: 'LOCATE row, column' },
  { name: 'LONG', description: 'Long integer data type' },
  { name: 'LOOP', description: 'End DO loop', syntax: 'LOOP [WHILE|UNTIL condition]' },
  { name: 'MEMCPY', description: 'Copy memory block', syntax: 'MEMCPY dest, source, length' },
  { name: 'MEMSET', description: 'Fill memory block', syntax: 'MEMSET address, value, length' },
  { name: 'MEMSHIFT', description: 'Shift memory block', syntax: 'MEMSHIFT address, length, direction' },
  { name: 'MOD', description: 'Modulo operator' },
  { name: 'NEXT', description: 'End FOR loop', syntax: 'NEXT [variable]' },
  { name: 'NOT', description: 'Logical NOT operator' },
  { name: 'OFF', description: 'Turn off (used with various commands)' },
  { name: 'ON', description: 'Turn on or event handler', syntax: 'ON event|condition' },
  { name: 'OPEN', description: 'Open file', syntax: 'OPEN #channel, "filename", mode' },
  { name: 'OPTION', description: 'Compiler option', syntax: 'OPTION FASTINTERRUPT|INLINEDATA|NOBASICLOADER|STARTADDRESS|TARGET' },
  { name: 'OR', description: 'Logical OR operator' },
  { name: 'ORIGIN', description: 'Set code origin address', syntax: 'ORIGIN address' },
  { name: 'OVERLOAD', description: 'Allow function overloading' },
  { name: 'POKE', description: 'Store byte to memory', syntax: 'POKE address, value' },
  { name: 'PRINT', description: 'Print to screen or file', syntax: 'PRINT [#channel,] expression [, ...]' },
  { name: 'PRIVATE', description: 'Private scope modifier' },
  { name: 'RANDOMIZE', description: 'Initialize random number generator', syntax: 'RANDOMIZE [seed]' },
  { name: 'READ', description: 'Read data from DATA statements', syntax: 'READ variable' },
  { name: 'REM', description: 'Comment/remark statement', syntax: 'REM comment text' },
  { name: 'RETURN', description: 'Return from subroutine or function', syntax: 'RETURN [value]' },
  { name: 'SAVE', description: 'Save file to disk', syntax: 'SAVE "filename", device' },
  { name: 'SCREEN', description: 'Configure screen settings', syntax: 'SCREEN ROWS|COLS|TEXTAT|HSCROLL|VSCROLL' },
  { name: 'SELECT', description: 'Begin SELECT CASE block', syntax: 'SELECT CASE expression' },
  { name: 'SHARED', description: 'Shared scope modifier' },
  { name: 'SOUND', description: 'Generate sound', syntax: 'SOUND CLEAR|AT|VOLUME|FREQ|TONE|WAVE' },
  { name: 'SPRITE', description: 'Configure sprites', syntax: 'SPRITE number [ON|OFF|AT|SHAPE|COLOR|etc.]' },
  { name: 'STATIC', description: 'Static scope modifier' },
  { name: 'STEP', description: 'Step increment in FOR loop', syntax: 'FOR i = 1 TO 10 STEP 2' },
  { name: 'STRING', description: 'String data type' },
  { name: 'SUB', description: 'Define a subroutine', syntax: 'SUB name(params)' },
  { name: 'SWAP', description: 'Swap two variables', syntax: 'SWAP var1, var2' },
  { name: 'SYS', description: 'Call machine language routine', syntax: 'SYS address' },
  { name: 'SYSTEM', description: 'System interrupt control' },
  { name: 'TEXTAT', description: 'Set text at screen position', syntax: 'TEXTAT x, y, "text"' },
  { name: 'THEN', description: 'Then clause in IF statement' },
  { name: 'THIS', description: 'Reference to current type instance' },
  { name: 'TIMER', description: 'Timer interrupt control' },
  { name: 'TO', description: 'Range operator in FOR loops', syntax: 'FOR i = 1 TO 10' },
  { name: 'TYPE', description: 'Define user-defined type', syntax: 'TYPE typename' },
  { name: 'UNTIL', description: 'Until condition in DO loop', syntax: 'DO ... LOOP UNTIL condition' },
  { name: 'VMODE', description: 'Set video mode', syntax: 'VMODE TEXT|BITMAP|EXT|HIRES|MULTI [ROWS n] [COLS n]' },
  { name: 'VOICE', description: 'Configure SID voices', syntax: 'VOICE number [ON|OFF|VOLUME|TONE|ADSR|etc.]' },
  { name: 'VOLUME', description: 'Set master volume', syntax: 'VOLUME level' },
  { name: 'VSCROLL', description: 'Vertical scroll screen', syntax: 'VSCROLL direction' },
  { name: 'WAIT', description: 'Wait for memory location condition', syntax: 'WAIT address, mask [, value]' },
  { name: 'WHILE', description: 'While condition in DO loop', syntax: 'DO WHILE condition ... LOOP' },
  { name: 'WORD', description: 'Word data type (0-65535)' },
  { name: 'WRITE', description: 'Write to file', syntax: 'WRITE #channel, data' },
  { name: 'XOR', description: 'Logical XOR operator' }
];

// XC-BASIC3 Built-in Functions
export const FUNCTIONS: FunctionSignature[] = [
  {
    name: 'ABS',
    description: 'Returns the absolute value of a number',
    parameters: [{ name: 'n', type: 'number', description: 'The number to get absolute value of' }],
    returnType: 'number',
    example: 'result = ABS(-5)  \' Returns 5'
  },
  {
    name: 'ASC',
    description: 'Returns the ASCII code of the first character in a string',
    parameters: [{ name: 's', type: 'string', description: 'The string to get ASCII code from' }],
    returnType: 'byte',
    example: 'code = ASC("A")  \' Returns 65'
  },
  {
    name: 'ATN',
    description: 'Returns the arctangent of a number',
    parameters: [{ name: 'n', type: 'float', description: 'The number to get arctangent of' }],
    returnType: 'float',
    example: 'angle = ATN(1)  \' Returns π/4'
  },
  {
    name: 'CBYTE',
    description: 'Converts a value to byte type',
    parameters: [{ name: 'n', type: 'number', description: 'The value to convert' }],
    returnType: 'byte',
    example: 'b = CBYTE(300)  \' Returns 44 (300 MOD 256)'
  },
  {
    name: 'CFLOAT',
    description: 'Converts a value to float type',
    parameters: [{ name: 'n', type: 'number', description: 'The value to convert' }],
    returnType: 'float',
    example: 'f = CFLOAT(42)'
  },
  {
    name: 'CHR$',
    description: 'Returns the character corresponding to an ASCII code',
    parameters: [{ name: 'n', type: 'byte', description: 'The ASCII code' }],
    returnType: 'string',
    example: 'char = CHR$(65)  \' Returns "A"'
  },
  {
    name: 'CINT',
    description: 'Converts a value to integer type',
    parameters: [{ name: 'n', type: 'number', description: 'The value to convert' }],
    returnType: 'int',
    example: 'i = CINT(3.7)  \' Returns 4 (rounded)'
  },
  {
    name: 'CLONG',
    description: 'Converts a value to long type',
    parameters: [{ name: 'n', type: 'number', description: 'The value to convert' }],
    returnType: 'long',
    example: 'l = CLONG(65536)'
  },
  {
    name: 'COS',
    description: 'Returns the cosine of an angle in radians',
    parameters: [{ name: 'angle', type: 'float', description: 'The angle in radians' }],
    returnType: 'float',
    example: 'result = COS(0)  \' Returns 1'
  },
  {
    name: 'CSRLIN',
    description: 'Returns the current cursor row position',
    parameters: [],
    returnType: 'byte',
    example: 'row = CSRLIN()'
  },
  {
    name: 'CWORD',
    description: 'Converts a value to word type',
    parameters: [{ name: 'n', type: 'number', description: 'The value to convert' }],
    returnType: 'word',
    example: 'w = CWORD(-1)  \' Returns 65535'
  },
  {
    name: 'DEEK',
    description: 'Reads a word (2 bytes) from memory',
    parameters: [{ name: 'address', type: 'word', description: 'The memory address to read from' }],
    returnType: 'word',
    example: 'value = DEEK($D020)  \' Read word from $D020'
  },
  {
    name: 'ERR',
    description: 'Returns the last error code',
    parameters: [],
    returnType: 'byte',
    example: 'errorCode = ERR()'
  },
  {
    name: 'EXP',
    description: 'Returns e raised to the power of x',
    parameters: [{ name: 'x', type: 'float', description: 'The exponent' }],
    returnType: 'float',
    example: 'result = EXP(1)  \' Returns e (≈2.718)'
  },
  {
    name: 'INT',
    description: 'Returns the integer part of a number (floor)',
    parameters: [{ name: 'n', type: 'float', description: 'The number to truncate' }],
    returnType: 'int',
    example: 'result = INT(3.7)  \' Returns 3'
  },
  {
    name: 'JOY',
    description: 'Reads joystick input',
    parameters: [{ name: 'port', type: 'byte', description: 'Joystick port (1 or 2)' }],
    returnType: 'byte',
    example: 'input = JOY(1)  \' Read joystick 1'
  },
  {
    name: 'KEY',
    description: 'Returns the last key pressed',
    parameters: [],
    returnType: 'byte',
    example: 'keyCode = KEY()'
  },
  {
    name: 'LCASE$',
    description: 'Converts a string to lowercase',
    parameters: [{ name: 's', type: 'string', description: 'The string to convert' }],
    returnType: 'string',
    example: 'lower = LCASE$("HELLO")  \' Returns "hello"'
  },
  {
    name: 'LEFT$',
    description: 'Returns the leftmost characters of a string',
    parameters: [
      { name: 's', type: 'string', description: 'The source string' },
      { name: 'n', type: 'byte', description: 'Number of characters to return' }
    ],
    returnType: 'string',
    example: 'result = LEFT$("HELLO", 3)  \' Returns "HEL"'
  },
  {
    name: 'LEN',
    description: 'Returns the length of a string',
    parameters: [{ name: 's', type: 'string', description: 'The string to measure' }],
    returnType: 'byte',
    example: 'length = LEN("HELLO")  \' Returns 5'
  },
  {
    name: 'LOG',
    description: 'Returns the natural logarithm of a number',
    parameters: [{ name: 'n', type: 'float', description: 'The number (must be > 0)' }],
    returnType: 'float',
    example: 'result = LOG(2.718)  \' Returns ≈1'
  },
  {
    name: 'MID$',
    description: 'Returns a substring from the middle of a string',
    parameters: [
      { name: 's', type: 'string', description: 'The source string' },
      { name: 'start', type: 'byte', description: 'Starting position (1-based)' },
      { name: 'length', type: 'byte', description: 'Number of characters', optional: true }
    ],
    returnType: 'string',
    example: 'result = MID$("HELLO", 2, 3)  \' Returns "ELL"'
  },
  {
    name: 'PEEK',
    description: 'Reads a byte from memory',
    parameters: [{ name: 'address', type: 'word', description: 'The memory address to read from' }],
    returnType: 'byte',
    example: 'value = PEEK($D020)  \' Read border color'
  },
  {
    name: 'POS',
    description: 'Returns the current cursor column position',
    parameters: [],
    returnType: 'byte',
    example: 'column = POS()'
  },
  {
    name: 'POW',
    description: 'Returns x raised to the power of y',
    parameters: [
      { name: 'x', type: 'float', description: 'The base' },
      { name: 'y', type: 'float', description: 'The exponent' }
    ],
    returnType: 'float',
    example: 'result = POW(2, 3)  \' Returns 8'
  },
  {
    name: 'RIGHT$',
    description: 'Returns the rightmost characters of a string',
    parameters: [
      { name: 's', type: 'string', description: 'The source string' },
      { name: 'n', type: 'byte', description: 'Number of characters to return' }
    ],
    returnType: 'string',
    example: 'result = RIGHT$("HELLO", 3)  \' Returns "LLO"'
  },
  {
    name: 'RND',
    description: 'Returns a random float between 0 and 1',
    parameters: [],
    returnType: 'float',
    example: 'random = RND()'
  },
  {
    name: 'RNDB',
    description: 'Returns a random byte (0-255)',
    parameters: [],
    returnType: 'byte',
    example: 'randomByte = RNDB()'
  },
  {
    name: 'RNDI',
    description: 'Returns a random integer',
    parameters: [],
    returnType: 'int',
    example: 'randomInt = RNDI()'
  },
  {
    name: 'RNDL',
    description: 'Returns a random long integer',
    parameters: [],
    returnType: 'long',
    example: 'randomLong = RNDL()'
  },
  {
    name: 'RNDW',
    description: 'Returns a random word (0-65535)',
    parameters: [],
    returnType: 'word',
    example: 'randomWord = RNDW()'
  },
  {
    name: 'SCAN',
    description: 'Scans keyboard for key press',
    parameters: [],
    returnType: 'byte',
    example: 'scanCode = SCAN()'
  },
  {
    name: 'SGN',
    description: 'Returns the sign of a number (-1, 0, or 1)',
    parameters: [{ name: 'n', type: 'number', description: 'The number to check' }],
    returnType: 'int',
    example: 'sign = SGN(-5)  \' Returns -1'
  },
  {
    name: 'SHL',
    description: 'Shifts bits left',
    parameters: [
      { name: 'n', type: 'number', description: 'The number to shift' },
      { name: 'bits', type: 'byte', description: 'Number of bits to shift' }
    ],
    returnType: 'number',
    example: 'result = SHL(5, 1)  \' Returns 10'
  },
  {
    name: 'SHR',
    description: 'Shifts bits right',
    parameters: [
      { name: 'n', type: 'number', description: 'The number to shift' },
      { name: 'bits', type: 'byte', description: 'Number of bits to shift' }
    ],
    returnType: 'number',
    example: 'result = SHR(10, 1)  \' Returns 5'
  },
  {
    name: 'SIN',
    description: 'Returns the sine of an angle in radians',
    parameters: [{ name: 'angle', type: 'float', description: 'The angle in radians' }],
    returnType: 'float',
    example: 'result = SIN(1.57)  \' Returns ≈1 (π/2)'
  },
  {
    name: 'SPRITEBGHIT',
    description: 'Checks sprite-background collision',
    parameters: [{ name: 'sprite', type: 'byte', description: 'Sprite number (0-7)' }],
    returnType: 'byte',
    example: 'collision = SPRITEBGHIT(0)'
  },
  {
    name: 'SPRITEHIT',
    description: 'Checks sprite-sprite collision',
    parameters: [{ name: 'sprite', type: 'byte', description: 'Sprite number (0-7)' }],
    returnType: 'byte',
    example: 'collision = SPRITEHIT(0)'
  },
  {
    name: 'SQR',
    description: 'Returns the square root of a number',
    parameters: [{ name: 'n', type: 'float', description: 'The number (must be >= 0)' }],
    returnType: 'float',
    example: 'result = SQR(16)  \' Returns 4'
  },
  {
    name: 'ST',
    description: 'Returns the I/O status',
    parameters: [],
    returnType: 'byte',
    example: 'status = ST()'
  },
  {
    name: 'STR$',
    description: 'Converts a number to string',
    parameters: [{ name: 'n', type: 'number', description: 'The number to convert' }],
    returnType: 'string',
    example: 'text = STR$(42)  \' Returns "42"'
  },
  {
    name: 'TAN',
    description: 'Returns the tangent of an angle in radians',
    parameters: [{ name: 'angle', type: 'float', description: 'The angle in radians' }],
    returnType: 'float',
    example: 'result = TAN(0.785)  \' Returns ≈1 (π/4)'
  },
  {
    name: 'TI',
    description: 'Returns the system timer (jiffies since power on)',
    parameters: [],
    returnType: 'long',
    example: 'time = TI()'
  },
  {
    name: 'UCASE$',
    description: 'Converts a string to uppercase',
    parameters: [{ name: 's', type: 'string', description: 'The string to convert' }],
    returnType: 'string',
    example: 'upper = UCASE$("hello")  \' Returns "HELLO"'
  },
  {
    name: 'VAL',
    description: 'Converts a string to a number',
    parameters: [{ name: 's', type: 'string', description: 'The string to convert' }],
    returnType: 'float',
    example: 'number = VAL("123.45")  \' Returns 123.45'
  }
];

// Data types
export const DATA_TYPES = ['BYTE', 'WORD', 'INT', 'LONG', 'FLOAT', 'DECIMAL', 'STRING'];

// Operators
export const OPERATORS = ['+', '-', '*', '/', '=', '<>', '<', '>', '<=', '>=', 'AND', 'OR', 'XOR', 'NOT', 'MOD', '@'];
