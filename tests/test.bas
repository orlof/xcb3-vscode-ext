REM XC-BASIC3 Test File
PRINT "Hello, World!"

DIM x AS INT
x = 42
PRINT "The answer is: "; x

FOR i AS INT = 1 TO 10
    PRINT "Count: "; i
NEXT i

SUB TestSub()
    PRINT "This is a subroutine"
END SUB

CALL TestSub()

FUNCTION Add(a AS INT, b AS INT) AS INT
    RETURN a + b
END FUNCTION

PRINT "5 + 3 = "; Add(5, 3)
