REM Test file for IntelliSense features
REM Try the following tests:
REM 1. Type "PR" and press Ctrl+Space - should show PRINT completion
PRINT "Hello World"

ASM
    lda #55
    sta $d020
END ASM

FOR

REM 2. Type "AB" and press Ctrl+Space - should show ABS function
ABS(n)
REM 3. Hover over PRINT below - should show documentation
PRINT "Testing IntelliSense"

REM 4. Type "DIM test AS " and press Ctrl+Space - should show data types
DIM test AS LONG
REM 5. Hover over ABS below - should show function signature
DIM result AS INT
result = ABS(-42)

REM 6. Try typing these partial words and use Ctrl+Space:
REM    - "FOR" (should complete to FOR loop)
REM    - "CHR" (should show CHR$ function)
REM    - "PEE" (should show PEEK function)
FOR

REM 7. Test FOR loop snippet - type "for" and press TAB
FOR i AS INT = 1 TO end
    PRINT i
NEXT i

REM 8. Test syntax highlighting - "end" should be colored as variable, not keyword
DIM start AS INT = 1
DIM end AS INT = 10
FOR counter AS INT = start TO end
    PRINT counter
NEXT counter

REM 9. Hover over any of these keywords/functions to see documentation:
PRINT "Test complete"

