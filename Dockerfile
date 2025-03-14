# Build stage for React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build:prod

# Main stage with Python for Django backend
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=backend.settings_prod

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django backend
COPY backend/ /app/backend/

# Copy built React files
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Collect Django static files
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput --clear
WORKDIR /app

# Add entrypoint script (Windows-compatible version)
COPY docker-entrypoint.sh .
# Convert CRLF to LF (important for Windows)
RUN sed -i 's/\r$//' docker-entrypoint.sh && \
    chmod +x docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
