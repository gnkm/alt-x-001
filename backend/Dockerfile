# Backend Dockerfile
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy alembic configuration
COPY alembic.ini ./
COPY alembic ./alembic

# Copy source code
COPY src ./src

# Set PYTHONPATH
ENV PYTHONPATH=/app/src

# Expose port
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

