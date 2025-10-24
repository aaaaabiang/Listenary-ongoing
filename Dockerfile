# syntax = docker/dockerfile:1
ARG NODE_VERSION=22.19.0
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# ---------- build ----------
FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# 关键：构建期注入 API 地址（Vite 只在 build 时读取）
ARG VITE_API_BASE_URL=https://listenary-ongoing.onrender.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# ---------- run ----------
FROM nginx:alpine
# SPA 路由：任意路径回退到 index.html
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
