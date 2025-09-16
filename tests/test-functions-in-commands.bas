REM Test file for built-in functions in command contexts
REM All built-in functions should be colored as keyword.control.xcbasic3 (keywords)

DIM x AS INT, y AS INT, color AS INT

REM SPRITE commands with built-in functions
SPRITE 0 ON AT SHL(10, 2), SHR(100, 1) COLOR RND() * 15
SPRITE 1 AT PEEK($D000) + 50, ABS(-30) COLOR RNDB()
SPRITE SHR(1, x) ON

REM VOICE commands with built-in functions  
VOICE 0 VOLUME ABS(-10) TONE SIN(3.14) * 100
VOICE RND() * 3 PULSE SQR(16)

REM FILTER commands with built-in functions
FILTER CUTOFF RND() * 255 RESONANCE SHL(3, 2)

REM SCREEN commands with built-in functions
SCREEN ROWS INT(RND() * 3) + 23 COLS POW(2, 5) + 8

REM SOUND commands with built-in functions  
SOUND 0 VOLUME RND() * 15 FREQ PEEK($D012) + 100
SOUND AT CHR(ASC("0") + RND() * 9)

REM BACKGROUND commands with built-in functions
BACKGROUND PEEK($D020) + RND() * 5

REM BORDER commands with built-in functions
BORDER SHR(PEEK($D021), 1)

REM CHARAT commands with built-in functions
CHARAT ABS(-10), SGN(-5) + 12

REM ON statements with built-in functions as values
ON RND() * 3 + 1 GOTO label1, label2, label3
ON ABS(x) GOSUB sub1, sub2, sub3
ON SHL(1, PEEK($DC00)) GOTO start

REM Compare with standalone built-in functions (should have same coloring)
x = SHR(100, 2)
y = RND() * 255
color = PEEK($D020)

REM Labels and subroutines for ON statements
label1:
    PRINT "Label 1"
    GOTO done

label2:
    PRINT "Label 2"  
    GOTO done

label3:
    PRINT "Label 3"

done:
    END

SUB sub1()
    PRINT "Sub 1"
END SUB

SUB sub2() 
    PRINT "Sub 2"
END SUB

SUB sub3()
    PRINT "Sub 3"
END SUB

start:
    PRINT "Start"