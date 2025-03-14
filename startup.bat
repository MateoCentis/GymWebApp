@echo off
echo Starting Django-React application on startup...

:: Get the absolute path of the current directory
set APP_DIR=%~dp0
cd %APP_DIR%

:: Check if app is already running
tasklist /FI "WINDOWTITLE eq Django*" | find "cmd.exe" > nul
if %ERRORLEVEL% EQU 0 (
    echo Application is already running.
    timeout /t 5
    exit /b 0
)

:: Check environment
if not exist venv (
    echo Virtual environment not found.
    echo Please run deploy.bat first to set up the environment.
    timeout /t 10
    exit /b 1
)

if not exist frontend\dist\index.html (
    echo Frontend build not found.
    echo Please run deploy.bat first to build the frontend.
    timeout /t 10
    exit /b 1
)

:: Activate virtual environment (no window)
call venv\Scripts\activate

:: Start Django with production settings (minimized window)
cd backend
set DJANGO_SETTINGS_MODULE=backend.settings_prod
start /min cmd /c "title Django Server && python manage.py runserver 0.0.0.0:8000"
cd ..

:: Open browser after a delay to give server time to start
timeout /t 5 /nobreak > nul
start http://localhost:8000

echo Application started successfully!
exit /b 0
