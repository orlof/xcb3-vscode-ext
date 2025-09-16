REM Test file for SWAP, WAIT, VOLUME, and FAST syntax highlighting

REM SWAP should be colored as keyword.control.xcbasic3 (statement, like PRINT)
DIM a AS INT, b AS INT
a = 10
b = 20
SWAP a, b

REM WAIT should be colored as keyword.control.xcbasic3 (statement, like PRINT)
WAIT 214, 255

REM VOLUME should be colored as keyword.control.xcbasic3 (statement, like PRINT)
VOLUME 15

REM FAST should be colored as storage.modifier.xcbasic3 (like PRIVATE, SHARED)
FAST SUB quicksub()
    PRINT "Fast subroutine"
END SUB

REM Compare with other statements (should match SWAP, WAIT, VOLUME coloring)
PRINT "Hello"
POKE $D020, 1
SCREEN CLEAR

REM Compare with other modifiers (should match FAST coloring)
PRIVATE SUB privatesub()
    PRINT "Private"
END SUB

SHARED DIM globalvar AS INT

REM VOLUME also works as sub-command in VOICE and SOUND contexts (should be storage.modifier)
VOICE 0 VOLUME 10
SOUND 0 VOLUME 5

REM Compare with other sub-commands (should match VOLUME in VOICE/SOUND contexts)
SPRITE 0 ON AT 100, 100 COLOR 1
VMODE TEXT ROWS 25 COLS 40