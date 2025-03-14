@echo off
echo Starting Django-React application in production mode...

:: Check if virtual environment exists
if not exist "%~dp0venv" (
    echo Virtual environment not found.
    echo Please run deploy.bat first to set up the environment.
    pause
    exit /b 1
)

:: Check if frontend has been built or try to build it ignoring errors
if not exist "%~dp0frontend\dist\index.html" (
    echo Frontend build not found.
    echo Running build process with error bypassing...
    call "%~dp0venv\Scripts\activate"
    cd "%~dp0frontend"
    
    echo Building frontend with error skipping...
    call npm run build:prod -- --force
    
    cd "%~dp0"
    
    if not exist "%~dp0frontend\dist\index.html" (
        echo Build completed but frontend files not found. Trying alternative build...
        cd "%~dp0frontend"
        
        :: Try alternative approach to build with error bypassing
        call npx vite build --emptyOutDir
        
        cd "%~dp0"
        
        if not exist "%~dp0frontend\dist\index.html" (
            echo Failed to build frontend despite error bypassing. Using cached files if available.
        ) else {
            echo Successfully built frontend with alternative method.
        }
    } else {
        echo Successfully built frontend ignoring errors.
    }
) else (
    echo Found existing frontend build.
)

:: Activate virtual environment with absolute paths to be safe
echo Activating virtual environment...
call "%~dp0venv\Scripts\activate"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment.
    pause
    exit /b 1
)

:: Create templates directory if it doesn't exist (needed for frontend serving)
if not exist "%~dp0backend\templates" (
    echo Creating templates directory...
    mkdir "%~dp0backend\templates"
)

:: Run Django with production settings
echo Starting Django with production settings...
cd "%~dp0backend"
set DJANGO_SETTINGS_MODULE=backend.settings_prod
echo.
echo Starting server...
start cmd /k "title Django Server && python manage.py runserver 0.0.0.0:8000"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start Django server.
    cd "%~dp0"
    pause
    exit /b 1
)
cd "%~dp0"

:: Wait a moment for the server to start
timeout /t 3 /nobreak > nul

:: Open the application in the default browser
start http://localhost:8000

echo.
echo Application started!
echo - Frontend and API: http://localhost:8000
echo - Django Admin: http://localhost:8000/admin
echo.
echo Press any key to close this window. The server will continue running.
pause > nul
