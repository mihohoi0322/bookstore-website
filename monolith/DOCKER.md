# Docker 実行ガイド

このガイドでは、monolithフォルダ配下のアプリケーションをDockerで実行する方法を説明します。

## 前提条件

- Docker がインストールされていること
- Docker が実行中であること

## ビルド方法

monolithフォルダ内で以下のコマンドを実行してDockerイメージをビルドします：

```bash
docker build -t bookstore-monolith .
```

## 実行方法

ビルドしたイメージからコンテナを起動します：

```bash
docker run -d -p 8080:80 --name bookstore-app bookstore-monolith
```

### パラメータの説明

- `-d`: バックグラウンドで実行
- `-p 8080:80`: ホストの8080ポートをコンテナの80ポートにマッピング
- `--name bookstore-app`: コンテナ名を指定

## アクセス方法

ブラウザで以下のURLにアクセスします：

```
http://localhost:8080
```

## コンテナの操作

### コンテナの状態確認

```bash
docker ps
```

### コンテナの停止

```bash
docker stop bookstore-app
```

### コンテナの削除

```bash
docker rm bookstore-app
```

### コンテナの再起動

```bash
docker restart bookstore-app
```

### ログの確認

```bash
docker logs bookstore-app
```

## イメージの削除

```bash
docker rmi bookstore-monolith
```

## トラブルシューティング

### ポートが既に使用されている場合

別のポートを使用してコンテナを起動します：

```bash
docker run -d -p 3000:80 --name bookstore-app bookstore-monolith
```

この場合、`http://localhost:3000` でアクセスできます。

### ディスク容量不足の場合

使用していないDockerリソースをクリーンアップします：

```bash
docker system prune -a -f --volumes
```

## ファイル構成

- `Dockerfile`: Dockerイメージのビルド定義
- `nginx.conf`: Nginx Webサーバーの設定ファイル
- `.dockerignore`: Dockerビルド時に除外するファイル/ディレクトリ
