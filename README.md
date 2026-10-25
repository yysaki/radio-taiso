# radio_taiso

「ラジオ体操第一」「ラジオ体操第二」「みんなの体操」の動画をすぐに再生できる1ページの Web アプリです。

https://yysaki.github.io/radio_taiso/

## 機能

- タブで3つの体操を切り替えて再生（動画はかんぽ生命公式チャンネルのものを `youtube-nocookie.com` で埋め込み）
- URL ハッシュで直接開ける: `#daiichi` / `#daini` / `#minna`
- 連続再生: 動画が終わると右隣の体操へ進んで自動再生し、最後で止まる（オン/オフは localStorage に保存）
- PC・タブレット・スマホ対応

## 技術構成

- [Remix 3](https://github.com/remix-run/remix)（`remix/component` の `createRoot` でクライアントのみ描画）
- Vite（GitHub Pages のサブパス `/radio_taiso/` 向けにビルド）
- pnpm / Node.js 26（`.node-version`）
- Playwright（E2E。YouTube はスタブに差し替え）

## 開発

```sh
pnpm install
pnpm dev        # 開発サーバー
pnpm typecheck  # 型チェック
pnpm build      # dist/ にビルド
pnpm exec playwright install chromium  # 初回のみ
pnpm test:e2e   # E2E テスト
```

## デプロイ

`main` に push すると GitHub Actions（`.github/workflows/ci.yml`）で型チェック・ビルド・E2E を実行し、
成功した場合のみ GitHub Pages にデプロイします。
リポジトリの Settings → Pages → Source は「GitHub Actions」にしておく必要があります。
