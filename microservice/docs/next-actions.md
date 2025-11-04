---
post_title: "フェーズ1次アクション詳細設計"
author1: "miho"
tags:
  - architecture
  - roadmap
  - planning
ai_note: true
summary: "モノリス移行初期フェーズで実施する3つの優先アクションの作業計画と成果物を整理する。"
post_date: 2025-10-31
---

## 目的

`mono_to_micro.md` の「次のアクション」で定義した3項目について、
短期で着手できる具体的なタスク、成果物、関係者を明確にする。
これにより、分割フェーズの立ち上げを円滑に進める。

## アクション全体像

| 優先度 | アクション | 主要成果物 | 完了目標 | 担当候補 |
| --- | --- | --- | --- | --- |
| High | API コントラクト草案と ER 図の作成 | OpenAPI 3.1 定義、Context/ER 図 | 2 週間 | Backend Arch チーム |
| High | BFF 層セットアップと呼び出し調査 | BFF テンプレート、現在の依存マップ | 2 週間 | Frontend + Platform |
| Medium | Catalog Service PoC と移行計画 | PoC 実装、移行ロードマップ | 4 週間 | Backend + Data |

## アクション詳細

### API コントラクト草案と ER 図の作成

- **成果物**
  - Catalog / Cart / Order / Admin 各サービスの OpenAPI 3.1 スキーマ
  - サービス境界を表す Context Diagram
  - 共有データモデル (書籍、在庫、注文) の ER 図
  - 進捗: `microservice/contracts/*.openapi.yaml` と
    `microservice/docs/api-contracts.md` に初版を格納済み
- **最新アップデート (2025-10-31)**
  - OpenAPI を Dapr 対応版へ更新し、`publicationStatus` などドメイン属性を拡充。
- **タスク**
  1. 既存モノリスの API 呼び出しと型定義を棚卸し
  2. サービス間イベントを整理し境界コンテキスト図を作成
  3. OpenAPI をベースに BFF が参照可能な Contract を起草
  4. 定例でステークホルダー合意を得てバージョン 0.1 を確定
- **Dependencies**: 既存フロントエンドの TypeScript 型、データ seed
- **リスクと対策**
  - *リスク*: サービス間データ重複によるスキーマ不整合

- **完了条件**
  - OpenAPI ファイルと ER 図がバージョン管理下でレビュー承認済み
  - Contract テンプレートにユースケース別テスト例が付属

### BFF 層セットアップと既存呼び出し調査

- **成果物**
  - Node.js (Express または Fastify) ベースの BFF スタブ
  - BFF から各サービス API へのルーティングポリシー草案
  - 現状フロントが参照するエンドポイント一覧と依存関係マップ
  - 進捗: `microservice/bff` に Fastify ベースのテンプレート、
    `microservice/docs/bff-analysis.md` に依存マップを記載
- **最新アップデート (2025-10-31)**
  - BFF から Dapr 経由の呼び出しに切り替えるための環境変数ガイドを整備。
- **タスク**
  1. BFF リポジトリ雛形を作成し CI/CD パイプラインを準備
  2. Vite フロントエンド内の fetch/Axios 呼び出しを静的解析
  3. 呼び出し箇所ごとに BFF 経由に変換するための抽象化インターフェース設計
  4. レート制限・キャッシュ方針を含む運用ガイドラインをまとめる
- **Dependencies**: API コントラクト草案、既存フロントのコードベース
- **リスクと対策**
  - *リスク*: BFF 導入でレイテンシが増大
  - *対策*: CDN キャッシュとレスポンス圧縮を早期検証し SLA を維持
- **完了条件**
  - BFF の MVP がコンテナ上で起動し、既存フロント 1 画面で疎通テスト成功
  - 依存関係マップが Confluence 等で共有され最新化

### Catalog Service PoC 実装と移行計画

- **成果物**
  - Catalog Service PoC (REST API + DB 初期スキーマ)
  - 既存モノリスからのデータ移行ステップとロールバック指針
  - 非機能要件 (SLO、スケール目標) の草案
  - 進捗: `microservice/service-catalog` に PoC 実装、
    `microservice/docs/catalog-poc.md` に移行計画を記載
- **最新アップデート (2025-10-31)**
  - PoC を `microservice/services/catalog` にリプレースし、Cart/Order/Admin サービスも実装。
  - `microservice/docs/microservices-architecture.md` に Dapr ベースの分割構成を追記。
- **タスク**
  1. NestJS もしくは FastAPI で PoC を構築し CI で自動テスト化
  2. データ移行スクリプトを作成し、ステージングで差分検証
  3. BFF 経由で Catalog API を実際に呼び出す E2E テストを整備
  4. ロールアウト計画 (カナリアリリース、切り戻し条件) を定義
- **Dependencies**: API コントラクト、BFF スタブ、データチームのスキーマ
- **リスクと対策**
  - *リスク*: データ整合性が崩れ在庫表示が不一致になる
  - *対策*: 並行稼働期間を設け、ポーリング比較 + アラートを導入
- **完了条件**
  - PoC が本番相当のデータ量でパフォーマンステストを通過
  - 移行 Runbook とロールバック手順がレビュー完了

## マイルストーンとタイムライン

| 週 | マイルストーン | 関係アクション |
| --- | --- | --- |
| W1 | API インタビュー完了、現状調査ドキュメント共有 | API コントラクト、BFF |
| W2 | OpenAPI v0.1 と BFF 雛形リポジトリをレビュー合格 | API コントラクト、BFF |
| W3 | Catalog PoC がステージングで疎通、移行ドラフト提出 | Catalog PoC |
| W4 | 3 アクションすべての完了条件達成、次フェーズ計画策定 | 全体 |

## トラッキング方法

- タスク管理: Jira で Epic "Monolith to Micro - Phase1" を作成し上記タスクを
  Issue 化。
- ステータス共有: 週次で 15 分のスタンドアップを実施し、リスクと
  ブロッカーを速やかに解消。
- メトリクス: スクラムボードの進捗 (Burn Down)、API 契約レビュー通過数、
  PoC のパフォーマンス指標 (P95 レイテンシ < 200ms) を可視化。

## 参照

- [モノリスからマイクロサービスへの最小分割案](../mono_to_micro.md)
  - 分割ポリシーとマクロなステップの全体像を記載。
