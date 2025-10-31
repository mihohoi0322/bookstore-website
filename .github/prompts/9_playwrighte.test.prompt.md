---
post_title: "Playwright 正常確認手順"
author1: "GitHub Copilot"
tags:
  - playwright
  - regression-test
  - qa
ai_note: "generated-by-ai"
summary: "Playwright MCP を使ってローカル開発環境上の書店サイトをエンドツーエンドで確認する手順。"
post_date: "2025-10-31"
---

## 前提条件
- `npm install` 済みで依存関係が揃っていること。
- ターミナルから `npm run dev -- --host 0.0.0.0 --port 5173` を実行し、Vite 開発サーバーが `http://localhost:5173` で稼働していること。
- Playwright MCP からブラウザセッションを開始できる状態であること。

## Playwright MCP 操作の共通方針
- すべてのステップは単一のコンテキストとページで実施する。リロードが必要な場合は `page.reload()` を使う。
- DOM 検証は `locator` API か `page.evaluate` を用い、テキストは `toHaveText` で厳密一致させる。
- 状態リセットは `await page.evaluate(() => localStorage.clear())` で実施し、テスト間の独立性を保つ。

## 手順詳細

### セッション初期化
1. 操作: `await page.goto('http://localhost:5173/')`。
  - 期待値: タイトルが `ほんのわ書店 - Personal Bookstore` で、ヒーロー見出しに「書籍一覧」が表示される。
2. 操作: `await page.evaluate(() => { localStorage.clear(); localStorage.setItem('shopping-cart', '[]'); })`。
  - 期待値: `await page.evaluate(() => localStorage.getItem('shopping-cart'))` が `'[]'` を返し、ナビゲーションの「カート」ボタンにバッジが表示されない。

### カタログの初期確認
1. 操作: `await expect(page.getByRole('heading', { level: 2, name: '書籍一覧' })).toBeVisible()`。
  - 期待値: 書籍カードが 12 件レンダリングされ、フッター文言が「12冊の本を表示中」である。
2. 操作: 最初の書籍カード内の「カートへ」ボタンをクリック。例: `await page.getByRole('button', { name: 'カートへ' }).first().click()`。
  - 期待値: トーストに「カートに追加しました」が表示され、`await page.evaluate(() => JSON.parse(localStorage.getItem('shopping-cart') ?? '[]').length)` が `1` になる。

### ナビゲーションバッジ検証
1. 操作: `await expect(page.getByRole('button', { name: /カート/ })).toContainText('カート')`。
  - 期待値: 同ボタンの子要素に数量バッジが現れ、`await page.evaluate(() => JSON.parse(localStorage.getItem('shopping-cart') ?? '[]')[0].quantity)` が `1`。

### カート画面の動作確認
1. 操作: ナビゲーションから「カート」をクリックし、`await expect(page.getByRole('heading', { level: 1, name: 'ショッピングカート' })).toBeVisible()` を確認。
  - 期待値: カード内に「風の谷の物語」が数量 `1` で表示され、合計金額が `¥1,800`。
2. 操作: 数量増加ボタン（`+`）を 1 回クリック。
  - 期待値: 数量表示が `2` となり、合計金額が `¥3,600`。`localStorage` の該当アイテム数量も `2`。

### チェックアウトフロー
1. 操作: 「お会計に進む」をクリックし、ページ見出し「お支払い情報の入力」を確認。
  - 期待値: 注文内容サイドバーの合計が `¥3,600` で、アイテム名がカート内容と一致する。
2. 操作: 以下の値でフォームを入力し、必要項目をすべて埋める。
  - 氏名: `山田 太郎`
  - メール: `test@example.com`
  - 郵便番号: `1500001`
  - 都道府県: `東京都`
  - 市区町村: `渋谷区`
  - 番地: `神南1-2-3 ABCビル4F`
  - カード番号: `4242 4242 4242 4242`
  - 名義: `TARO YAMADA`
  - 有効期限: `12`, `30`
  - CVV: `123`
3. 操作: 「注文を確定する」を押下し、ボタンラベルが「処理中...」に変化することを待機。
  - 期待値: 約 2 秒後にボタンが活性化へ戻り、トーストで「ご注文が完了しました！」が表示される。

### 注文完了画面の確認
1. 操作: 自動遷移後、`await expect(page.getByRole('heading', { level: 1, name: 'ご注文ありがとうございます' })).toBeVisible()` を検証。
  - 期待値: 注文番号が `ORDER-` で始まる文字列として表示される。
2. 操作: `await page.evaluate(() => ({ cart: localStorage.getItem('shopping-cart'), orders: localStorage.getItem('orders') }))`。
  - 期待値: `cart` は `'[]'`、`orders` には最新注文が含まれ、`totalAmount` が `3600`。
3. 操作: ナビゲーションの「カート」ボタンを確認。
  - 期待値: バッジが存在しない。

### 後処理
1. 操作: 「書籍一覧に戻る」をクリックし、カタログへ復帰する。
  - 期待値: 初期と同じ 12 件が表示され、`localStorage` のカートは空のまま。
2. 操作: Playwright セッションをクローズし、必要に応じて開発サーバーを停止する。
