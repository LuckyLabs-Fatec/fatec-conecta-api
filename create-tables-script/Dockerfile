FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY create_tables.py ./

# Roda o script e sai
CMD ["sh", "-c", "python create_tables.py"]
