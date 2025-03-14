@echo off
echo Starting Django-React application in production mode...

:: Check if virtual environment exists
if not exist venv (
    echo Virtual environment not found.
    echo Please run deploy.bat first to set up the environment.
    pause
    exit /b 1
)

:: Check if frontend build exists - look in the dist directory, not the folder itself
if not exist frontend\dist\index.html (
    echo Frontend build not found.
    echo Running build process...
    call venv\Scripts\activate
    cd frontend
    call npm run build:prod
    cd ..
    if not exist frontend\dist\index.html (
        echo Failed to build frontend. Please check for errors.
        pause
        exit /b 1
    )
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
start cmd /k "python manage.py runserver 0.0.0.0:8000"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start Django server.
    cd ..
    pause
    exit /b 1
)
cd ..

:: Serve React build using Django's static files
echo Django server is hosting the frontend at http://localhost:8000
echo.
echo Application started!
echo - Frontend and API: http://localhost:8000
echo - Django Admin: http://localhost:8000/admin
echo.
echo Press any key to close this window. The servers will continue running.
pause > nul
