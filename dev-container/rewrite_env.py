#!/usr/bin/env python3
import os
from pathlib import Path

BACKEND_ENV = Path(os.environ.get("BACKEND_DIR", "/opt/backend")) / ".env"
FRONTEND_ENV = Path(os.environ.get("FRONTEND_DIR", "/opt/frontend")) / ".env"

BACKEND_CONNECTIVITY = {
    "MONGO_URL": "mongodb://127.0.0.1:27017",
    "CORS_ORIGINS": "*",
}

BACKEND_KEYS = {
    "MONGO_URL",
    "DB_NAME",
    "CORS_ORIGINS",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "EMERGENT_EMAIL_KEY",
    "EMAIL_FROM_NAME",
    "OWNER_EMAIL",
    "ADMIN_KEY",
    "SHIPROCKET_EMAIL",
    "SHIPROCKET_PASSWORD",
    "SHIPROCKET_PICKUP_LOCATION",
    "SHIPROCKET_WEBHOOK_SECRET",
    "EMAIL_BASE_URL",
}

FRONTEND_CONNECTIVITY = {
    "REACT_APP_BACKEND_URL": "",
}

FRONTEND_KEYS = {
    "REACT_APP_BACKEND_URL",
    "WDS_SOCKET_PORT",
    "ENABLE_HEALTH_CHECK",
}


def read_env(path):
    env = {}
    if path.exists():
        for line in path.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def write_env(path, env, order):
    lines = []
    added = set()
    for key in order:
        if key in env and key not in added:
            lines.append(f"{key}={env[key]}\n")
            added.add(key)
    for key, value in env.items():
        if key not in added:
            lines.append(f"{key}={value}\n")
    path.write_text("".join(lines))


def apply(env, connectivity, keys):
    for key, default in connectivity.items():
        env.setdefault(key, "")  # image value wins if it is already set
        if not env[key]:
            env[key] = default
    for key in keys:
        if key in os.environ and os.environ[key]:
            env[key] = os.environ[key]


def main():
    backend = read_env(BACKEND_ENV)
    apply(backend, BACKEND_CONNECTIVITY, BACKEND_KEYS)
    write_env(BACKEND_ENV, backend, list(BACKEND_CONNECTIVITY) + ["DB_NAME", "CORS_ORIGINS"])

    frontend = read_env(FRONTEND_ENV)
    apply(frontend, FRONTEND_CONNECTIVITY, FRONTEND_KEYS)
    write_env(FRONTEND_ENV, frontend, list(FRONTEND_CONNECTIVITY))


if __name__ == "__main__":
    main()