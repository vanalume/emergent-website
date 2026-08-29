#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="${BACKEND_DIR:-/opt/backend}"
FRONTEND_DIR="${FRONTEND_DIR:-/opt/frontend}"
DATA_DIR="${DATA_DIR:-/data/db}"
MONGO_PORT="${MONGO_PORT:-27017}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

echo "==> Writing container-aware .env files"
BACKEND_DIR="$BACKEND_DIR" FRONTEND_DIR="$FRONTEND_DIR" python3 /usr/local/bin/rewrite_env.py

echo "==> Starting MongoDB on 127.0.0.1:${MONGO_PORT} (dbpath: ${DATA_DIR})"
mkdir -p "$DATA_DIR"
mongod --bind_ip 127.0.0.1 --port "$MONGO_PORT" --dbpath "$DATA_DIR" > /var/log/mongod.log 2>&1 &
MONGO_PID=$!

MONGO_UP=0
for _ in $(seq 1 60); do
    if mongosh --quiet "mongodb://127.0.0.1:${MONGO_PORT}/test" --eval 'quit(db.runCommand({ping:1}).ok ? 0 : 1)' > /dev/null 2>&1; then
        MONGO_UP=1
        break
    fi
    sleep 1
done
if [ "$MONGO_UP" != "1" ]; then
    echo "ERROR: MongoDB did not become ready. Logs:"
    cat /var/log/mongod.log
    exit 1
fi

echo "==> Starting backend API on 127.0.0.1:${BACKEND_PORT}"
cd "$BACKEND_DIR"
/venv/bin/uvicorn server:app --host 127.0.0.1 --port "$BACKEND_PORT" --workers 1 > /var/log/backend.log 2>&1 &
BACKEND_PID=$!

echo "==> Starting nginx on port 80"
nginx -g "daemon off;" > /var/log/nginx.log 2>&1 &
NGINX_PID=$!

cleanup() {
    kill "$NGINX_PID" "$BACKEND_PID" "$MONGO_PID" 2>/dev/null || true
}
trap cleanup INT TERM

while true; do
    if ! kill -0 "$NGINX_PID" 2>/dev/null || ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        break
    fi
    sleep 2
done

echo "==> A supervised process exited. Shutting down container."
cleanup
exit 0