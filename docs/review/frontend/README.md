# Frontend Review Docs

## Scope
`footprint-front` のフロントエンド実装を対象にレビューする。

対象:

- Vue entry: `src/entries/**`
- Vue components: `src/components/**`
- composables: `src/composables/**`
- stores: `src/stores/**`
- services / API client: `src/services/**`
- model mapping: `src/models/**`
- constants / utils / plugins: `src/constants/**`, `src/utils/**`, `src/plugins/**`
- build / lint / dev config: `vite.config.js`, `eslint.config.js`, `package.json`

## Structure
- `findings.md`
  フロントエンドレビューの指摘一覧の原本
- `summary.md`
  フロントエンドレビューの最終結果
- `checks/`
  単発の再確認や部分レビューのメモ

## Update Rules
- 指摘一覧は `findings.md` に集約する
- 最終的な判断は `summary.md` に集約する
- 単発の再確認や部分レビューは `checks/` に分離する
- `findings.md` の状況は `未対応` / `対応中` / `対応済` / `クローズ` / `見送り` で更新する
- 再レビュー時も同一指摘は同じ No. を使い、新規指摘のみ新しい No. を採番する

## Review Focus

### Architecture / Responsibility
- entry、layout、component、service、store、model の責務が分離されているか
- 画面固有ロジックが共通コンポーネントへ漏れていないか
- API 通信、データ変換、UI 表示の責務が混在していないか
- composable が状態管理、DOM 操作、副作用を過剰に抱えていないか

### Vue / Vuetify
- `script setup` の props / emits / refs の使い方が一貫しているか
- 未使用 props、未使用 state、不要な reactive 化がないか
- Vuetify utility で済む箇所に不要な scoped CSS を増やしていないか
- modal、dialog、overlay の lifecycle が Vue と外部ライブラリで破綻していないか
- モバイル時の fullscreen、FAB、header、sidebar の挙動が一貫しているか

### State / Data Flow
- Pinia store の責務が明確か
- store に画面固有状態を持たせすぎていないか
- API レスポンスを model mapper で正規化できているか
- null、空配列、未取得、取得失敗の扱いが UI で破綻しないか

### API / Error Handling
- `apiClient` の timeout、CSRF、HTTP error、ログ出力が期待どおりか
- service 層が API path と request / response 変換に閉じているか
- UI 側で alert のみになっているエラーが UX 上許容できるか
- 古い非同期レスポンスが新しい UI 状態を上書きしないか

### Map / External Library
- Leaflet インスタンスを Vue の深い reactive proxy に巻き込んでいないか
- marker、popup、Vue app、cleanup の lifecycle が一致しているか
- 地図操作時に API を過剰に呼び出していないか
- モバイルで地図操作、popup、詳細モーダルが干渉しないか

### Responsive / Accessibility
- ADR の基準幅 `375px` / `390px` / `768px` で表示が破綻しないか
- header、FAB、dialog、bottom action が safe area やブラウザ UI と干渉しないか
- icon button に `aria-label` や title が付与されているか
- keyboard 操作、focus、form validation message が最低限扱えるか

### Build / Operations
- production build で Vite 標準 minify と sourcemap 非公開が維持されているか
- manifest の entry 名とバックエンド参照が一致しているか
- dev server 設定が staging / production build に影響しないか
- 不要な template ファイル、未使用 store、未使用依存が残っていないか
- ESLint のみで lint 運用できているか

### Security
- secret、API key、認可判断をフロントに置いていないか
- ログに機微情報を出していないか
- user input を HTML として直接描画していないか
- ファイルアップロードの client validation が server validation を代替する前提になっていないか

## Naming
- 確定資料は `findings.md` / `summary.md`
- 単発確認資料は `YYYY-MM-DD-topic-check.md`
- 日付が不明な過去資料は意味が分かる名前で `checks/` に残す
