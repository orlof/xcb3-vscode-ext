REM Test file for OPTION statement syntax highlighting

REM OPTION should be colored as keyword.control.xcbasic3 (like other keywords)
REM Option names should be colored as storage.modifier.xcbasic3 (like SPRITE subcommands)

OPTION FASTINTERRUPT
OPTION INLINEDATA  
OPTION NOBASICLOADER
OPTION STARTADDRESS $0801
OPTION TARGET C64

REM Compare with other keywords (should match OPTION coloring)
IF x > 0 THEN
    FOR i = 1 TO 10
        PRINT i
    NEXT i
END IF

REM Compare with SPRITE subcommands (should match option name coloring)
SPRITE 0 ON AT 100, 100 COLOR 1
VMODE TEXT ROWS 25 COLS 40

REM Compare with declaration modifiers (should match option name coloring)
PRIVATE SUB test()
    PRINT "test"
END SUB

SHARED DIM globalvar AS INT