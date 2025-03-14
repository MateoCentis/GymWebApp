@echo off
echo Force-building frontend, ignoring TypeScript errors...

:: Check if virtual environment exists
if not exist "%~dp0venv" (
    echo Virtual environment not found.
    echo Please run deploy.bat first to set up the environment.
    pause
    exit /b 1
)

:: Activate virtual environment
call "%~dp0venv\Scripts\activate"

:: Navigate to frontend dir
cd "%~dp0frontend"

:: Clean dist directory if it exists
if exist dist (
    echo Cleaning existing build files...
    rmdir /s /q dist
)

:: Build frontend with TypeScript check bypassing
echo Building frontend (ignoring TypeScript errors)...
call npx vite build --emptyOutDir

:: Check if build succeeded
if not exist dist\index.html (
    echo Build failed!
    cd "%~dp0"
    pause
    exit /b 1
)

echo.
echo Frontend successfully built!
echo Files are available in frontend/dist/
echo.
echo You can now run run_prod.bat to start the application.
cd "%~dp0"
pause
