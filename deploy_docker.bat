@echo off
echo Building and starting Docker containers...

:: Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH. Please install Docker Desktop.
    pause
    exit /b
)

:: Check Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not running. Please start Docker Desktop.
    pause
    exit /b
)

:: Kill existing containers if they exist
echo Stopping any existing containers...
docker-compose down

:: Build and start containers
echo Building containers (this may take a while)...
docker-compose build --no-cache

echo Starting containers...
docker-compose up -d

:: Check if containers are running
timeout /t 5 /nobreak >nul
docker-compose ps

echo.
echo If the containers are running, you can access the application at:
echo - http://localhost:8000
echo.
echo To view logs:
echo docker-compose logs -f
echo.
echo To stop the application:
echo docker-compose down
echo.
pause
