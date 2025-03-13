# Django-React Application

A full-stack application built with Django (backend) and React (frontend).

## System Requirements

- Windows 10 or 11
- Python 3.9+ (with pip)
- Node.js 16+ (with npm)
- Git (optional)
- Docker (optional, for containerized deployment)

## Installation

### Docker Deployment (Recommended)

The easiest way to deploy this application is using Docker:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows
2. Clone or download this repository
3. Run `deploy_docker.bat` to build and start the Docker containers
4. Access the application at http://localhost:8000

Docker handles all dependencies, database setup, and environment configuration automatically.

### Automatic Setup (Alternative)

1. Clone or download this repository
2. Run `deploy.bat` to set up the environment and build the application
3. Run `run_dev.bat` for development mode or `run_prod.bat` for production mode

### Manual Setup

#### Backend Setup

1. Create a Python virtual environment:

   ```
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install Python dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Run migrations:

   ```
   cd backend
   python manage.py migrate
   ```

4. Create a superuser (optional):
   ```
   python manage.py createsuperuser
   ```

#### Frontend Setup

1. Install Node.js dependencies:

   ```
   cd frontend
   npm install
   ```

2. Build the frontend:
   ```
   npm run build
   ```

## Running the Application

### Development Mode

1. Start the Django development server:

   ```
   cd backend
   python manage.py runserver
   ```

2. In a separate terminal, start the React development server:

   ```
   cd frontend
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/admin

### Production Mode

1. Build the frontend for production:

   ```
   cd frontend
   npm run build:prod
   ```

2. Run Django with production settings:

   ```
   cd backend
   set DJANGO_SETTINGS_MODULE=backend.settings_prod
   python manage.py runserver
   ```

3. Serve the frontend build using a simple HTTP server:

   ```
   cd frontend/dist
   python -m http.server 3000
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/admin

## Troubleshooting

If you encounter any issues:

1. Make sure all required software is installed
2. Check that the virtual environment is activated
3. Verify that all dependencies are installed
4. Check the console output for error messages
5. Look for logs in the backend/error.log file (in production mode)

## Database

The application uses SQLite by default, which stores data in a file at `backend/db.sqlite3`.
