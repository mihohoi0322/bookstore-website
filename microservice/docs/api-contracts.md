---
post_title: "API コントラクト草案と ER 図"
author1: "miho"
tags:
  - architecture
  - api
  - design
ai_note: true
summary: "フェーズ1の対象サービスについて API コントラクトと ER 図の初期案をまとめる。"
post_date: 2025-10-31
---

## 目的

Catalog / Cart / Order / Admin サービスの初期 API コントラクトとデータ境界を
可視化し、BFF や他サービスとの契約を明文化する。

## 提供物

- OpenAPI 3.1 スキーマ: `microservice/contracts/*.openapi.yaml`
- コンテキスト図 (サービス間連携)
- エンティティ関係図 (主要データモデル)

## コンテキスト図

```mermaid
flowchart LR
    FE["Web Frontend"] -->|"https"| BFF["BFF"]
    BFF -->|"GET /books"| Catalog["Catalog Service"]
    BFF -->|"/carts"| Cart["Cart Service"]
    BFF -->|"/orders"| OrderSvc["Order Service"]
    BFF -->|"/admin/books"| AdminSvc["Admin Service"]
    OrderSvc -->|"OrderCreated"| EventBus["Event Bus"]
    AdminSvc -->|"PublishEvent"| EventBus
    Catalog -->|"Read Replica"| CatalogDB[("Catalog DB")]
    Cart -->|"Session"| CartStore[("Cart Store")]
    OrderSvc -->|"Transactions"| OrderDB[("Order DB")]
```

## エンティティ関係図

```mermaid
erDiagram
    BOOK ||--o{ CART_ITEM : contains
    CART ||--o{ CART_ITEM : has
    BOOK ||--o{ ORDER_ITEM : listed_in
    ORDER ||--o{ ORDER_ITEM : includes
    ORDER ||--|| PAYMENT : uses
    ORDER ||--|| SHIPPING_ADDRESS : ships_to

    BOOK {
        string id
        string title
        string author
        number price
        string status
        int publicationYear
    }
    CART {
        string userId
        float totalAmount
    }
    CART_ITEM {
        string bookId
        int quantity
    }
    ORDER {
        string id
        string userId
        float totalAmount
        string status
        datetime createdAt
    }
    ORDER_ITEM {
        string bookId
        int quantity
        float unitPrice
    }
    PAYMENT {
        string method
        string status
        string cardLast4
    }
    SHIPPING_ADDRESS {
        string postalCode
        string prefecture
        string city
        string line1
        string line2
    }
```

## オープン課題

- 決済トークン仕様とキャプチャタイミングは外部 PSP と要調整
- 管理 API の認可モデル (RBAC / ABAC) は別途セキュリティチームと合意が必要
- カタログタグのマスタ管理方式 (静的テーブル vs 管理 API) を検討中
