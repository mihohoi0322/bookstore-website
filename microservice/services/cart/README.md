# Cart Service

ユーザーごとのショッピングカート管理を担当するサービスです。Dapr のステートストアを利用してカートデータを永続化し、書籍情報はカタログサービス経由で取得します。

## エンドポイント

- `GET /cart/carts/:userId`
- `PUT /cart/carts/:userId`
- `POST /cart/carts/:userId/items`
- `PATCH /cart/carts/:userId/items/:bookId`
- `DELETE /cart/carts/:userId`
- `DELETE /cart/carts/:userId/items/:bookId`

OpenAPI 定義は `../../contracts/cart.openapi.yaml` を参照してください。

## ローカル開発

```bash
npm install
npm run dev
```

Dapr と組み合わせる場合の起動例:

```bash
dapr run --app-id cart-service --app-port 4102 \
  --components-path ../../dapr/components -- npm run dev
```
