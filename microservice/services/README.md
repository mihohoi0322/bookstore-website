# Microservice Suite

`microservice/services` ディレクトリには、カタログ、カート、注文、管理の各機能を分割した Fastify ベースのサービス群が含まれます。Dapr を利用してサービス間通信とステート管理を統一しています。

## サービス一覧

| サービス | ポート | Dapr App ID | 主な役割 |
| --- | --- | --- | --- |
| catalog-service | 4101 | `catalog-service` | 書籍カタログ API |
| cart-service | 4102 | `cart-service` | ショッピングカート管理 |
| order-service | 4103 | `order-service` | 注文作成・ステータス管理 |
| admin-service | 4104 | `admin-service` | 管理用の書籍 CRUD |

## 起動手順

1. 各ディレクトリで依存関係をインストールします。
2. Dapr を利用する場合は `microservice/dapr/components` を指定して `dapr run` を実行します。
3. BFF (`microservice/bff`) からは `http://localhost:410x` または Dapr 経由 (`http://localhost:3500/v1.0/invoke/...`) で呼び出せます。

例: カタログとカートを同時に起動する

```bash
(cd catalog && npm install && dapr run --app-id catalog-service --app-port 4101 --components-path ../../dapr/components -- npm run dev)
(cd cart && npm install && dapr run --app-id cart-service --app-port 4102 --components-path ../../dapr/components -- npm run dev)
```

## テスト

各サービスは Vitest ベースの単体テストを備えています。

```bash
npm test
```

Dapr をモックするために `USE_IN_MEMORY_DAPR=true` が自動的に設定されるため、ローカルで Dapr を起動していなくてもテストを実行できます。
