# syntax=docker/dockerfile:1

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Minimal runtime deps (mirrors the production image) + watchfiles for
# `uvicorn --reload`. Backend source is bind-mounted at runtime, not copied.
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
        "razorpay==2.0.1"

WORKDIR /app

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
