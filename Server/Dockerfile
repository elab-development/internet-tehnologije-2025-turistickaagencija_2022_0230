FROM python:3.12.3

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements from the src project folder
COPY src/requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project source
COPY src/ ./src

WORKDIR /app/src

# Collect static assets into STATIC_ROOT for WhiteNoise to serve in production.
RUN python manage.py collectstatic --noinput

# Expose the Django development server port
EXPOSE 8000

# Run Django development server
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"]
