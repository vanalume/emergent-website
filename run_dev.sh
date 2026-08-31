#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-dev-container/docker-compose.dev.yml}"
FRONTEND_URL="http://localhost:${FRONTEND_PORT:-3000}"
BACKEND_URL="http://localhost:${BACKEND_PORT:-8000}"

echo "==> Building dev images (compose: ${COMPOSE_FILE})"
docker compose -f "$COMPOSE_FILE" build

echo "==> Launching dev stack"
docker compose -f "$COMPOSE_FILE" up -d

echo "==> Waiting for services to come up..."
for _ in $(seq 1 60); do
    if curl -sf -o /dev/null "$BACKEND_URL/api/" && curl -sf -o /dev/null "$FRONTEND_URL"; then
        break
    fi
    sleep 1
done

echo "==> Done."
echo "    Frontend:      ${FRONTEND_URL}"
echo "    Backend API:   ${BACKEND_URL}/api/"
echo "    Mongo (host):  mongodb://localhost:${MONGO_PORT:-27017}"
echo
echo "    Logs:          docker compose -f ${COMPOSE_FILE} logs -f"
echo "    Stop:          docker compose -f ${COMPOSE_FILE} down"
echo "    Rebuild deps:  docker compose -f ${COMPOSE_FILE} down -v && $0"
