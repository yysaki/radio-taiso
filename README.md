# radio-taiso

「ラジオ体操第一」「ラジオ体操第二」「みんなの体操」の動画をすぐに再生できる1ページの Web アプリです。

https://radio-taiso.yysaki.com/

## 機能

- タブで3つの体操を切り替えて再生（動画はかんぽ生命公式チャンネルのものを `youtube-nocookie.com` で埋め込み）
- URL ハッシュで直接開ける: `#daiichi` / `#daini` / `#minna`
- 連続再生: 動画が終わると右隣の体操へ進んで自動再生し、最後で止まる（オン/オフは localStorage に保存）
- PC・タブレット・スマホ対応

## 技術構成

- React 19（ルーターなしの SPA）
- Vite（GitHub Pages の独自ドメイン `radio-taiso.yysaki.com` でルート `/` から配信）
- pnpm / Node.js 26（`.node-version`）
- Vitest + happy-dom + Testing Library（単体テスト）
- Playwright（E2E。YouTube はスタブに差し替え）
- oxlint / oxfmt（lint・整形）

## 開発

```sh
pnpm install
pnpm dev        # 開発サーバー
pnpm typecheck  # 型チェック
pnpm lint       # oxlint
pnpm format     # oxfmt で整形 (format:check で確認のみ)
pnpm build      # dist/ にビルド
pnpm test       # 単体テスト (Vitest)
pnpm exec playwright install chromium  # 初回のみ
pnpm test:e2e   # E2E テスト
```

## デプロイ

`main` に push すると GitHub Actions（`.github/workflows/ci.yml`）で整形チェック・lint・型チェック・単体テスト・ビルド・E2E を実行し、
成功した場合のみ GitHub Pages にデプロイします。
リポジトリの Settings → Pages → Source は「GitHub Actions」にしておく必要があります。
