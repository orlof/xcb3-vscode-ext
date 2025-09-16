REM Test file for ON interrupt statements with values
REM Testing proper coloring of ON statements with interrupt keywords and values

REM ON ERROR (no value before GOTO)
ON ERROR GOTO errorhandler

REM ON TIMER with cycle values before GOSUB
ON TIMER 100 GOSUB timerhandler
ON TIMER 5000 GOSUB slowtimer
ON TIMER RND() * 1000 + 50 GOSUB randomtimer
ON TIMER PEEK($DC04) GOSUB variabletimer

REM ON RASTER with line values before GOSUB  
ON RASTER 100 GOSUB rasterhandler
ON RASTER 250 GOSUB bottomraster
ON RASTER ABS(-150) GOSUB calculatedline
ON RASTER SHL(50, 1) GOSUB shiftedraster

REM ON SPRITE, BACKGROUND, VBLANK (no values before GOSUB)
ON SPRITE GOSUB spritehandler
ON BACKGROUND GOSUB backgroundhandler
ON VBLANK GOSUB vblankhandler

REM ON with regular values (not interrupt keywords)
DIM choice AS BYTE
choice = 3
ON choice GOTO label1, label2, label3
ON choice GOSUB sub1, sub2, sub3

REM Labels and handlers
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

errorhandler:
    PRINT "Error occurred"
    RETURN

timerhandler:
    PRINT "Timer interrupt"
    RETURN

slowtimer:
    PRINT "Slow timer"
    RETURN

randomtimer:
    PRINT "Random timer"
    RETURN

variabletimer:
    PRINT "Variable timer"
    RETURN

rasterhandler:
    PRINT "Raster interrupt"
    RETURN

bottomraster:
    PRINT "Bottom raster"
    RETURN

calculatedline:
    PRINT "Calculated line"
    RETURN

shiftedraster:
    PRINT "Shifted raster"
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