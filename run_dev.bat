@echo off
echo Starting Django-React application in development mode...

start cmd /k "cd frontend && npm run dev"
start cmd /k "call venv\Scripts\activate && cd backend && python manage.py runserver"

echo.
echo Application started!
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8000
