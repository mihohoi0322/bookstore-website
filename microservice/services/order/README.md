# Order Service

注文作成とステータス管理を担うサービスです。Dapr のステートストアで注文情報を保存し、`bookstore-pubsub` 経由で注文イベントを発行します。

## エンドポイント

- `POST /order/orders`
- `GET /order/orders/:orderId`
- `PATCH /order/orders/:orderId/status`

OpenAPI 定義は `../../contracts/order.openapi.yaml` を参照してください。

## ローカル開発

```bash
npm install
npm run dev
```

Dapr を使った起動例:

```bash
dapr run --app-id order-service --app-port 4103 \
  --components-path ../../dapr/components -- npm run dev
```
