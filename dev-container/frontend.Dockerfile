# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim

WORKDIR /app

# Install deps only; source is bind-mounted at runtime. The /app/node_modules
# volume in docker-compose preserves these in the running container.
COPY frontend/package.json frontend/yarn.lock ./
RUN corepack enable \
    && corepack yarn install --non-interactive --frozen-lockfile

EXPOSE 3000

CMD ["yarn", "start"]
