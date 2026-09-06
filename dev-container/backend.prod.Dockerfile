# syntax=docker/dockerfile:1

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

RUN pip install --upgrade pip \
    && pip install \
        "fastapi==0.110.1" \
        "uvicorn==0.25.0" \
        "watchfiles==1.2.0" \
        "python-dotenv==1.2.2" \
        "motor==3.3.1" \
        "pymongo==4.6.3" \
        "httpx==0.28.1" \
        "pydantic==2.13.4" \
        "email-validator==2.3.0" \
        "razorpay==2.0.1" \
        "boto3==1.43.49" \
        "python-multipart==0.0.32"

WORKDIR /app
COPY backend/ /app/

# Local copy of the site images (frontend/public). The catalogue seed shifts
# these to S3 and, in production (LAUNCH_ENV=production), deletes them from
# this copy afterwards.
COPY frontend/public/ /opt/site-images/

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
