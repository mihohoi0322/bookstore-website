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
> **Memo:** GitHub Container Registry (ghcr.io) を利用する場合は `REGISTRY_SERVER=ghcr.io`、`REGISTRY_USERNAME=<GitHubユーザー名>`、`REGISTRY_PASSWORD=<write:packages/read:packages 権限を持つ PAT>` を指定してください。

3. BFF (`microservice/bff`) からは `http://localhost:410x` または Dapr 経由 (`http://localhost:3500/v1.0/invoke/...`) で呼び出せます。

例: カタログとカートを同時に起動する

```bash
(cd catalog && npm install && dapr run --app-id catalog-service --app-port 4101 --components-path ../../dapr/components -- npm run dev)
(cd cart && npm install && dapr run --app-id cart-service --app-port 4102 --components-path ../../dapr/components -- npm run dev)
```

## Azure Container Apps デプロイ手順

Microsoft Learn の[クイックスタート](https://learn.microsoft.com/ja-jp/azure/container-apps/microservices-dapr?tabs=bash) と同等の粒度で、書籍ストアのマイクロサービスを Azure Container Apps (ACA) + Dapr 上に展開するためのコマンド群です。詳細な解説やトラブルシューティングは `docs/ops/azure-container-apps.md` を参照してください。

### 前提条件

- Azure CLI 2.59 以降（`az version` で確認）
- Docker とコンテナレジストリ（Azure Container Registry を推奨）
- リポジトリの Dockerfile／Dapr コンポーネント定義をチェックアウト済み

```bash
az login
az upgrade
az extension add --name containerapp --upgrade --allow-preview true
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```

### 環境変数の定義

以降の手順で共通的に利用する値をエクスポートします。必要に応じて命名規則やロケーションを変更してください。

```bash
export RESOURCE_GROUP="rg-bookstore"
export LOCATION="japaneast"
export CONTAINERAPPS_ENVIRONMENT="cae-bookstore"
export LOG_ANALYTICS_WORKSPACE="law-bookstore"
export STORAGE_ACCOUNT_NAME="bookstorestate"
export SERVICE_BUS_NAMESPACE="bookstore-sb"
export REGISTRY_SERVER="<REGISTRY_NAME>.azurecr.io"
export REGISTRY_USERNAME="<ACR_USERNAME>"
export REGISTRY_PASSWORD="<ACR_PASSWORD>"
export MANAGED_IDENTITY_NAME="bookstore-managed-id"
```

> **Memo:** GitHub Container Registry (ghcr.io) を利用する場合は `REGISTRY_SERVER=ghcr.io`、`REGISTRY_USERNAME=<GitHubユーザー名>`、`REGISTRY_PASSWORD=<write:packages/read:packages 権限を持つ PAT>` を指定してください。

ビルド済みイメージを識別するためのタグも変数化しておくと便利です。

```bash
export TAG="2025-11-04"
export IMG_FRONTEND="$REGISTRY_SERVER/bookstore-frontend:$TAG"
export IMG_BFF="$REGISTRY_SERVER/bookstore-bff:$TAG"
export IMG_CATALOG="$REGISTRY_SERVER/catalog-service:$TAG"
export IMG_CART="$REGISTRY_SERVER/cart-service:$TAG"
export IMG_ORDER="$REGISTRY_SERVER/order-service:$TAG"
export IMG_ADMIN="$REGISTRY_SERVER/admin-service:$TAG"
```

### コンテナイメージのビルドとプッシュ

1. レジストリにログインします。
	- **Azure Container Registry** の場合

		```bash
		az acr login --name "${REGISTRY_SERVER%%.azurecr.io}"
		```

	- **GitHub Container Registry (ghcr.io)** の場合

		```bash
		export GITHUB_PAT="<YOUR_GHCR_PAT>"
		echo "$GITHUB_PAT" | docker login ghcr.io -u "$REGISTRY_USERNAME" --password-stdin
		```

2. 各イメージをビルドしてプッシュします。

	```bash
	docker build -t "$IMG_CATALOG" microservice/services/catalog
	docker push "$IMG_CATALOG"

	docker build -t "$IMG_CART" microservice/services/cart
	docker push "$IMG_CART"

	docker build -t "$IMG_ORDER" microservice/services/order
	docker push "$IMG_ORDER"

	docker build -t "$IMG_ADMIN" microservice/services/admin
	docker push "$IMG_ADMIN"

	docker build -t "$IMG_BFF" microservice/bff
	docker push "$IMG_BFF"

	docker build -t "$IMG_FRONTEND" microservice
	docker push "$IMG_FRONTEND"
	```

### Azure リソースの作成

```bash
az group create \
	--name "$RESOURCE_GROUP" \
	--location "$LOCATION"

az monitor log-analytics workspace create \
	--resource-group "$RESOURCE_GROUP" \
	--workspace-name "$LOG_ANALYTICS_WORKSPACE"

LOG_ANALYTICS_ID=$(az monitor log-analytics workspace show \
	--resource-group "$RESOURCE_GROUP" \
	--workspace-name "$LOG_ANALYTICS_WORKSPACE" \
	--query id --output tsv)

LOG_ANALYTICS_KEY=$(az monitor log-analytics workspace get-shared-keys \
	--resource-group "$RESOURCE_GROUP" \
	--workspace-name "$LOG_ANALYTICS_WORKSPACE" \
	--query primarySharedKey --output tsv)

az containerapp env create \
	--name "$CONTAINERAPPS_ENVIRONMENT" \
	--resource-group "$RESOURCE_GROUP" \
	--location "$LOCATION" \
	--logs-workspace-id "$LOG_ANALYTICS_ID" \
	--logs-workspace-key "$LOG_ANALYTICS_KEY"
```

### ステートストアとメッセージングの準備

```bash
az storage account create \
	--name "$STORAGE_ACCOUNT_NAME" \
	--resource-group "$RESOURCE_GROUP" \
	--location "$LOCATION" \
	--sku Standard_RAGRS \
	--kind StorageV2

for container in catalogstore cartstore orderstore; do
	az storage container create \
		--name "$container" \
		--account-name "$STORAGE_ACCOUNT_NAME"
done

az servicebus namespace create \
	--name "$SERVICE_BUS_NAMESPACE" \
	--resource-group "$RESOURCE_GROUP" \
	--location "$LOCATION"

az servicebus topic create \
	--resource-group "$RESOURCE_GROUP" \
	--namespace-name "$SERVICE_BUS_NAMESPACE" \
	--name orders
```

### マネージド ID と RBAC の割り当て

```bash
az identity create \
	--resource-group "$RESOURCE_GROUP" \
	--name "$MANAGED_IDENTITY_NAME"

IDENTITY_CLIENT_ID=$(az identity show \
	--resource-group "$RESOURCE_GROUP" \
	--name "$MANAGED_IDENTITY_NAME" \
	--query clientId --output tsv)

IDENTITY_RESOURCE_ID=$(az identity show \
	--resource-group "$RESOURCE_GROUP" \
	--name "$MANAGED_IDENTITY_NAME" \
	--query id --output tsv)

SUBSCRIPTION_ID=$(az account show --query id --output tsv)

az role assignment create \
	--assignee "$IDENTITY_CLIENT_ID" \
	--role "Storage Blob Data Contributor" \
	--scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Storage/storageAccounts/$STORAGE_ACCOUNT_NAME"

az role assignment create \
	--assignee "$IDENTITY_CLIENT_ID" \
	--role "Azure Service Bus Data Owner" \
	--scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.ServiceBus/namespaces/$SERVICE_BUS_NAMESPACE"
```

### Dapr コンポーネントの登録

`microservice/dapr/azure/*.yaml` にあるプレースホルダー（`<STORAGE_ACCOUNT_NAME>` など）を実環境の値へ置き換えたうえで、次のコマンドでコンポーネントを設定します。

```bash
for component in catalogstore cartstore orderstore; do
	az containerapp env dapr-component set \
		--name "$CONTAINERAPPS_ENVIRONMENT" \
		--resource-group "$RESOURCE_GROUP" \
		--dapr-component-name "$component" \
		--yaml microservice/dapr/azure/${component}.blob.yaml
done

az containerapp env dapr-component set \
	--name "$CONTAINERAPPS_ENVIRONMENT" \
	--resource-group "$RESOURCE_GROUP" \
	--dapr-component-name bookstore-pubsub \
	--yaml microservice/dapr/azure/bookstore-pubsub.servicebus.yaml
```

### コンテナーアプリの作成

各サービスを内部向けに、BFF を外部向けに展開します。Dapr を利用しないフロントエンドは必要に応じて別のホスティング（Azure Static Web Apps など）へ配置するか、Container Apps 上で公開してください。

```bash
# Catalog Service
az containerapp create \
	--name catalog-service \
	--resource-group "$RESOURCE_GROUP" \
	--environment "$CONTAINERAPPS_ENVIRONMENT" \
	--image "$IMG_CATALOG" \
	--ingress internal \
	--target-port 4101 \
	--enable-dapr \
	--dapr-app-id catalog-service \
	--dapr-app-port 4101 \
	--min-replicas 1 --max-replicas 3 \
	--registry-server "$REGISTRY_SERVER" \
	--registry-username "$REGISTRY_USERNAME" \
	--registry-password "$REGISTRY_PASSWORD" \
	--set-env-vars USE_IN_MEMORY_DAPR=false \
			CATALOG_STATE_STORE=catalogstore \
			CATALOG_SERVICE_URL=http://catalog-service:4101 \
	--user-assigned "$IDENTITY_RESOURCE_ID"

# Cart Service
az containerapp create \
	--name cart-service \
	--resource-group "$RESOURCE_GROUP" \
	--environment "$CONTAINERAPPS_ENVIRONMENT" \
	--image "$IMG_CART" \
	--ingress internal \
	--target-port 4102 \
	--enable-dapr \
	--dapr-app-id cart-service \
	--dapr-app-port 4102 \
	--min-replicas 1 --max-replicas 3 \
	--registry-server "$REGISTRY_SERVER" \
	--registry-username "$REGISTRY_USERNAME" \
	--registry-password "$REGISTRY_PASSWORD" \
	--set-env-vars USE_IN_MEMORY_DAPR=false \
			CATALOG_SERVICE_URL=http://catalog-service:4101 \
			CART_STATE_STORE=cartstore \
	--user-assigned "$IDENTITY_RESOURCE_ID"

# Order Service
az containerapp create \
	--name order-service \
	--resource-group "$RESOURCE_GROUP" \
	--environment "$CONTAINERAPPS_ENVIRONMENT" \
	--image "$IMG_ORDER" \
	--ingress internal \
	--target-port 4103 \
	--enable-dapr \
	--dapr-app-id order-service \
	--dapr-app-port 4103 \
	--min-replicas 1 --max-replicas 3 \
	--registry-server "$REGISTRY_SERVER" \
	--registry-username "$REGISTRY_USERNAME" \
	--registry-password "$REGISTRY_PASSWORD" \
	--set-env-vars USE_IN_MEMORY_DAPR=false \
			CATALOG_SERVICE_URL=http://catalog-service:4101 \
			ORDER_STATE_STORE=orderstore \
			ORDER_PUBSUB_NAME=bookstore-pubsub \
	--user-assigned "$IDENTITY_RESOURCE_ID"

# Admin Service
az containerapp create \
	--name admin-service \
	--resource-group "$RESOURCE_GROUP" \
	--environment "$CONTAINERAPPS_ENVIRONMENT" \
	--image "$IMG_ADMIN" \
	--ingress internal \
	--target-port 4104 \
	--enable-dapr \
	--dapr-app-id admin-service \
	--dapr-app-port 4104 \
	--min-replicas 1 --max-replicas 3 \
	--registry-server "$REGISTRY_SERVER" \
	--registry-username "$REGISTRY_USERNAME" \
	--registry-password "$REGISTRY_PASSWORD" \
	--set-env-vars USE_IN_MEMORY_DAPR=false \
			CATALOG_STATE_STORE=catalogstore \
			CATALOG_SERVICE_URL=http://catalog-service:4101 \
	--user-assigned "$IDENTITY_RESOURCE_ID"

# BFF (外部公開)
az containerapp create \
	--name bookstore-bff \
	--resource-group "$RESOURCE_GROUP" \
	--environment "$CONTAINERAPPS_ENVIRONMENT" \
	--image "$IMG_BFF" \
	--ingress external \
	--target-port 4000 \
	--min-replicas 1 --max-replicas 3 \
	--enable-dapr \
	--dapr-app-id bookstore-bff \
	--dapr-app-port 4000 \
	--revision-suffix bff \
	--registry-server "$REGISTRY_SERVER" \
	--registry-username "$REGISTRY_USERNAME" \
	--registry-password "$REGISTRY_PASSWORD" \
	--set-env-vars USE_IN_MEMORY_DAPR=false \
			USE_DAPR_PROXY=true \
			DAPR_HTTP_HOST=http://127.0.0.1 \
			DAPR_HTTP_PORT=3500 \
	--user-assigned "$IDENTITY_RESOURCE_ID"
```

フロントエンドを Container Apps で配信する場合は、以下のように Nginx イメージを外部公開します。

```bash
az containerapp create \
	--name bookstore-frontend \
	--resource-group "$RESOURCE_GROUP" \
	--environment "$CONTAINERAPPS_ENVIRONMENT" \
	--image "$IMG_FRONTEND" \
	--ingress external \
	--target-port 80 \
	--min-replicas 1 --max-replicas 3
```

### 動作確認と運用

```bash
# 外部 FQDN 確認
az containerapp show \
	--name bookstore-bff \
	--resource-group "$RESOURCE_GROUP" \
	--query properties.configuration.ingress.fqdn --output tsv

# ヘルスチェック
curl https://<BFF_FQDN>/healthz

# ライブログ
az containerapp logs show \
	--name bookstore-bff \
	--resource-group "$RESOURCE_GROUP" \
	--follow

# Dapr サイドカー含む詳細ログを Log Analytics で検索
LOG_ANALYTICS_CUSTOMER_ID=$(az containerapp env show \
	--name "$CONTAINERAPPS_ENVIRONMENT" \
	--resource-group "$RESOURCE_GROUP" \
	--query properties.appLogsConfiguration.logAnalyticsConfiguration.customerId \
	--output tsv)

az monitor log-analytics query \
	--workspace "$LOG_ANALYTICS_CUSTOMER_ID" \
	--analytics-query "ContainerAppConsoleLogs_CL | where ContainerAppName_s == 'bookstore-bff' | take 50" \
	--output table
```

リソースを削除する場合は、次のコマンドでリソースグループごとクリーンアップできます。

```bash
az group delete --name "$RESOURCE_GROUP"
```

## テスト

各サービスは Vitest ベースの単体テストを備えています。

```bash
npm test
```

Dapr をモックするために `USE_IN_MEMORY_DAPR=true` が自動的に設定されるため、ローカルで Dapr を起動していなくてもテストを実行できます。
