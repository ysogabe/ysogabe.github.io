# ysogabe.github.io

「気になることを、少しずつかたちに。」

個人開発プロジェクトを紹介するポートフォリオ。Astro 7 + GitHub Pages で静的サイトを配信しています。

- 公開サイト（GitHub Pages設定後）: https://ysogabe.github.io/
- Projects: https://ysogabe.github.io/projects/
- GitHub: https://github.com/ysogabe

## 主な機能

- トップ / Projects一覧 / プロジェクト詳細 / About
- 文章・デザイン優先のやさしいUI、レスポンシブ対応
- GitHub REST APIから**公開**リポジトリのみビルド時に同期（ブラウザからAPI呼び出しなし）
- カテゴリ絞り込み、キーワード検索、並べ替え
- 手動紹介情報でGitHubメタデータを上書き（`config/projects.json`）
- GitHub Actionsでmain push・毎日6:23 JST・手動実行のビルドと公開
- GitHub API停止時にはレビュー済みのシードJSONを使用

## 初回公開

1. GitHubの `Settings → Pages` を開く。
2. `Build and deployment → Source` を **GitHub Actions** に変更する。
3. `Actions → Publish portfolio` で `Run workflow` を実行する（設定前に失敗した場合も再実行）。
4. `https://ysogabe.github.io/` を確認する。

このサイトはユーザーサイトなので、Astroの `base` 設定は不要です。

## ローカル開発

Node.js 24 を推奨します（Astro 7.4要件はNode.js >=22.22.0）。

```bash
npm install
npm run dev
npm run check:content
npm run build
npm run preview
```

GitHub REST APIが利用できない環境では `src/data/projects.generated.json` のレビュ済みシードを使用します。

## メンテナンス

- `config/projects.json`: 注目プロジェクト、紹介文、画像、カテゴリ、機能・背景、除外リストを編集
- `scripts/sync-projects.mjs`: API同期、パブリック限定フィルタ、失敗時フォールバック
- `src/lib/projects.js`: データ正規化とカテゴリ自動分類
- `src/styles/global.css`: 色・余白・レスポンシブ等のUI
- `src/data/projects.generated.json`: オフライン・API障害時の最低限の公開シード（秘密情報を入れない）

`featured` には公開リポジトリ名だけ設定してください。別のプロジェクトに対する案内URLもHTTPSに限定します。

### データ公開ポリシー

サイトは `GET /users/ysogabe/repos?type=owner` で取得した公開情報のみを対象とし、`private`・fork・archive・別オーナーのリポジトリを除外します。秘密の認証情報、GitHub Actionsのトークンや非公開リポジトリの情報をHTMLやJSONに埋め込みません。

## 公開済みプロジェクトのLPについて

Miharashi、Context Capture、Miharashi Panelに独立したLPがある場合は、詳細ページから既存のURLへリンクします。このリポジトリ側では既存LPを改変しません。

## 注意

トップの猫・植物・PCのイラストはCSSベースの装飾です。掲載するプロジェクト画像は各公開リポジトリの実際の公開画像を参照します。自動分類・説明文は編集可能であり、分類や説明が必ず正確とは限りません。
