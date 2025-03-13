@echo off
echo Setting up Django-React application...

:: Create and activate virtual environment
echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

:: Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

:: Set up the database
echo Setting up the database...
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
cd ..

:: Set up the frontend
echo Building React frontend...
cd frontend
call npm install
call npm run build
cd ..

echo.
echo Setup complete! You can now run the application using:
echo   - For development: run_dev.bat
echo   - For production: run_prod.bat
