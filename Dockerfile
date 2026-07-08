FROM python:3.11-slim

WORKDIR /code 

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy requirements from backend folder
COPY eco_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY eco_backend/ .

# Explicitly create folder for uploads
RUN mkdir -p /code/app/uploads

# Set up non-root user with correct permissions
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /code

USER appuser

CMD ["sh", "-c", "python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
