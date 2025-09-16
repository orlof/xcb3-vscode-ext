REM Test file for declaration modifier syntax highlighting

REM These should be colored as storage.modifier.xcbasic3 (same as SPRITE subcommands)
PRIVATE SUB privatesub()
    PRINT "Private subroutine"
END SUB

SHARED DIM globalvar AS INT

STATIC SUB staticsub()
    PRINT "Static subroutine"
END SUB

OVERLOAD SUB overloadedsub(x AS INT)
    PRINT "Overloaded version 1"
END SUB

OVERLOAD SUB overloadedsub(x AS STRING)
    PRINT "Overloaded version 2"  
END SUB

REM Compare with regular keywords (should be keyword.control.xcbasic3)
IF globalvar > 0 THEN
    FOR i = 1 TO 10
        PRINT i
    NEXT i
END IF

REM Compare with SPRITE subcommands (should match modifier coloring)
SPRITE 0 ON AT 100, 100 COLOR 1
VMODE TEXT ROWS 25 COLS 40