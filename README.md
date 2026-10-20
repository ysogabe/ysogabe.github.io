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
- 手動紹介情報でGitHubメタデータを上書きし、公開LPの紹介も追加（`config/projects.json`）
- GitHub Actionsでmain push・毎日6:23 JST・手動実行のビルドと公開
- GitHub API停止時には公開シードJSONを使用し、同じ掲載期限を適用

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

`featured` には公開リポジトリ名または `curatedProjects` の紹介用slugを優先順で設定します。注目には掲載対象のうち有効なHTTPSの `site`（LP）がある項目を自動で含め、LPなしの手動指定項目より先に表示します。同じグループ内では `featured` の設定順を優先し、未指定のLP付き項目はその後に続きます。一覧のおすすめ順もこの順序にそろえます。`curatedProjects` は公開ブランド名・カテゴリ・LP・説明・背景・主な機能と、任意の公開画像（`image`）を手動管理し、API同期データとは分離します。URLはHTTPSに限定します。紹介のみの項目にはリポジトリリンクや推測した更新日を表示しません。

### データ公開ポリシー

自動同期は `GET /users/ysogabe/repos?type=owner` で取得した公開情報のみを対象とし、`private`・fork・archive・別オーナーのリポジトリを除外します。秘密の認証情報、GitHub Actionsのトークンや非公開リポジトリの情報をHTMLやJSONに埋め込みません。

公開リポジトリは最終コード更新（`pushed_at` をシードの `updated_at` に格納）から1暦年未満のみ掲載します。UTCの同時刻の翌年応当日を期限とし、2月29日は翌年2月28日へ丸めます。期限ちょうど・日時不正・欠損の項目は除外します。API同期の成否によらず、ビルド時の共通処理で一覧・検索・注目・最近の更新・詳細ルート・関連紹介・sitemapへ適用します。

公開LPの紹介は `curatedProjects` に一般公開できる内容のみを登録します。公開されていないソースの自動取得やメタデータ同期は行いません。

`npm run check:content` で期限境界とデータを検証し、ビルド後は `npm run check:content -- --built` で生成ページとsitemapも検証できます。

## 公開済みプロジェクトのLPについて

hogo-meter（保護猫のおせわメーター）、保護動物 医療費管理、デジタル麻雀システムは公開LPへのリンクから紹介します。Miharashi、Context Capture、Miharashi Panelも掲載対象であれば既存LPへリンクします。このリポジトリ側では既存LPを改変しません。

## 注意

トップの猫・植物・PCのイラストはCSSベースの装飾です。プロジェクト画像は公開画像を参照し、画像を設定しない紹介には既存の装飾イラストを表示します。自動分類・説明文は編集可能であり、分類や説明が必ず正確とは限りません。
