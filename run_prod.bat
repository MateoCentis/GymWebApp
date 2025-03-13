@echo off
echo Starting Django-React application in production mode...

:: Activate virtual environment
call venv\Scripts\activate

:: Run Django with production settings
cd backend
set DJANGO_SETTINGS_MODULE=backend.settings_prod
start python manage.py runserver

:: Serve React build using a simple HTTP server
cd ..\frontend\dist
start python -m http.server 3000

echo.
echo Application started!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000/api
echo - Django Admin: http://localhost:8000/admin
