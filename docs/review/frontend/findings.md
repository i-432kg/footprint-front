# Frontend Review Findings

## Review Metadata
- レビュー日: 2026-04-22
- レビュー観点: `docs/review/frontend/README.md`
- 対象: `src/entries/**`, `src/components/**`, `src/composables/**`, `src/services/**`, `src/models/**`, `src/utils/**`, `vite.config.js`, `eslint.config.js`, `package.json`
- 検証: `npm run lint`, `npm run build`, `dist` 配下の sourcemap 有無確認

## Status Legend
- `未対応`: 対応が必要
- `対応中`: 修正または確認中
- `対応済`: 修正済み
- `クローズ`: 対応不要として完了
- `見送り`: 認識したうえで今回は対応しない

## Findings
| No. | Severity | Status | Area | File | Finding | Recommendation | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | Medium | 未対応 | Security / UX | `src/components/login/RegisterModal.vue:47`, `src/components/login/RegisterModal.vue:135` | 登録モーダルを閉じても `registerForm` とフォーム検証状態がリセットされない。メールアドレス、パスワード、生年月日が再オープン時に残り、共有端末や操作ミス時に入力値が露出する可能性がある。 | `closeModal` または登録成功後の終了処理で `registerForm`、`isValid`、ステップ、`v-form` の validation state を初期化する。失敗時に入力を残すかどうかは UX 方針として明示する。 | `persistent` dialog のため意図せず閉じにくい設計ではあるが、閉じた後の入力保持は明示的に扱うべき。 |
| F-002 | Medium | 未対応 | Security / Logging | `src/utils/logger.js:11`, `src/utils/logger.js:33`, `src/components/login/LoginForm.vue:65`, `src/components/login/RegisterModal.vue:120`, `src/components/layout/TheHeader.vue:58`, `src/services/apiClient.js:298` | stg 環境でも構造化ログが有効で、ログインID、メールアドレス、検索語、クエリ付きURL/APIパスが console に出力される。ブラウザログ収集や画面共有時に個人情報・検索意図が残る可能性がある。 | ログにはイベント名、HTTP status、traceId、処理時間などの非機微情報のみを残す。URL/API path は query を除外し、ログインID・メール・検索語は削除またはマスクする。stg でのログ出力方針も明文化する。 | `logger.enabled` は `DEV` または `MODE === 'staging'` で有効。 |
| F-003 | Medium | 未対応 | Security / External Dependency | `src/models/userModel.js:15`, `src/entries/mypage/App.vue:131` | ユーザー名を seed として `https://api.dicebear.com` の外部 avatar 画像を読み込んでいる。マイページ表示時にユーザー名が第三者サービスへ送信され、外部サービス障害や CSP 制約の影響も受ける。 | 本番運用ではバックエンド管理の avatar URL、同梱デフォルト画像、またはフロント内で完結するプレースホルダー表示に寄せる。外部サービスを使う場合はプライバシー方針、CSP、障害時 fallback を明示する。 | 現状は `fetchMe()` の model mapping で常に外部URLが生成される。 |
| F-004 | Medium | 未対応 | API / Error Handling | `src/composables/useInfiniteScroll.js:57`, `src/entries/mypage/App.vue:64`, `src/entries/mypage/App.vue:89`, `src/entries/mypage/App.vue:107`, `src/components/post/PostMap.vue:154`, `src/components/post/detail/PostDetailModal.vue:75` | 一部の取得失敗が `console.error` のみで UI に反映されない。ユーザーは読み込み失敗、再試行可否、空表示との違いを判断できず、モバイル回線や一時的なAPI失敗時に操作復旧しにくい。 | 一覧・詳細・地図で共通の error state と retry 導線を持たせる。最低限、取得失敗時は inline alert/snackbar と再読み込みボタンを表示する。 | 投稿・返信作成は `alert` 表示があるが、取得系は画面上の通知が不足している。 |
| F-005 | Low | 未対応 | Build / Operations | `vite.config.js:37` | 本番方針として「Vite 標準 minify、sourcemap 非公開」を採用しているが、`vite.config.js` には `minify` と `sourcemap` が明示されていない。現時点の Vite デフォルトとビルド結果では問題ないが、方針が設定として固定されていない。 | `build` に `minify: 'esbuild'` と `sourcemap: false` を明示する。CI で `dist/**/*.map` が生成されていないことを確認する運用も検討する。 | 今回の確認では `dist` 配下に `.map` ファイルは生成されていない。 |

## Severity Guide
- `Critical`: 本番障害、重大なセキュリティ問題、主要導線の完全停止につながる
- `High`: 主要機能の破綻、データ不整合、復旧困難な UX 破綻につながる
- `Medium`: 特定条件での不具合、保守性低下、運用品質低下につながる
- `Low`: 軽微な改善、命名、コメント、整理不足
