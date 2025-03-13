#!/bin/bash

# Apply database migrations
echo "Applying database migrations..."
python backend/manage.py migrate --noinput

# Create superuser if needed (optional)
# python backend/manage.py createsuperuser --noinput

# Start server
echo "Starting server..."
exec "$@"
