REM Test file to verify ON interrupt snippets work correctly
REM Type these prefixes to test the snippets:

REM "ON ERROR" should expand to:
REM ON ERROR GOTO ${1:label}

REM "ON TIMER" should expand to:  
REM ON TIMER ${1:cycles} GOSUB ${2:label}

REM "ON RASTER" should expand to:
REM ON RASTER ${1:line} GOSUB ${2:label}

REM "ON INTERRUPT" should expand to:
REM ON ${1|SPRITE,BACKGROUND,VBLANK|} GOSUB ${2:label}

REM Examples of correct syntax:
ON ERROR GOTO errorhandler
ON TIMER 100 GOSUB timerhandler  
ON RASTER 250 GOSUB rasterhandler
ON SPRITE GOSUB spritehandler
ON BACKGROUND GOSUB backgroundhandler  
ON VBLANK GOSUB vblankhandler

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