FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY server/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code into a package directory
COPY server/ server/

# Expose port
EXPOSE 8888

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8888

# Run the application as a module to support relative imports
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8888"]