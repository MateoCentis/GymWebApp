@echo off
cd /d C:\Dev\Django-React

:: Start Django backend
start /min cmd /c "call env\Scripts\activate && cd backend && python manage.py runserver"

:: Start React frontend
start /min cmd /c "cd frontend && npm run dev"
