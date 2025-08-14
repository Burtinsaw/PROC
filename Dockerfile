# Frontend Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Basic SPA fallback
RUN sed -i 's#/usr/share/nginx/html;#/usr/share/nginx/html;\n    try_files $uri /index.html;#' /etc/nginx/conf.d/default.conf
EXPOSE 80
