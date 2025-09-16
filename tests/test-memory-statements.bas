REM Test file for memory statement syntax highlighting

DIM source AS WORD
DIM dest AS WORD
DIM count AS WORD

source = $C000
dest = $D000
count = 1000

REM These should be colored as keyword.control.xcbasic3 (statements, like PRINT, POKE)
MEMCPY source, dest, count
MEMSHIFT dest, count, 1

REM Compare with other statements (should match coloring)
PRINT "Memory operations completed"
POKE $D020, 1
DOKE $D021, 256

REM MEMSET should now be colored as keyword.control.xcbasic3 (statement, like MEMCPY/MEMSHIFT)
MEMSET dest, 0, count

REM Compare with other statement keywords (should match MEMSET coloring)
PRINT "Memory operations completed"
POKE $D020, 1
DOKE $D021, 256

REM Compare with other functions (these should still be colored as keywords since all builtins are keywords now)
DIM result AS BYTE
result = PEEK($D020)
result = ABS(-5)
result = RND() * 100