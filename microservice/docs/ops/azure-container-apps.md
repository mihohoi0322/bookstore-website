---
post_title: "Azure Container Apps 配備ガイド (Dapr 対応)"
author1: "miho"
tags:
  - azure
  - container-apps
  - deployment
  - dapr
ai_note: true
summary: "Azure Container Apps で bookstore マイクロサービス群を稼働させるための手順と推奨設定を整理する。"
post_date: 2025-11-04
---

## 参考資料

- [クイックスタート: Azure CLI を使用して Dapr アプリケーションを Azure Container Apps にデプロイする](https://learn.microsoft.com/ja-jp/azure/container-apps/microservices-dapr?source=recommendations&tabs=bash)
- [Dapr Azure Blob Storage コンポーネント仕様](https://docs.dapr.io/reference/components-reference/supported-state-stores/setup-azure-blobstorage/)
- [Dapr Azure Service Bus Topics コンポーネント仕様](https://docs.dapr.io/reference/components-reference/supported-pubsub/setup-azure-servicebus-topics/)

## コンテナイメージのビルドとプッシュ

| サービス | Dockerfile | 既定ポート | ビルド例 |
| --- | --- | --- | --- |
| Frontend (Vite) | `microservice/Dockerfile` | 80 | `docker build -f microservice/Dockerfile -t <REGISTRY>/bookstore-frontend:latest .` |
| BFF | `microservice/bff/Dockerfile` | 4000 | `docker build -f microservice/bff/Dockerfile -t <REGISTRY>/bookstore-bff:latest .` |
| Catalog Service | `microservice/services/catalog/Dockerfile` | 4101 | `docker build -f microservice/services/catalog/Dockerfile -t <REGISTRY>/catalog-service:latest .` |
| Cart Service | `microservice/services/cart/Dockerfile` | 4102 | `docker build -f microservice/services/cart/Dockerfile -t <REGISTRY>/cart-service:latest .` |
| Order Service | `microservice/services/order/Dockerfile` | 4103 | `docker build -f microservice/services/order/Dockerfile -t <REGISTRY>/order-service:latest .` |
| Admin Service | `microservice/services/admin/Dockerfile` | 4104 | `docker build -f microservice/services/admin/Dockerfile -t <REGISTRY>/admin-service:latest .` |

1. Azure Container Registry などにログイン: `az acr login --name <REGISTRY_NAME>`
2. 上記コマンドで各イメージをビルド。
3. `docker push <REGISTRY>/<IMAGE>:<TAG>` で全イメージをプッシュ。

## Azure リソースの初期化

以下の変数を設定しておくとスクリプトが扱いやすい。

```bash
export RESOURCE_GROUP="rg-bookstore"
export LOCATION="japaneast"
export LOG_ANALYTICS_WORKSPACE="law-bookstore"
export CONTAINERAPPS_ENVIRONMENT="cae-bookstore"
export STORAGE_ACCOUNT_NAME="bookstorestate"
export SERVICE_BUS_NAMESPACE="bookstore-sb"
export MANAGED_IDENTITY_NAME="bookstore-managed-id"
```

1. Azure CLI へサインインし、拡張機能を更新。
   ```bash
   az login
   az upgrade
   az extension add --name containerapp --upgrade --allow-preview true
   az provider register --namespace Microsoft.App
   az provider register --namespace Microsoft.OperationalInsights
   ```
2. リソースグループと Log Analytics ワークスペースを作成。
   ```bash
   az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
   az monitor log-analytics workspace create \
     --resource-group "$RESOURCE_GROUP" \
     --workspace-name "$LOG_ANALYTICS_WORKSPACE"
   ```
3. Container Apps 環境を作成。
   ```bash
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
4. Azure Storage アカウントとコンテナー (catalogstore/cartstore/orderstore) を作成。
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
   ```
5. Azure Service Bus 名前空間とトピックを作成。
   ```bash
   az servicebus namespace create \
     --resource-group "$RESOURCE_GROUP" \
     --name "$SERVICE_BUS_NAMESPACE" \
     --location "$LOCATION"

   az servicebus topic create \
     --resource-group "$RESOURCE_GROUP" \
     --namespace-name "$SERVICE_BUS_NAMESPACE" \
     --name orders
   ```
6. ユーザー割り当てマネージド ID を作成し、必要なロールを付与。
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

## Dapr コンポーネントの登録

`microservice/dapr/azure/` に配置したテンプレートを Azure Container Apps 環境へ登録する。

```bash
for component in catalogstore cartstore orderstore bookstore-pubsub; do
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

> `microservice/dapr/azure/*.yaml` 内の `<STORAGE_ACCOUNT_NAME>` / `<AZURE_TENANT_ID>` / `<MANAGED_IDENTITY_CLIENT_ID>` / `<SERVICE_BUS_NAMESPACE>` は実際の値に書き換えてから適用すること。

## Container Apps の作成

1. 事前にコンテナレジストリをシークレットとして登録。
   ```bash
   az containerapp registry set \
     --name "$CONTAINERAPPS_ENVIRONMENT" \
     --resource-group "$RESOURCE_GROUP" \
     --server <REGISTRY_SERVER> \
     --username <REGISTRY_USERNAME> \
     --password <REGISTRY_PASSWORD>
   ```
2. 共通で利用する環境変数と Dapr 設定。
   - `USE_IN_MEMORY_DAPR=false`
   - 必要に応じて `CATALOG_SERVICE_URL` などの直アクセス URL を設定（BFF の Dapr プロキシ無効化時）。

3. サービス作成例（catalog-service）。
   ```bash
   az containerapp create \
     --name catalog-service \
     --resource-group "$RESOURCE_GROUP" \
     --environment "$CONTAINERAPPS_ENVIRONMENT" \
     --image <REGISTRY>/catalog-service:latest \
     --target-port 4101 \
     --ingress internal \
     --min-replicas 1 --max-replicas 3 \
     --enable-dapr \
     --dapr-app-id catalog-service \
     --dapr-app-port 4101 \
     --set-env-vars "USE_IN_MEMORY_DAPR=false" \
     --user-assigned $IDENTITY_RESOURCE_ID
   ```
4. Cart/Order/Admin も同様に `--name` / `--image` / ポートを変更して作成。
5. BFF は外部公開とし、バックエンドサービス URL を環境変数で指定。
   ```bash
   az containerapp create \
     --name bookstore-bff \
     --resource-group "$RESOURCE_GROUP" \
     --environment "$CONTAINERAPPS_ENVIRONMENT" \
     --image <REGISTRY>/bookstore-bff:latest \
     --target-port 4000 \
     --ingress external \
     --min-replicas 1 --max-replicas 3 \
     --revision-suffix bff \
     --set-env-vars \
       "USE_DAPR_PROXY=true" \
       "DAPR_HTTP_HOST=http://127.0.0.1" \
       "DAPR_HTTP_PORT=3500" \
     --enable-dapr \
     --dapr-app-id bookstore-bff \
     --dapr-app-port 4000 \
     --user-assigned $IDENTITY_RESOURCE_ID
   ```
6. フロントエンドは静的サイトとして別途 Azure Static Web Apps もしくは Container Apps で配備可能。Container Apps でホストする場合は `microservice/Dockerfile` を利用し `--ingress external` かつリバースプロキシ設定を行う。

## 検証

1. `az containerapp ingress show` で BFF の FQDN を取得し、 `/healthz` にアクセス。
2. `az containerapp logs show --follow --name <APP>` で Dapr サイドカーとアプリのログを確認。
3. Azure Storage のコンテナーに `catalogstore`, `cartstore`, `orderstore` が作成されていることを確認し、Blob が追加されるか検証。
4. Azure Service Bus の `orders` トピックにメッセージが届いているか [Service Bus Explorer](https://learn.microsoft.com/azure/service-bus-messaging/explorer) などで確認。

## 運用メモ

- Dapr コンポーネントを更新した場合、`az containerapp env dapr-component set` を再実行してローリング適用する。
- ステージング/本番でストレージアカウントや Service Bus を分離し、マネージド ID に最小限の RBAC を付与する。
- Azure Monitor によるメトリック/ログ収集を有効化し、アラートを設定することで SLA を担保できる。
- 参照元: Microsoft Learn クイックスタートおよび Dapr 公式ドキュメント。
