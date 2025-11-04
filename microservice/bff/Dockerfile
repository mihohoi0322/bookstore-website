# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /workspace

FROM base AS builder
COPY microservice/bff ./bff
RUN cd bff \
  && npm ci \
  && npm run build \
  && npm prune --omit=dev \
  && rm -rf src tsconfig.json package-lock.json

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /workspace/bff ./

RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 4000
CMD ["node", "dist/server.js"]