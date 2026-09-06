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

COPY dev-container/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
