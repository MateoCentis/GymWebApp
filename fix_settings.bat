@echo off
echo Checking Django settings configuration...

:: Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    pause
    exit /b 1
)

:: Run the settings check/fix script
python create_settings_dev.py

echo.
echo Settings check complete.
echo You can now try running deploy.bat again.
echo.
pause
