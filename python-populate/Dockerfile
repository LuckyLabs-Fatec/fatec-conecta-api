FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY create_tables.py populate_tables.py ./

# Roda os dois scripts em sequência e sai
CMD ["sh", "-c", "python create_tables.py && python populate_tables.py"]
