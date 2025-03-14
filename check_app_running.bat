@echo off
echo Checking if Django-React application is running...

tasklist /FI "WINDOWTITLE eq Django*" | find "cmd.exe" > nul
if %ERRORLEVEL% EQU 0 (
    echo Application is running.
    echo You can access it at: http://localhost:8000
) else (
    echo Application is not running.
    echo Run startup.bat or run_prod.bat to start it.
)

echo.
echo Press any key to exit...
pause > nul
