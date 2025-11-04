---
post_title: "Microservice Services ガイド"
author1: "miho"
tags:
	- services
	- microservices
	- azure
	- container-apps
ai_note: true
summary: "書籍ストアのマイクロサービス群の概要、ローカル実行、およびAzure Container Appsへのデプロイ手順をまとめる。"
post_date: 2025-11-04
---

## Microservice Suite

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

## Azure Container Apps デプロイ手順

Azure Container Apps (ACA) 上で Dapr 連携付きで動作させる場合の流れです。詳細は `docs/ops/azure-container-apps.md` を参照してください。

1. **コンテナイメージのビルドとプッシュ**
	- 各サービス／BFF／フロントエンドの Dockerfile を利用してイメージをビルド。
	- `az acr login` 後に ACR などへ `docker push <REGISTRY>/<IMAGE>:<TAG>` します。

2. **Azure リソースの作成**
	- リソースグループ、Log Analytics、Container Apps 環境を作成。
	- Blob Storage とコンテナー（`catalogstore`, `cartstore`, `orderstore`）を用意。
	- Service Bus 名前空間と `orders` トピックを作成。
	- ユーザー割り当てマネージド ID を作り、Storage と Service Bus へ RBAC を付与。

3. **Dapr コンポーネント登録**
	- `microservice/dapr/azure/*.yaml` のプレースホルダーを実値に置換。
	- `az containerapp env dapr-component set` で state store と pub/sub を Container Apps 環境に登録。

4. **Container App 展開**
	- 各マイクロサービスは内部公開 (`--ingress internal`) で作成し、`--enable-dapr` と `--dapr-app-id` を設定。
	- 環境変数 `USE_IN_MEMORY_DAPR=false` と各サービス向けの URL／ポート (`CATALOG_SERVICE_URL=http://catalog-service:4101` など) を指定。
	- BFF は外部公開 (`--ingress external`) にし、Dapr 経由でバックエンドを呼び出す設定を付与。
	- 必要に応じてフロントエンドを ACA もしくは Static Web Apps へ配信。

5. **検証と運用**
	- `az containerapp ingress show` で公開 URL を取得し、`/healthz` などを確認。
	- `az containerapp logs show --follow` でアプリ／Dapr ログを監視。
	- Storage Blob と Service Bus のメッセージ着信を確認して動作を検証。

## テスト

各サービスは Vitest ベースの単体テストを備えています。

```bash
npm test
```

Dapr をモックするために `USE_IN_MEMORY_DAPR=true` が自動的に設定されるため、ローカルで Dapr を起動していなくてもテストを実行できます。
