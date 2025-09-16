REM Test file for all built-in functions
REM All these should now be colored as keyword.control.xcbasic3 (same as PRINT, IF, etc.)

DIM result AS FLOAT
DIM str1$ AS STRING
DIM str2$ AS STRING
DIM x AS INT, y AS INT, z AS INT

REM Mathematical functions
result = ABS(-5.5)
result = ATN(1.0)
result = COS(3.14159)
result = EXP(2.0)
result = FLOOR(3.7)
result = LOG(10.0)
result = POW(2, 8)
result = SGN(-10)
result = SIN(1.57)
result = SQR(16.0)
result = TAN(0.785)

REM Conversion functions
x = ASC("A")
x = CBYTE(256)
result = CFLOAT(10)
x = CINT(3.7)
x = CLONG(65536)
x = CWORD(300)

REM String functions (with and without $ suffix)
str1$ = CHR$(65)
str1$ = CHR(65)
str1$ = LCASE$("HELLO")
str1$ = LCASE("HELLO")
str1$ = LEFT$("HELLO", 3)
str1$ = LEFT("HELLO", 3)
x = LEN("HELLO")
str1$ = MID$("HELLO", 2, 2)
str1$ = MID("HELLO", 2, 2)
str1$ = RIGHT$("HELLO", 3)
str1$ = RIGHT("HELLO", 3)
str1$ = STR$(123)
str1$ = STR(123)
str1$ = UCASE$("hello")
str1$ = UCASE("hello")
result = VAL("123.45")

REM Memory and system functions
x = CSRLIN()
x = DEEK($C000)
x = ERR()
x = PEEK($D020)
x = POS()
x = ST()
x = TI()

REM Random number functions
result = RND()
x = RNDB()
x = RNDI()
x = RNDL()
x = RNDW()

REM Bit manipulation functions
x = SHL(5, 2)
x = SHR(20, 2)

REM Input functions
x = JOY(1)
x = KEY()
x = SCAN()

REM Sprite collision functions
x = SPRITEBGHIT(0)
x = SPRITEHIT(0, 1)

REM Test functions in expressions and conditions
IF ABS(x) > 10 THEN
    PRINT "Absolute value is greater than 10"
END IF

FOR i = 1 TO RND() * 10
    str1$ = CHR(ASC("A") + i)
    PRINT LEFT$(str1$, LEN(str1$))
NEXT i

REM Test nested function calls
result = SQR(ABS(SIN(ATN(1.0))))
str2$ = UCASE(LEFT(STR(FLOOR(result)), 3))