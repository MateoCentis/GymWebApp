@echo off
echo Checking system requirements for Django-React application...

echo.
echo === Python ===
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Python not found. Please install Python 3.9+ from https://www.python.org/downloads/
) else (
    python --version
    echo [OK] Python is installed
    
    :: Check pip
    python -m pip --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] pip not found
    ) else (
        echo [OK] pip is installed
    )
    
    :: Check venv module
    python -c "import venv" >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] venv module not available
    ) else (
        echo [OK] venv module is available
    )
)

echo.
echo === Node.js ===
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Node.js not found. Please install Node.js 16+ from https://nodejs.org/
) else (
    node --version
    echo [OK] Node.js is installed
    
    :: Check npm
    where npm >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [FAILED] npm not found
    ) else (
        npm --version
        echo [OK] npm is installed
    )
)

echo.
echo === Project Files ===
if exist requirements.txt (
    echo [OK] requirements.txt found
) else (
    echo [FAILED] requirements.txt not found in %CD%
)

if exist backend (
    echo [OK] backend directory found
) else (
    echo [FAILED] backend directory not found
)

if exist frontend (
    echo [OK] frontend directory found
) else (
    echo [FAILED] frontend directory not found
)

echo.
echo === Docker (Optional) ===
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Docker not found. Docker is optional but recommended for deployment.
) else (
    docker --version
    echo [OK] Docker is installed
    
    docker info >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Docker is installed but not running
    ) else (
        echo [OK] Docker is running
    )
)

echo.
echo Environment check complete.
pause
