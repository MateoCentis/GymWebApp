@echo off
setlocal enabledelayedexpansion

echo Starting Django-React application setup...

:: Check if Python is installed
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Check if requirements.txt exists
if not exist "%~dp0requirements.txt" (
    echo Error: Cannot find requirements.txt in the current directory.
    echo Current directory is: %CD%
    echo Looking for: %~dp0requirements.txt
    pause
    exit /b 1
)

:: Create and activate virtual environment
echo Creating Python virtual environment...
if exist venv (
    echo Virtual environment already exists, using existing one.
) else (
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to create virtual environment.
        pause
        exit /b 1
    )
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to activate virtual environment.
    pause
    exit /b 1
)

:: Verify pip is available
where pip >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo pip not found in the virtual environment.
    pause
    exit /b 1
)

:: Install Python dependencies
echo Installing Python dependencies from %~dp0requirements.txt
pip install -r "%~dp0requirements.txt"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install Python dependencies.
    echo Make sure requirements.txt exists and is valid.
    pause
    exit /b 1
)

:: Check if backend directory exists
if not exist "%~dp0backend" (
    echo Backend directory not found.
    pause
    exit /b 1
)

:: Set up the database
echo Setting up the database...
cd "%~dp0backend"
python manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo Failed to apply database migrations.
    cd "%~dp0"
    pause
    exit /b 1
)

python manage.py collectstatic --noinput
if %ERRORLEVEL% NEQ 0 (
    echo Failed to collect static files.
    cd "%~dp0"
    pause
    exit /b 1
)
cd "%~dp0"

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if frontend directory exists
if not exist "%~dp0frontend" (
    echo Frontend directory not found.
    pause
    exit /b 1
)

:: Set up the frontend
echo Setting up the frontend...
cd "%~dp0frontend"
echo Installing npm packages...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install npm packages.
    cd "%~dp0"
    pause
    exit /b 1
)

echo Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build the frontend.
    cd "%~dp0"
    pause
    exit /b 1
)
cd "%~dp0"

echo.
echo Setup completed successfully!
echo.
echo You can now run the application using:
echo   - For development: run_dev.bat
echo   - For production: run_prod.bat
echo.
pause
