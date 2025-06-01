# Medical Network - 医師マッチングプラットフォーム

医師と病院をマッチングするためのWebアプリケーションです。Cloudflare Pages、Workers、D1を使用して構築されています。

## 機能

- 医師の会員登録
- 医師プロフィールの表示
- 診療科別の医師分布グラフ
- レスポンシブデザイン

## 技術スタック

- Frontend: HTML, CSS, JavaScript
- Backend: Cloudflare Workers (Hono)
- Database: Cloudflare D1
- Authentication: bcryptjs

## セットアップ

1. リポジトリのクローン
```bash
git clone [repository-url]
cd [repository-name]
```

2. 依存関係のインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm run dev
```

4. ビルド
```bash
npm run build
```

5. デプロイ
```bash
npm run deploy
```

## 環境変数

以下の環境変数を設定する必要があります：

- `DB`: Cloudflare D1データベースのバインディング名

## ライセンス

MIT 