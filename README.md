# Footprint Frontend

`footprint-front` は、位置情報付き写真投稿サービス「Footprint」のフロントエンド実装です。
Vue 3 + Vite + Vuetify を使い、Spring Boot / Thymeleaf が描画するページに Vue アプリをマウントする構成を採用しています。

このリポジトリは単体の SPA ではなく、バックエンドが返す HTML と連携するマルチエントリのフロントエンド資産を管理します。

## 現在の構成

- ページ描画: Spring Boot + Thymeleaf
- UI 実装: Vue 3
- ビルド: Vite
- UI ライブラリ: Vuetify + Material Design Icons
- 状態管理: Pinia
- 地図表示: Leaflet
- API 通信: Fetch ベースの共通 `apiClient`
- スタイル: CSS（Vuetify のビルド用に Sass 依存あり）
- Lint: ESLint

## 画面一覧

現在のエントリポイントは以下の 5 画面です。

| 画面 | パス | エントリ |
| --- | --- | --- |
| ログイン / 新規登録 | `/login` | `src/entries/login/main.js` |
| タイムライン | `/timeline` | `src/entries/timeline/main.js` |
| 地図表示 | `/map` | `src/entries/map/main.js` |
| マイページ | `/mypage` | `src/entries/mypage/main.js` |
| 検索結果 | `/search?q=...` | `src/entries/search/main.js` |

## 実装済みの主な機能

- ログイン
- 新規ユーザー登録
- タイムライン一覧表示
- 投稿詳細モーダル表示
- 画像付き投稿作成
- 投稿への返信 / スレッド表示
- キーワード検索
- 地図上での投稿探索
- 現在地取得と地図範囲での再検索
- マイページでの自分の投稿 / 返信履歴表示
- モバイル対応レイアウト

## アーキテクチャメモ

- Vue Router は使っていません。
- Vite はマルチエントリ構成で、各ページごとに別の `main.js` をビルドします。
- タイムラインと検索画面では、Thymeleaf から埋め込まれた `data-username` を Pinia ストアへ初期投入します。
- API リクエストは原則 `/api` 配下に送信し、開発時は Vite のプロキシで `http://localhost:8080` に転送します。
- 更新系 API では Cookie の `XSRF-TOKEN` を読み取り、`X-XSRF-TOKEN` ヘッダを自動付与します。

## 動作環境

- Node.js: `^20.19.0 || >=22.12.0`
- npm: Node.js 同梱版

## セットアップ

```bash
npm install
```

## 開発フロー

このリポジトリ単体では画面 HTML を提供しません。ローカルで画面を確認する場合は、バックエンドアプリケーションもあわせて起動してください。

1. バックエンドを `http://localhost:8080` で起動する
2. このリポジトリで開発サーバを起動する

```bash
npm run dev
```

Vite 開発サーバは `http://localhost:5173` で起動し、`/api` へのリクエストは `http://localhost:8080` にプロキシされます。

## 利用可能なスクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Vite 開発サーバ起動 |
| `npm run build` | 本番向けビルド |
| `npm run build:stg` | `staging` モードでビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLint 実行 |
| `npm run lint:fix` | ESLint 自動修正 |

## 環境変数

現時点で、このフロントエンドは独自の `VITE_*` 環境変数を使用していません。

利用しているのは Vite 標準の `import.meta.env.DEV` と `import.meta.env.MODE` のみで、主にフロントエンドログの有効化判定に使っています。

## ビルド成果物

- Vite の `manifest.json` を出力します
- ビルドエントリは `login` / `map` / `mypage` / `search` / `timeline` です
- 出力ファイルは `assets/` 配下へまとめられます

バックエンド側はこの manifest を参照して各ページに対応するフロントエンド資産を読み込む想定です。

## ディレクトリ構成

```text
src/
├─ assets/        # 共通スタイル
├─ components/    # UI コンポーネント
├─ composables/   # 共通ロジック
├─ constants/     # ログイベント、文言定数
├─ entries/       # 画面ごとの Vite エントリ
├─ models/        # API レスポンスの変換
├─ plugins/       # Vuetify 設定
├─ services/      # API クライアント / サービス層
├─ stores/        # Pinia ストア
└─ utils/         # ロガー、バリデーション
```

## 関連ドキュメント

`docs/` 配下のディレクトリは以下の用途で使っています。

| ディレクトリ | 用途 |
| --- | --- |
| `docs/adr/` | 重要な設計判断の記録。例: fetch 採用、モバイル breakpoint、地図再検索方式 |
| `docs/investigations/` | 不具合や技術課題の調査メモ |
| `docs/review/` | レビュー結果の保管場所。現在は `docs/review/frontend/` にフロントエンドレビューを保存 |
| `docs/todo/` | 対応タスク、進捗、対応状況のメモ |

## 現状の補足

- フロントエンドの自動テストはまだ導入されていません
