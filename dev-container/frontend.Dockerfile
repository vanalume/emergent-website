# syntax=docker/dockerfile:1

FROM oven/bun:1.2.23

WORKDIR /app

# Install deps only; source is bind-mounted at runtime. The /app/node_modules
# volume in docker-compose preserves these in the running container.
COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

EXPOSE 3000

CMD ["bun", "run", "start"]
