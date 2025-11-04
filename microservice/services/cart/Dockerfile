# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
WORKDIR /workspace

FROM base AS builder

COPY services/shared ./shared
RUN cd shared \
  && npm ci \
  && npm run build \
  && npm prune --omit=dev

COPY services/cart ./cart
RUN cd cart \
  && npm ci \
  && npm run build \
  && npm prune --omit=dev

RUN rm -rf shared/src shared/tsconfig.json shared/package-lock.json \
  && rm -rf cart/src cart/tsconfig.json cart/package-lock.json

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4102

COPY --from=builder /workspace/shared ./shared
COPY --from=builder /workspace/cart ./

RUN rm -rf node_modules/@bookstore/shared \
  && ln -s /app/shared node_modules/@bookstore/shared

RUN addgroup -S app && adduser -S app -G app \
  && chown -R app:app /app
USER app

EXPOSE 4102
CMD ["node", "dist/server.js"]