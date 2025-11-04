---
post_title: "Catalog Service PoC と移行計画"
author1: "miho"
tags:
  - architecture
  - backend
  - migration
ai_note: true
summary: "Catalog Service の PoC 実装概要と、モノリスからのデータ移行ステップおよびロールバック方針を整理する。"
post_date: 2025-10-31
---

## PoC 実装概要

- 実装場所: `microservice/services/catalog`
- スタック: Fastify + TypeScript + (PoCでは in-memory リポジトリ)
- エンドポイント:
  - `GET /catalog/books` (クエリ: `tag`, `status`, `q`)
  - `GET /catalog/books/{bookId}`
- スキーマ: OpenAPI 定義 `microservice/contracts/catalog.openapi.yaml`
- 動作確認:
  1. `npm install`
  2. `npm run dev`
  3. `curl http://localhost:4101/catalog/books`

## 移行ロードマップ

| フェーズ | 目的 | 主タスク | 完了条件 |
| --- | --- | --- | --- |
| P0 | PoC 検証 | in-memory データでAPI疎通を確認 | BFF 経由でレスポンス取得 |
| P1 | データ永続化 | Drizzle + PostgreSQL 接続設定、マイグレーション追加 | ステージングで R/W テスト通過 |
| P2 | 移行リハーサル | モノリスからエクスポートしたデータをインポートし差分検証 | 並行稼働中に差分ゼロを確認 |
| P3 | 本番切替 | BFF を新APIへスイッチし監視導入 | SLA 内で 72h 安定稼働 |

## データ移行手順

1. **エクスポート**: 既存 `booksData` を CSV/JSON に変換し S3 等に保管。
2. **トランスフォーム**: タグを正規化 (スラグ化) し、`publicationYear` の欠損を補完。
3. **ロード**: Drizzle マイグレーション + seeding スクリプトで PostgreSQL に投入。
4. **検証**: 
   - レコード件数一致
   - ランダムサンプリングで書籍詳細の整合性チェック
   - API レベルで `GET /catalog/books/{id}` を照合
5. **サインオフ**: Data/QA チームの承認後に BFF 側の参照先を切替。

## ロールバックガイド

- **検知**: API レイテンシ悪化、500系エラー増加を Prometheus + Grafana で監視。
- **即時対応**: BFF の環境変数をモノリス (従来 API) に切り戻す。
- **データ復旧**: インポート期間の書籍更新が存在した場合、差分をログから逆適用。
- **再試行条件**: 障害原因が特定されるまで PoC 環境で再現テストし、修正パッチを適用。

## オープン課題

- タグの正規化と多言語対応の要件確定。
- 画像URL のホスティング戦略 (CDN 配信か S3 直リンクか)。
- 認証/認可 (Admin Service と共有する RBAC) の仕様策定。
