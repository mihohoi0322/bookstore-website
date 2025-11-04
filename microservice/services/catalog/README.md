# Catalog Service

書籍カタログの公開 API を提供するサービスです。Dapr のステートストアに保存された書籍メタデータを参照し、タグや販売ステータスでフィルタリングできます。

## 主要エンドポイント

- `GET /catalog/books`
  - クエリ: `tag`, `status`, `q`
- `GET /catalog/books/:bookId`

レスポンススキーマは `../../contracts/catalog.openapi.yaml` を参照してください。

## ローカル開発

```bash
npm install
npm run dev
```

Dapr を併用する場合は次のように実行します。

```bash
dapr run --app-id catalog-service --app-port 4101 \
  --components-path ../../dapr/components -- npm run dev
```
