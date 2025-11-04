# ビルドステージ
FROM node:20 AS builder

WORKDIR /app

# Rollupのネイティブバイナリを無効化
ENV ROLLUP_NATIVE=false

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール（optional も含む）
RUN npm install --include=optional

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# 本番ステージ
FROM nginx:alpine

# 環境変数を設定
ENV NODE_ENV=production

# Nginxの設定ファイルをコピー（後で作成）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物をNginxのディレクトリにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# ポート80を公開
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]
