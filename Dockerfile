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
RUN chmod +x entrypoint.sh

# Expose port
EXPOSE 8000

# entrypoint.sh: migra sempre, semeia SÓ se o banco estiver vazio (nunca
# apaga dado existente por causa de um restart -- ver comentário no script).
CMD ["./entrypoint.sh"]
