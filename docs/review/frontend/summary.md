# Frontend Review Summary

## Review Scope
- 対象: `docs/review/frontend/README.md` の Review Focus に基づくフロントエンド全体
- 対象外: バックエンド実装、API仕様そのもの、実機での全画面手動確認
- レビュー日: 2026-04-22
- レビュー担当: Codex

## Result
- 総合判断: 主要な構成、Lint/Build、モバイル対応、Leaflet の暫定対応に明確な破綻は見つからない。ただし、ログの機微情報、登録フォーム状態、外部 avatar 依存、取得失敗時の UI 復旧性は本番前に対応方針を決めるべき。
- リリース可否: 条件付き可。`F-001` から `F-004` は本番前対応または明示的な受け入れ判断を推奨する。
- ブロッカー: なし

## Findings Summary
| Severity | Count | Notes |
| --- | ---: | --- |
| Critical | 0 | - |
| High | 0 | - |
| Medium | 4 | 登録フォーム状態、ログ機微情報、外部 avatar 依存、取得失敗時の UI 復旧性 |
| Low | 1 | production build 方針の明示不足 |

## Key Points
- ESLint 統一後の `npm run lint` は成功しており、OxLint 削除による直接的な参照残りは確認されなかった。
- `npm run build` は成功しており、今回の生成物では `dist` 配下に sourcemap は出力されていない。
- モバイル対応済みの Header、Layout、Timeline、Login、Search、MyPage、Map、各モーダルについて、静的レビュー上の重大な構成不整合は見つからなかった。
- Leaflet は `shallowRef` / `markRaw` と明示的な再検索方式に寄せられており、過剰な API 呼び出しや reactive proxy 起因のリスクは以前より低下している。
- 残る主な懸念は、機微情報を含み得るログ、外部サービスへのユーザー名送信、取得失敗時にユーザーへ状態が伝わらない点。

## Residual Risks
- 実機での全画面アクセシビリティ確認、キーボード操作、スクリーンリーダー確認は未実施。
- stg 環境のブラウザ console ログがどの範囲で収集・共有されるかは未確認。
- API エラー、タイムアウト、オフライン時の UX は画面ごとにばらつきが残る。
- 外部 avatar 画像の利用可否は、プライバシー方針と CSP 方針に依存する。

## Verification
- `npm run lint`: OK
- `npm run build`: OK
- `dist` sourcemap 確認: OK。`.map` ファイルなし
- 不要ファイル確認: OK。`index.html`、`.oxlintrc.json`、`src/stores/counter.js` の残存なし
- 主要画面確認: 静的レビューのみ
- モバイル基準幅確認: 既存 TODO 資料上は確認済み。今回のレビューでは実機再確認なし

## Follow-up
- `F-001`: 登録モーダル close 時のフォーム初期化を実装する。
- `F-002`: ログ出力項目からログインID、メール、検索語、query string を除外する。
- `F-003`: avatar の外部サービス利用方針を決め、必要に応じてローカル fallback へ変更する。
- `F-004`: 一覧・詳細・地図の取得失敗時 UI と再試行導線を共通化する。
- `F-005`: `vite.config.js` に `minify: 'esbuild'`、`sourcemap: false` を明示する。
