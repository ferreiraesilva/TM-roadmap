FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 8000

# Start script to run migrations, seed if db is empty, and start uvicorn
CMD ["sh", "-c", "alembic upgrade head && python seed_db.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
