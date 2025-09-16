REM Test file for VMODE with built-in functions in ROWS and COLS values
REM Built-in functions should be colored as keyword.control.xcbasic3 (keywords)

DIM rows AS INT, cols AS INT

REM Valid VMODE with literal values (should work as before)
VMODE TEXT ROWS 24 COLS 40
VMODE BITMAP ROWS 25 COLS 38

REM VMODE with built-in functions - these should now work!
REM Simple function calls should be colored as keywords
VMODE TEXT ROWS RND COLS PEEK
VMODE BITMAP ROWS ABS COLS SHL  
VMODE HIRES ROWS INT COLS POW

REM Functions with parentheses  
VMODE TEXT ROWS RND() COLS PEEK($D020)
VMODE BITMAP ROWS ABS(-25) COLS SHL(19, 1)

REM VMODE with variables and expressions
rows = 25
cols = 40
VMODE TEXT ROWS rows COLS cols
VMODE BITMAP ROWS rows + RND() COLS cols - SGN(-1)

REM VMODE with hex values and functions
VMODE TEXT ROWS $19 COLS CHR(ASC("(")) 
VMODE BITMAP ROWS DEEK($C000) COLS CSRLIN()

REM VMODE with string and complex expressions  
VMODE TEXT ROWS LEN("HELLO") * 5 COLS VAL("40")
VMODE HIRES ROWS FLOOR(25.7) COLS CINT(39.5)

REM Compare with regular built-in function usage (should have same coloring)
rows = RND() * 2 + 24
cols = PEEK($D020) + 38
x = ABS(-25)
y = SHL(19, 1)

PRINT "VMODE functions test completed"