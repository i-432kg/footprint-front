# ADR: Axios を廃止し標準 fetch ベースの API クライアントへ移行する

## ステータス
Proposed

## 背景
現在のフロントエンドでは `src/services/apiClient.js` を通じて Axios を利用している。

この共通クライアントは単なる HTTP ライブラリの呼び出し口ではなく、次のようなアプリケーション共通の責務をまとめて持っていた。

- `/api` を前提にした base path の適用
- `params` によるクエリパラメータ付与
- CSRF トークンの自動付与
- タイムアウト制御
- 成功 / 失敗時の API ログ出力
- `response.data` の直接返却

一方で、`src/services/postService.js` と `src/services/userService.js` から利用している機能は限定的であり、Axios 固有の高度な機能には依存していなかった。

- `get`
- `post`
- 任意ヘッダの付与
- `FormData`
- `URLSearchParams`
- エラー発生時の `try/catch`

現在のブラウザ環境では `fetch`、`AbortController`、`FormData`、`URLSearchParams` が標準で利用できるため、この用途のためだけに Axios を依存として残す必要性は高くない。

## 問題
- 通信基盤のためにランタイム依存として Axios を維持している
- 実際に利用している API が狭く、ライブラリ依存に対して得られる価値が小さい
- Axios が暗黙的に提供する挙動に共通 API クライアントが依存している
- 標準 `fetch` へ移行する際に、既存の `try/catch` やログ出力の挙動を壊さず整理する必要がある

## 決定
Axios を廃止し、`src/services/apiClient.js` を fetch ベースの共通 API クライアントに置き換える。

サービス層の呼び出しシグネチャは維持する。

1. `apiClient.get(path, config)`
2. `apiClient.post(path, body, config)`
3. `withLog(logEvent, config)`

HTTP ライブラリは置き換えるが、既存アプリケーションが依存している共通責務は新しい API クライアント側で引き続き担う。

## 設計方針

### 1. サービス層の公開インターフェースは変えない
`postService` や `userService` から見た利用方法は変えない。

維持する利用形:

- `apiClient.get('/posts', { params: {...} })`
- `apiClient.post('/users', requestBody, config)`
- `withLog(LOG_EVENTS.XYZ, config)`

これにより、画面側やサービス側へ影響を広げず、差分を共通クライアントに閉じ込める。

### 2. Axios の暗黙挙動は fetch 側で明示的に再実装する
Axios が提供していた次の挙動は、fetch へ移行しても維持する。

- `/api` の base path を適用する
- `params` をクエリ文字列へ変換する
- 非安全メソッドで CSRF ヘッダ `X-XSRF-TOKEN` を付与する
- 10 秒タイムアウトを適用する
- レスポンス本文を解析してデータ本体を返す
- trace ID と処理時間を含む API ログを出力する

### 3. HTTP エラーは `ApiError` として失敗扱いにする
`fetch` は HTTP 4xx / 5xx を自動で reject しない。

そのため、既存の `try/catch` フローを維持するために、`response.ok === false` の場合は共通クライアント側で独自 `ApiError` を throw する。

`ApiError` には少なくとも次を保持する。

- `message`
- `status`
- `code`
- `response`
- `config`

これにより、既存 UI が参照している `error.message` と、API ログで使う最小限の情報を維持する。

### 4. リクエストボディは型に応じて共通クライアントで扱い分ける
POST 時のボディは次のルールで処理する。

- plain object は JSON にシリアライズする
- `FormData` はそのまま渡す
- `URLSearchParams` はそのまま渡す
- `Content-Type` が未指定で plain object の場合のみ `application/json` を付与する

これにより、ユーザー登録の JSON 送信、ログインの form-urlencoded 送信、投稿画像の multipart 送信を共通クライアント側で吸収できる。

## 選択肢

### 案1: Axios を継続利用する
不採用。

理由:

- 利用している機能が限定的で、標準 API で十分代替できる
- 依存削減と挙動の明示化という目的を達成できない

### 案2: fetch へ置き換えるが、サービス層の呼び出し形式も変更する
不採用。

理由:

- 変更範囲が `postService`、`userService`、画面層まで広がる
- 本質は HTTP 基盤の差し替えであり、公開インターフェースまで変更する必要はない

### 案3: fetch ベースの共通 API クライアントへ内部実装のみ差し替える
採用。

理由:

- 変更範囲を `apiClient.js` と依存定義にほぼ限定できる
- 既存の `try/catch`、ログ、CSRF 付与の挙動を維持しやすい
- Axios 依存を解消しつつ、呼び出し側コードへの影響を最小化できる

## 移行手順
1. `src/services/apiClient.js` を fetch ベース実装へ差し替える
2. `params`、CSRF、timeout、ログ、レスポンス解析、`ApiError` を実装する
3. `postService` と `userService` が既存の呼び出し形式で動くことを確認する
4. `package.json` と `package-lock.json` から `axios` を削除する
5. ビルドと変更範囲の lint を実行して、移行差分が成立していることを確認する

## 期待する効果
- ランタイム依存から Axios を除去できる
- 通信処理がブラウザ標準 API ベースになり、挙動を追いやすくなる
- サービス層と UI 側の変更を最小限に抑えられる
- 共通 API クライアントが担う責務が明示化され、今後の拡張や保守がしやすくなる
