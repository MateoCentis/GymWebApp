@echo off
echo Building and starting Docker containers...

:: Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH. Please install Docker Desktop.
    pause
    exit /b
)

:: Build and start containers
docker-compose build
docker-compose up -d

echo.
echo Docker containers are now running!
echo Access the application at:
echo - http://localhost:8000
echo.
echo To view logs:
echo docker-compose logs -f
echo.
echo To stop the application:
echo docker-compose down
echo.
pause
