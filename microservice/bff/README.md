# Bookstore BFF

モノリスから分割したサービス群への入口となる Backend for Frontend の試作環境です。

## セットアップ

```bash
npm install
npm run dev
```

`.env` にサービスのエンドポイントを設定すると、BFF が各マイクロサービスへ
リクエストをプロキシします。

| 変数 | デフォルト | 説明 |
| --- | --- | --- |
| `PORT` | 4000 | BFF の待ち受けポート |
| `CATALOG_SERVICE_URL` | http://localhost:4101 | Catalog Service upstream |
| `CART_SERVICE_URL` | http://localhost:4102 | Cart Service upstream |
| `ORDER_SERVICE_URL` | http://localhost:4103 | Order Service upstream |
| `ADMIN_SERVICE_URL` | http://localhost:4104 | Admin Service upstream |

## 提供ルート

| BFF ルート | 転送先 |
| --- | --- |
| `/catalog/*` | `CATALOG_SERVICE_URL` |
| `/cart/*` | `CART_SERVICE_URL` |
| `/order/*` | `ORDER_SERVICE_URL` |
| `/admin/*` | `ADMIN_SERVICE_URL` |
|

`/healthz` でヘルスチェックが可能です。
