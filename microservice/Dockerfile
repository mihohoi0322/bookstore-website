# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
WORKDIR /app
ENV ROLLUP_NATIVE=false

COPY microservice/package.json microservice/package-lock.json ./
RUN npm ci

COPY microservice/ ./
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY microservice/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
