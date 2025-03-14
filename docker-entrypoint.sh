#!/bin/bash
set -e

# Wait for database to be ready (if using external DB)
# while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
#   echo "Waiting for database connection..."
#   sleep 2
# done

cd /app/backend

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files (again, just to be sure)
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Start server
echo "Starting server..."
cd /app
exec "$@"
