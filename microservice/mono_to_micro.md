---
post_title: "モノリスからマイクロサービスへの最小分割案"
author1: "miho"
tags:
	- architecture
	- microservices
	- roadmap
ai_note: true
summary: "書籍ECモノリスを最小構成のマイクロサービスへ移行する際の境界案。"
post_date: 2025-10-31
---

## 背景

現在のモノリシックなフロントエンドは、書籍カタログの表示、カート管理、
注文確定、在庫・コンテンツ編集といった複数の責務を単一コードベースで
担っている。機能追加のたびにデプロイ範囲が広がり、障害時の影響範囲も
大きい。そこでまずはドメイン境界を整理し、最小構成で分割すべき
マイクロサービスを定義する。

## 分割ポリシー

- ドメイン境界で責務を切り出し、データの一貫性が強く求められる単位で
	分離する。
- フロントエンドは BFF (Backend for Frontend) もしくは API Gateway を
	介して複数サービスを統合する。
- MVP では 1 サービス 1 コンテナーを基本とし、スタート時点では同一
	クラスタ内に配置する。
- まずは更新頻度とスケール要件が異なる領域から段階的に分割する。

## サービス候補一覧

| サービス名 | 目的 | 主な API (例) | データストア |
| --- | --- | --- | --- |
| Catalog Service | 書籍メタ情報の提供 | GET /books, GET /books/{id} | PostgreSQL (read) |
| Cart Service | ユーザー別カート状態の管理 | GET/POST /carts/{userId} | Redis もしくは Doc DB |
| Order Service | 注文確定と決済フロー管理 | POST /orders, GET /orders/{id} | PostgreSQL + 決済連携 |
| Content/Admin Service | 書籍登録・在庫・公開状態の編集 | CRUD /admin/books | PostgreSQL (共有) |
| Recommendation Service (後続) | 閲覧履歴に基づくレコメンド | GET /recommendations | 専用データストア (後続) |

※ Catalog と Admin は同一データベースを共有するが、公開 API と管理 API を
別プロセスとすることでセキュリティ境界を明確化する。

## 段階的移行ステップ

1. 既存モノリスの API 呼び出しを抽象化し、BFF 層を追加して将来のサービス
	 分割に備える。
2. Catalog Service を独立させ、フロントエンドからの書籍取得を新 API に
	 差し替える。
3. Cart Service を切り出し、セッションストレージ依存から永続化ストアへ
	 移行する。
4. Order Service を導入し、チェックアウトと注文生成ロジックを移行する。
5. Admin Service を分離し、管理 UI 専用の認証・権限制御を実装する。
6. 後続で Recommendation や通知などの補助サービスを段階的に追加する。

## 共通基盤とクロスカッティング

- API Gateway / BFF: OpenAPI で契約を定義し、フロントエンドは BFF 経由で
	サービスにアクセスする。
- 認証・認可: 共通の Identity Provider を利用し、サービス間では JWT の
	検証でゼロトラストを徹底する。
- オブザーバビリティ: OpenTelemetry による分散トレーシングと集中ログを
	早期に導入し、段階的な分割でも可視性を確保する。
- データ同期: サービス間の整合性はイベント駆動 (例: Order -> Inventory)
	を採用し、同期 API 呼び出しは最小限に抑える。

## 次のアクション

- 各サービスの API コントラクト草案と ER 図の作成。
- BFF 層のセットアップと既存フロントからの呼び出し調査。
- Catalog Service の PoC 実装と、既存データソースからの移行計画策定。
- Dapr を活用した本実装は `microservice/services` 配下に展開し、詳細は
	`docs/microservices-architecture.md` を参照。
