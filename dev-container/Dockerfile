# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS frontend-build

ARG REACT_APP_BACKEND_URL=""
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

WORKDIR /app

COPY frontend/package.json frontend/yarn.lock /app/
RUN corepack enable \
    && corepack yarn install --non-interactive --frozen-lockfile

COPY frontend/ /app/
RUN corepack yarn build

FROM mongo:7

ENV DEBIAN_FRONTEND=noninteractive
ENV BACKEND_DIR=/opt/backend
ENV FRONTEND_DIR=/opt/frontend
ENV PATH="/venv/bin:$PATH"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 python3-venv python3-pip nginx tini ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /venv

RUN /venv/bin/pip install --no-cache-dir --upgrade pip \
    && /venv/bin/pip install --no-cache-dir \
        "fastapi==0.110.1" \
        "uvicorn==0.25.0" \
        "python-dotenv==1.2.2" \
        "motor==3.3.1" \
        "pymongo==4.6.3" \
        "httpx==0.28.1" \
        "pydantic==2.13.4" \
        "email-validator==2.3.0" \
        "razorpay==2.0.1"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/.env /opt/frontend/.env
COPY rewrite_env.py /usr/local/bin/rewrite_env.py
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --from=frontend-build /app/build /opt/frontend/build
COPY backend/ /opt/backend/

RUN rm -f /etc/nginx/sites-enabled/default \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

VOLUME ["/data/db"]

EXPOSE 80

WORKDIR /opt/backend

ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]