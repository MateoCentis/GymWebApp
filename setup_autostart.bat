@echo off
echo Setting up automatic startup for Django-React application...

:: Get full path to startup.bat
set STARTUP_BAT="%~dp0startup.bat"

:: Create a scheduled task that runs at logon
schtasks /create /tn "Django-React App" /tr %STARTUP_BAT% /sc onlogon /ru "%USERNAME%" /rl highest /f

if %ERRORLEVEL% EQU 0 (
    echo Success! The application will start automatically when you log in.
    echo You can manage this task in Windows Task Scheduler.
) else (
    echo Failed to create the scheduled task.
    echo Please try running this script as administrator.
)

echo.
echo Press any key to exit...
pause > nul
