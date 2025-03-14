@echo off
echo Starting Django-React application in production mode...

:: Check if virtual environment exists
if not exist venv (
    echo Virtual environment not found.
    echo Please run deploy.bat first to set up the environment.
    pause
    exit /b 1
)

:: Check if frontend is built
if not exist frontend\dist (
    echo Frontend build not found.
    echo Please run deploy.bat first to build the frontend.
    pause
    exit /b 1
)

:: Activate virtual environment
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment.
    pause
    exit /b 1
)

:: Run Django with production settings
echo Starting Django with production settings...
cd backend
set DJANGO_SETTINGS_MODULE=backend.settings_prod
start cmd /k "python manage.py runserver"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start Django server.
    cd ..
    pause
    exit /b 1
)
cd ..

:: Serve React build using a simple HTTP server
echo Starting HTTP server for the frontend...
cd frontend\dist
start cmd /k "python -m http.server 3000"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start the HTTP server for the frontend.
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo.
echo Application started!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/api
echo - Django Admin: http://localhost:8000/admin
echo.
echo Press any key to close this window. The servers will continue running.
pause > nul
