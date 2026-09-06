# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build

ARG REACT_APP_BACKEND_URL=""
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./
RUN corepack enable \
    && corepack yarn install --non-interactive --frozen-lockfile

COPY frontend/ ./
RUN corepack yarn build

FROM nginx:alpine

# openssl is needed by the entrypoint to generate a placeholder self-signed cert.
RUN apk add --no-cache openssl

COPY dev-container/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
COPY dev-container/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
