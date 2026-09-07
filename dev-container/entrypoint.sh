#!/bin/sh
# Frontend container entrypoint: generate a self-signed placeholder cert so nginx
# can start on 443 before the real Let's Encrypt cert is issued, then exec the
# real command (nginx). The real cert replaces the placeholder in-place later.
set -e

CERT_DIR="/etc/letsencrypt/live/vanalume.com"

if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
    echo "[entrypoint] generating self-signed placeholder certificate"
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/CN=vanalume.com" \
        -addext "subjectAltName=DNS:vanalume.com,DNS:www.vanalume.com" >/dev/null 2>&1
fi

exec "$@"
