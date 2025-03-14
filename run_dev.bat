@echo off
echo Starting Django-React application in development mode...

:: Check if virtual environment exists
if not exist venv (
    echo Virtual environment not found.
    echo Please run deploy.bat first to set up the environment.
    pause
    exit /b 1
)

:: Start frontend development server
echo Starting React development server...
start cmd /k "cd frontend && npm run dev"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start the frontend development server.
    pause
    exit /b 1
)

:: Start backend development server
echo Starting Django development server...
start cmd /k "call venv\Scripts\activate && cd backend && python manage.py runserver"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start the Django development server.
    pause
    exit /b 1
)

echo.
echo Application started!
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8000
echo - API: http://localhost:8000/api
echo - Admin: http://localhost:8000/admin
echo.
echo Press any key to close this window. The servers will continue running.
pause > nul
