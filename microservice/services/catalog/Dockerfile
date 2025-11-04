# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /workspace

FROM base AS builder

# 共有ライブラリをセットアップ
COPY microservice/services/shared ./shared
RUN cd shared \
  && npm ci \
  && npm run build \
  && npm prune --omit=dev

# カタログサービスをセットアップ
COPY microservice/services/catalog ./catalog
RUN cd catalog \
  && npm ci \
  && npm run build \
  && npm prune --omit=dev

# 余分なソースを削除して軽量化
RUN rm -rf shared/src shared/tsconfig.json shared/package-lock.json \
  && rm -rf catalog/src catalog/tsconfig.json catalog/package-lock.json

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4101

COPY --from=builder /workspace/shared ./shared
COPY --from=builder /workspace/catalog ./

RUN rm -rf node_modules/@bookstore/shared \
  && ln -s /app/shared node_modules/@bookstore/shared

RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 4101
CMD ["node", "dist/server.js"]