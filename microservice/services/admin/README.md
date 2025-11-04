# Admin Service

管理者向けに書籍の登録・更新・公開状態の切り替えを提供するサービスです。カタログサービスが利用する Dapr ステートストアを共有し、同じデータソースを更新します。

## エンドポイント

- `POST /admin/books`
- `GET /admin/books/:bookId`
- `PUT /admin/books/:bookId`
- `DELETE /admin/books/:bookId`
- `POST /admin/books/:bookId/publish`

OpenAPI 定義は `../../contracts/admin.openapi.yaml` を参照してください。

## ローカル開発

```bash
npm install
npm run dev
```

Dapr 起動例:

```bash
dapr run --app-id admin-service --app-port 4104 \
  --components-path ../../dapr/components -- npm run dev
```
