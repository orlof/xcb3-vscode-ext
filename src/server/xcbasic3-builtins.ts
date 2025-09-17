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

// 6502 Assembly Instructions Interface
export interface AssemblyInstruction {
  name: string;
  description: string;
  operation: string;
  flags: {
    N?: boolean | string;
    Z?: boolean | string;
    C?: boolean | string;
    I?: boolean | string;
    D?: boolean | string;
    V?: boolean | string;
  };
  addressingModes: {
    mode: string;
    assembler: string;
    opcode: string;
    bytes: number;
    cycles: number;
  }[];
}

// 6502 Assembly Instructions (from 6502_INSTRUCTIONS.md)
export const ASSEMBLY_INSTRUCTIONS: AssemblyInstruction[] = [
  {
    name: 'ADC',
    description: 'Add Memory to Accumulator with Carry',
    operation: 'A + M + C -> A, C',
    flags: { N: true, Z: true, C: true, V: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'ADC #oper', opcode: '69', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'ADC oper', opcode: '65', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'ADC oper,X', opcode: '75', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'ADC oper', opcode: '6D', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'ADC oper,X', opcode: '7D', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'ADC oper,Y', opcode: '79', bytes: 3, cycles: 4 },
      { mode: '(indirect,X)', assembler: 'ADC (oper,X)', opcode: '61', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'ADC (oper),Y', opcode: '71', bytes: 2, cycles: 5 }
    ]
  },
  {
    name: 'AND',
    description: 'AND Memory with Accumulator',
    operation: 'A AND M -> A',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'AND #oper', opcode: '29', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'AND oper', opcode: '25', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'AND oper,X', opcode: '35', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'AND oper', opcode: '2D', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'AND oper,X', opcode: '3D', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'AND oper,Y', opcode: '39', bytes: 3, cycles: 4 },
      { mode: '(indirect,X)', assembler: 'AND (oper,X)', opcode: '21', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'AND (oper),Y', opcode: '31', bytes: 2, cycles: 5 }
    ]
  },
  {
    name: 'ASL',
    description: 'Shift Left One Bit (Memory or Accumulator)',
    operation: 'C <- [76543210] <- 0',
    flags: { N: true, Z: true, C: true },
    addressingModes: [
      { mode: 'accumulator', assembler: 'ASL A', opcode: '0A', bytes: 1, cycles: 2 },
      { mode: 'zeropage', assembler: 'ASL oper', opcode: '06', bytes: 2, cycles: 5 },
      { mode: 'zeropage,X', assembler: 'ASL oper,X', opcode: '16', bytes: 2, cycles: 6 },
      { mode: 'absolute', assembler: 'ASL oper', opcode: '0E', bytes: 3, cycles: 6 },
      { mode: 'absolute,X', assembler: 'ASL oper,X', opcode: '1E', bytes: 3, cycles: 7 }
    ]
  },
  {
    name: 'BCC',
    description: 'Branch on Carry Clear',
    operation: 'branch on C = 0',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BCC oper', opcode: '90', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'BCS',
    description: 'Branch on Carry Set',
    operation: 'branch on C = 1',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BCS oper', opcode: 'B0', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'BEQ',
    description: 'Branch on Result Zero',
    operation: 'branch on Z = 1',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BEQ oper', opcode: 'F0', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'BIT',
    description: 'Test Bits in Memory with Accumulator',
    operation: 'A AND M -> Z, M7 -> N, M6 -> V',
    flags: { N: 'M7', Z: true, V: 'M6' },
    addressingModes: [
      { mode: 'zeropage', assembler: 'BIT oper', opcode: '24', bytes: 2, cycles: 3 },
      { mode: 'absolute', assembler: 'BIT oper', opcode: '2C', bytes: 3, cycles: 4 }
    ]
  },
  {
    name: 'BMI',
    description: 'Branch on Result Minus',
    operation: 'branch on N = 1',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BMI oper', opcode: '30', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'BNE',
    description: 'Branch on Result not Zero',
    operation: 'branch on Z = 0',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BNE oper', opcode: 'D0', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'BPL',
    description: 'Branch on Result Plus',
    operation: 'branch on N = 0',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BPL oper', opcode: '10', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'BRK',
    description: 'Force Break',
    operation: 'interrupt, push PC+2, push SR',
    flags: { I: true },
    addressingModes: [
      { mode: 'implied', assembler: 'BRK', opcode: '00', bytes: 1, cycles: 7 }
    ]
  },
  {
    name: 'BVC',
    description: 'Branch on Overflow Clear',
    operation: 'branch on V = 0',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BVC oper', opcode: '50', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'BVS',
    description: 'Branch on Overflow Set',
    operation: 'branch on V = 1',
    flags: {},
    addressingModes: [
      { mode: 'relative', assembler: 'BVS oper', opcode: '70', bytes: 2, cycles: 2 }
    ]
  },
  {
    name: 'CLC',
    description: 'Clear Carry Flag',
    operation: '0 -> C',
    flags: { C: false },
    addressingModes: [
      { mode: 'implied', assembler: 'CLC', opcode: '18', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'CLD',
    description: 'Clear Decimal Mode',
    operation: '0 -> D',
    flags: { D: false },
    addressingModes: [
      { mode: 'implied', assembler: 'CLD', opcode: 'D8', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'CLI',
    description: 'Clear Interrupt Disable Bit',
    operation: '0 -> I',
    flags: { I: false },
    addressingModes: [
      { mode: 'implied', assembler: 'CLI', opcode: '58', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'CLV',
    description: 'Clear Overflow Flag',
    operation: '0 -> V',
    flags: { V: false },
    addressingModes: [
      { mode: 'implied', assembler: 'CLV', opcode: 'B8', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'CMP',
    description: 'Compare Memory with Accumulator',
    operation: 'A - M',
    flags: { N: true, Z: true, C: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'CMP #oper', opcode: 'C9', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'CMP oper', opcode: 'C5', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'CMP oper,X', opcode: 'D5', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'CMP oper', opcode: 'CD', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'CMP oper,X', opcode: 'DD', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'CMP oper,Y', opcode: 'D9', bytes: 3, cycles: 4 },
      { mode: '(indirect,X)', assembler: 'CMP (oper,X)', opcode: 'C1', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'CMP (oper),Y', opcode: 'D1', bytes: 2, cycles: 5 }
    ]
  },
  {
    name: 'CPX',
    description: 'Compare Memory and Index X',
    operation: 'X - M',
    flags: { N: true, Z: true, C: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'CPX #oper', opcode: 'E0', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'CPX oper', opcode: 'E4', bytes: 2, cycles: 3 },
      { mode: 'absolute', assembler: 'CPX oper', opcode: 'EC', bytes: 3, cycles: 4 }
    ]
  },
  {
    name: 'CPY',
    description: 'Compare Memory and Index Y',
    operation: 'Y - M',
    flags: { N: true, Z: true, C: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'CPY #oper', opcode: 'C0', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'CPY oper', opcode: 'C4', bytes: 2, cycles: 3 },
      { mode: 'absolute', assembler: 'CPY oper', opcode: 'CC', bytes: 3, cycles: 4 }
    ]
  },
  {
    name: 'DEC',
    description: 'Decrement Memory by One',
    operation: 'M - 1 -> M',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'zeropage', assembler: 'DEC oper', opcode: 'C6', bytes: 2, cycles: 5 },
      { mode: 'zeropage,X', assembler: 'DEC oper,X', opcode: 'D6', bytes: 2, cycles: 6 },
      { mode: 'absolute', assembler: 'DEC oper', opcode: 'CE', bytes: 3, cycles: 6 },
      { mode: 'absolute,X', assembler: 'DEC oper,X', opcode: 'DE', bytes: 3, cycles: 7 }
    ]
  },
  {
    name: 'DEX',
    description: 'Decrement Index X by One',
    operation: 'X - 1 -> X',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'DEX', opcode: 'CA', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'DEY',
    description: 'Decrement Index Y by One',
    operation: 'Y - 1 -> Y',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'DEY', opcode: '88', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'EOR',
    description: 'Exclusive-OR Memory with Accumulator',
    operation: 'A EOR M -> A',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'EOR #oper', opcode: '49', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'EOR oper', opcode: '45', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'EOR oper,X', opcode: '55', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'EOR oper', opcode: '4D', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'EOR oper,X', opcode: '5D', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'EOR oper,Y', opcode: '59', bytes: 3, cycles: 4 },
      { mode: '(indirect,X)', assembler: 'EOR (oper,X)', opcode: '41', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'EOR (oper),Y', opcode: '51', bytes: 2, cycles: 5 }
    ]
  },
  {
    name: 'INC',
    description: 'Increment Memory by One',
    operation: 'M + 1 -> M',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'zeropage', assembler: 'INC oper', opcode: 'E6', bytes: 2, cycles: 5 },
      { mode: 'zeropage,X', assembler: 'INC oper,X', opcode: 'F6', bytes: 2, cycles: 6 },
      { mode: 'absolute', assembler: 'INC oper', opcode: 'EE', bytes: 3, cycles: 6 },
      { mode: 'absolute,X', assembler: 'INC oper,X', opcode: 'FE', bytes: 3, cycles: 7 }
    ]
  },
  {
    name: 'INX',
    description: 'Increment Index X by One',
    operation: 'X + 1 -> X',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'INX', opcode: 'E8', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'INY',
    description: 'Increment Index Y by One',
    operation: 'Y + 1 -> Y',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'INY', opcode: 'C8', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'JMP',
    description: 'Jump to New Location',
    operation: 'operand 1st byte -> PCL, operand 2nd byte -> PCH',
    flags: {},
    addressingModes: [
      { mode: 'absolute', assembler: 'JMP oper', opcode: '4C', bytes: 3, cycles: 3 },
      { mode: 'indirect', assembler: 'JMP (oper)', opcode: '6C', bytes: 3, cycles: 5 }
    ]
  },
  {
    name: 'JSR',
    description: 'Jump to New Location Saving Return Address',
    operation: 'push (PC+2), operand 1st byte -> PCL, operand 2nd byte -> PCH',
    flags: {},
    addressingModes: [
      { mode: 'absolute', assembler: 'JSR oper', opcode: '20', bytes: 3, cycles: 6 }
    ]
  },
  {
    name: 'LDA',
    description: 'Load Accumulator with Memory',
    operation: 'M -> A',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'LDA #oper', opcode: 'A9', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'LDA oper', opcode: 'A5', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'LDA oper,X', opcode: 'B5', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'LDA oper', opcode: 'AD', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'LDA oper,X', opcode: 'BD', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'LDA oper,Y', opcode: 'B9', bytes: 3, cycles: 4 },
      { mode: '(indirect,X)', assembler: 'LDA (oper,X)', opcode: 'A1', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'LDA (oper),Y', opcode: 'B1', bytes: 2, cycles: 5 }
    ]
  },
  {
    name: 'LDX',
    description: 'Load Index X with Memory',
    operation: 'M -> X',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'LDX #oper', opcode: 'A2', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'LDX oper', opcode: 'A6', bytes: 2, cycles: 3 },
      { mode: 'zeropage,Y', assembler: 'LDX oper,Y', opcode: 'B6', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'LDX oper', opcode: 'AE', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'LDX oper,Y', opcode: 'BE', bytes: 3, cycles: 4 }
    ]
  },
  {
    name: 'LDY',
    description: 'Load Index Y with Memory',
    operation: 'M -> Y',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'LDY #oper', opcode: 'A0', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'LDY oper', opcode: 'A4', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'LDY oper,X', opcode: 'B4', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'LDY oper', opcode: 'AC', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'LDY oper,X', opcode: 'BC', bytes: 3, cycles: 4 }
    ]
  },
  {
    name: 'LSR',
    description: 'Shift One Bit Right (Memory or Accumulator)',
    operation: '0 -> [76543210] -> C',
    flags: { N: false, Z: true, C: true },
    addressingModes: [
      { mode: 'accumulator', assembler: 'LSR A', opcode: '4A', bytes: 1, cycles: 2 },
      { mode: 'zeropage', assembler: 'LSR oper', opcode: '46', bytes: 2, cycles: 5 },
      { mode: 'zeropage,X', assembler: 'LSR oper,X', opcode: '56', bytes: 2, cycles: 6 },
      { mode: 'absolute', assembler: 'LSR oper', opcode: '4E', bytes: 3, cycles: 6 },
      { mode: 'absolute,X', assembler: 'LSR oper,X', opcode: '5E', bytes: 3, cycles: 7 }
    ]
  },
  {
    name: 'NOP',
    description: 'No Operation',
    operation: '---',
    flags: {},
    addressingModes: [
      { mode: 'implied', assembler: 'NOP', opcode: 'EA', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'ORA',
    description: 'OR Memory with Accumulator',
    operation: 'A OR M -> A',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'ORA #oper', opcode: '09', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'ORA oper', opcode: '05', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'ORA oper,X', opcode: '15', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'ORA oper', opcode: '0D', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'ORA oper,X', opcode: '1D', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'ORA oper,Y', opcode: '19', bytes: 3, cycles: 4 },
      { mode: '(indirect,X)', assembler: 'ORA (oper,X)', opcode: '01', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'ORA (oper),Y', opcode: '11', bytes: 2, cycles: 5 }
    ]
  },
  {
    name: 'PHA',
    description: 'Push Accumulator on Stack',
    operation: 'push A',
    flags: {},
    addressingModes: [
      { mode: 'implied', assembler: 'PHA', opcode: '48', bytes: 1, cycles: 3 }
    ]
  },
  {
    name: 'PHP',
    description: 'Push Processor Status on Stack',
    operation: 'push SR',
    flags: {},
    addressingModes: [
      { mode: 'implied', assembler: 'PHP', opcode: '08', bytes: 1, cycles: 3 }
    ]
  },
  {
    name: 'PLA',
    description: 'Pull Accumulator from Stack',
    operation: 'pull A',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'PLA', opcode: '68', bytes: 1, cycles: 4 }
    ]
  },
  {
    name: 'PLP',
    description: 'Pull Processor Status from Stack',
    operation: 'pull SR',
    flags: { N: 'from stack', Z: 'from stack', C: 'from stack', I: 'from stack', D: 'from stack', V: 'from stack' },
    addressingModes: [
      { mode: 'implied', assembler: 'PLP', opcode: '28', bytes: 1, cycles: 4 }
    ]
  },
  {
    name: 'ROL',
    description: 'Rotate One Bit Left (Memory or Accumulator)',
    operation: 'C <- [76543210] <- C',
    flags: { N: true, Z: true, C: true },
    addressingModes: [
      { mode: 'accumulator', assembler: 'ROL A', opcode: '2A', bytes: 1, cycles: 2 },
      { mode: 'zeropage', assembler: 'ROL oper', opcode: '26', bytes: 2, cycles: 5 },
      { mode: 'zeropage,X', assembler: 'ROL oper,X', opcode: '36', bytes: 2, cycles: 6 },
      { mode: 'absolute', assembler: 'ROL oper', opcode: '2E', bytes: 3, cycles: 6 },
      { mode: 'absolute,X', assembler: 'ROL oper,X', opcode: '3E', bytes: 3, cycles: 7 }
    ]
  },
  {
    name: 'ROR',
    description: 'Rotate One Bit Right (Memory or Accumulator)',
    operation: 'C -> [76543210] -> C',
    flags: { N: true, Z: true, C: true },
    addressingModes: [
      { mode: 'accumulator', assembler: 'ROR A', opcode: '6A', bytes: 1, cycles: 2 },
      { mode: 'zeropage', assembler: 'ROR oper', opcode: '66', bytes: 2, cycles: 5 },
      { mode: 'zeropage,X', assembler: 'ROR oper,X', opcode: '76', bytes: 2, cycles: 6 },
      { mode: 'absolute', assembler: 'ROR oper', opcode: '6E', bytes: 3, cycles: 6 },
      { mode: 'absolute,X', assembler: 'ROR oper,X', opcode: '7E', bytes: 3, cycles: 7 }
    ]
  },
  {
    name: 'RTI',
    description: 'Return from Interrupt',
    operation: 'pull SR, pull PC',
    flags: { N: 'from stack', Z: 'from stack', C: 'from stack', I: 'from stack', D: 'from stack', V: 'from stack' },
    addressingModes: [
      { mode: 'implied', assembler: 'RTI', opcode: '40', bytes: 1, cycles: 6 }
    ]
  },
  {
    name: 'RTS',
    description: 'Return from Subroutine',
    operation: 'pull PC, PC+1 -> PC',
    flags: {},
    addressingModes: [
      { mode: 'implied', assembler: 'RTS', opcode: '60', bytes: 1, cycles: 6 }
    ]
  },
  {
    name: 'SBC',
    description: 'Subtract Memory from Accumulator with Borrow',
    operation: 'A - M - C̅ -> A',
    flags: { N: true, Z: true, C: true, V: true },
    addressingModes: [
      { mode: 'immediate', assembler: 'SBC #oper', opcode: 'E9', bytes: 2, cycles: 2 },
      { mode: 'zeropage', assembler: 'SBC oper', opcode: 'E5', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'SBC oper,X', opcode: 'F5', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'SBC oper', opcode: 'ED', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'SBC oper,X', opcode: 'FD', bytes: 3, cycles: 4 },
      { mode: 'absolute,Y', assembler: 'SBC oper,Y', opcode: 'F9', bytes: 3, cycles: 4 },
      { mode: '(indirect,X)', assembler: 'SBC (oper,X)', opcode: 'E1', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'SBC (oper),Y', opcode: 'F1', bytes: 2, cycles: 5 }
    ]
  },
  {
    name: 'SEC',
    description: 'Set Carry Flag',
    operation: '1 -> C',
    flags: { C: true },
    addressingModes: [
      { mode: 'implied', assembler: 'SEC', opcode: '38', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'SED',
    description: 'Set Decimal Flag',
    operation: '1 -> D',
    flags: { D: true },
    addressingModes: [
      { mode: 'implied', assembler: 'SED', opcode: 'F8', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'SEI',
    description: 'Set Interrupt Disable Status',
    operation: '1 -> I',
    flags: { I: true },
    addressingModes: [
      { mode: 'implied', assembler: 'SEI', opcode: '78', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'STA',
    description: 'Store Accumulator in Memory',
    operation: 'A -> M',
    flags: {},
    addressingModes: [
      { mode: 'zeropage', assembler: 'STA oper', opcode: '85', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'STA oper,X', opcode: '95', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'STA oper', opcode: '8D', bytes: 3, cycles: 4 },
      { mode: 'absolute,X', assembler: 'STA oper,X', opcode: '9D', bytes: 3, cycles: 5 },
      { mode: 'absolute,Y', assembler: 'STA oper,Y', opcode: '99', bytes: 3, cycles: 5 },
      { mode: '(indirect,X)', assembler: 'STA (oper,X)', opcode: '81', bytes: 2, cycles: 6 },
      { mode: '(indirect),Y', assembler: 'STA (oper),Y', opcode: '91', bytes: 2, cycles: 6 }
    ]
  },
  {
    name: 'STX',
    description: 'Store Index X in Memory',
    operation: 'X -> M',
    flags: {},
    addressingModes: [
      { mode: 'zeropage', assembler: 'STX oper', opcode: '86', bytes: 2, cycles: 3 },
      { mode: 'zeropage,Y', assembler: 'STX oper,Y', opcode: '96', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'STX oper', opcode: '8E', bytes: 3, cycles: 4 }
    ]
  },
  {
    name: 'STY',
    description: 'Store Index Y in Memory',
    operation: 'Y -> M',
    flags: {},
    addressingModes: [
      { mode: 'zeropage', assembler: 'STY oper', opcode: '84', bytes: 2, cycles: 3 },
      { mode: 'zeropage,X', assembler: 'STY oper,X', opcode: '94', bytes: 2, cycles: 4 },
      { mode: 'absolute', assembler: 'STY oper', opcode: '8C', bytes: 3, cycles: 4 }
    ]
  },
  {
    name: 'TAX',
    description: 'Transfer Accumulator to Index X',
    operation: 'A -> X',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'TAX', opcode: 'AA', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'TAY',
    description: 'Transfer Accumulator to Index Y',
    operation: 'A -> Y',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'TAY', opcode: 'A8', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'TSX',
    description: 'Transfer Stack Pointer to Index X',
    operation: 'SP -> X',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'TSX', opcode: 'BA', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'TXA',
    description: 'Transfer Index X to Accumulator',
    operation: 'X -> A',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'TXA', opcode: '8A', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'TXS',
    description: 'Transfer Index X to Stack Register',
    operation: 'X -> SP',
    flags: {},
    addressingModes: [
      { mode: 'implied', assembler: 'TXS', opcode: '9A', bytes: 1, cycles: 2 }
    ]
  },
  {
    name: 'TYA',
    description: 'Transfer Index Y to Accumulator',
    operation: 'Y -> A',
    flags: { N: true, Z: true },
    addressingModes: [
      { mode: 'implied', assembler: 'TYA', opcode: '98', bytes: 1, cycles: 2 }
    ]
  }
];
