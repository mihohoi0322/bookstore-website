# ビルドステージ
FROM node:20 AS builder

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# package-lock.jsonを削除し、依存関係を再インストール
RUN rm -f package-lock.json && npm install --include=optional

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# 本番ステージ
FROM nginx:alpine

# Nginxの設定ファイルをコピー（後で作成）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物をNginxのディレクトリにコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# ポート80を公開
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]
