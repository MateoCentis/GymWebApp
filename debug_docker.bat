@echo off
echo Starting Django-React application in Docker debug mode...

:: Check if Docker is installed and running
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH. Please install Docker Desktop.
    pause
    exit /b
)

docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not running. Please start Docker Desktop.
    pause
    exit /b
)

:: Build and start debug container
echo Building and starting debug container...
docker-compose -f docker-compose.debug.yml down
docker-compose -f docker-compose.debug.yml build
docker-compose -f docker-compose.debug.yml up

echo.
echo Debug session ended. Any errors should be visible in the console output above.
pause
