#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-vanalume-site:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-vanalume}"
VOLUME_NAME="${VOLUME_NAME:-vanalume-data}"
HOST_PORT="${HOST_PORT:-8080}"
BASE_URL="http://localhost:${HOST_PORT}"

echo "==> Building image: ${IMAGE_NAME}"
docker build -t "$IMAGE_NAME" .

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "==> Removing existing container: ${CONTAINER_NAME}"
    docker rm -f "$CONTAINER_NAME" >/dev/null
fi

echo "==> Launching '${CONTAINER_NAME}' (frontend on port ${HOST_PORT}, data in volume '${VOLUME_NAME}')"
docker run -d \
    --name "$CONTAINER_NAME" \
    -p "${HOST_PORT}:80" \
    -v "${VOLUME_NAME}:/data/db" \
    "$IMAGE_NAME"

echo "==> Waiting for the site to come up..."
for _ in $(seq 1 30); do
    if curl -sf -o /dev/null "$BASE_URL"; then
        break
    fi
    sleep 1
done

echo "==> Done."
echo "    Frontend:      ${BASE_URL}"
echo "    Backend API:   ${BASE_URL}/api/"
echo "    Backend logs:  docker exec -it ${CONTAINER_NAME} tail -f /var/log/backend.log"

# Shell into the running container to inspect the backend:
#   docker exec -it vanalume bash
# Inside: backend code is in /opt/backend, Python runtime is /venv,
# and uvicorn logs are at /var/log/backend.log.