REM Test file for ON statement syntax highlighting

REM ON with interrupt keywords - ERROR, TIMER, RASTER, SPRITE, BACKGROUND, VBLANK should be colored as modifiers
ON ERROR GOTO errorhandler
ON TIMER GOSUB timerhandler
ON RASTER GOSUB rasterhandler
ON SPRITE GOSUB spritehandler
ON BACKGROUND GOSUB backgroundhandler
ON VBLANK GOSUB vblankhandler

REM ON with values (variables/literals) - should be colored as variables/labels
DIM choice AS BYTE
choice = 3
ON choice GOTO label1, label2, label3
ON choice GOSUB sub1, sub2, sub3

REM ON with expressions
ON x + 1 GOTO start, middle, end
ON RND * 3 GOSUB random1, random2, random3

REM Labels for testing
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

REM Subroutines for testing
SUB sub1()
    PRINT "Sub 1"
END SUB

SUB sub2()
    PRINT "Sub 2"
END SUB

SUB sub3()
    PRINT "Sub 3"
END SUB

errorhandler:
    PRINT "Error occurred"
    RETURN

timerhandler:
    PRINT "Timer interrupt"
    RETURN

rasterhandler:
    PRINT "Raster interrupt"
    RETURN

spritehandler:
    PRINT "Sprite interrupt"
    RETURN

backgroundhandler:
    PRINT "Background interrupt"
    RETURN

vblankhandler:
    PRINT "VBlank interrupt"
    RETURN