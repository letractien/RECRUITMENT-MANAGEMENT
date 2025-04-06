FROM python:3.11-slim as base

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Development stage
FROM base as development
ENV HOST=0.0.0.0
ENV PORT=8000
# Copy development environment variables
COPY .env.development .env
EXPOSE 8000
CMD ["python", "server.py"]

# Production stage
FROM base as production
ENV HOST=0.0.0.0
ENV PORT=8000
# Copy production environment variables
COPY .env.production .env
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 