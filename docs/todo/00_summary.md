# TODO Summary

## 目的
現時点で残っている未対応課題を、Leaflet 関連課題とモバイル対応課題に分けて整理する。

## 一覧
| 優先度 | 分類 | 課題 | 対象 | 状態 | 次アクション |
| --- | --- | --- | --- | --- | --- |
| P0 | Leaflet | ポップアップ再表示時の空白化を暫定対応する | `PostMap.vue` | 完了 | 動作確認 OK |
| P0 | モバイル対応 | モバイル対応状況ドキュメントを現状に更新する | `docs/todo/mobile_responsive_status.md` | 未対応 | 実装済み項目を対応済みに移動し、残課題を再整理する |
| P1 | Leaflet | ズーム操作時エラーの再発確認を行う | `PostMap.vue` | 完了 | 動作確認 OK |
| P1 | モバイル対応 | 主要画面を基準幅で確認する | `/login`, `/timeline`, `/search`, `/mypage`, `/map` | 要確認 | `375px` / `390px` / `768px` で横スクロールや導線の破綻を確認する |
| P1 | モバイル対応 | モーダル表示時の操作性を確認する | `RegisterModal.vue`, `SideUserActions.vue`, `PostDetailModal.vue`, `ReplyModal.vue` | 要確認 | fullscreen 表示、キーボード表示、入力・送信導線を確認する |
| P1 | モバイル対応 | マップ画面のモバイル操作性を確認する | `map/App.vue`, `PostMap.vue`, `PostPopup.vue` | 要確認 | 地図領域、ズーム操作、再検索ボタン、popup 表示を確認する |
| P2 | Leaflet | Leaflet popup から Vue/Vuetify overlay への移行を検討する | `PostMap.vue`, `PostPopup.vue` | 将来検討 | marker は選択のみ担当し、投稿プレビューを Vue 側 overlay に寄せるか検討する |
| P2 | モバイル対応 | 残っている scoped CSS の扱いを確認する | scoped CSS が残る各コンポーネント | 継続確認 | Vuetify utility で代替可能なものを整理し、必要な CSS は残す |

関連ドキュメント:

- `docs/adr/adr_002_define_mobile_breakpoints_for_responsive_support.md`
- `docs/adr/adr_004_use_explicit_area_search_for_map_posts.md`
- `docs/adr/adr_005_keep_leaflet_popup_vue_app_alive_until_marker_cleanup.md`
- `docs/investigations/leaflet_zoom_error_investigation.md`
- `docs/investigations/leaflet_popup_blank_after_reopen.md`
- `docs/todo/mobile_responsive_status.md`

## Leaflet 関連

### P0: ポップアップ再表示時の空白化を暫定対応する
対象:

- `src/components/post/PostMap.vue`

対応状況:

- marker の popup に Vue app として `PostPopup` を mount している
- `docs/adr/adr_005_keep_leaflet_popup_vue_app_alive_until_marker_cleanup.md` に従って実装済み
- `popupclose` では `popupApp.unmount()` しない
- marker と popup app の cleanup をセットで保持する
- `renderMarkers()` とコンポーネント破棄時に popup app を `unmount()` する

確認観点:

- 同じ marker の popup を開く、閉じる、再度開く操作で中身が表示される
- 別 marker の popup も正しく表示される
- 「詳細を見る」から投稿詳細モーダルを開ける
- 「このエリアで再検索」後に古い popup app が残らない

確認結果:

- 動作確認 OK

### P1: ズーム操作時エラーの再発確認を行う
対象:

- `src/components/post/PostMap.vue`

対応状況:

- `map`、`markers`、`zoomControl` は `shallowRef` / `markRaw` で扱うように変更済み
- 地図操作ごとの自動 API 取得をやめ、「このエリアで再検索」方式へ変更済み
- 連続ズーム操作時のエラー解消を確認済み

確認観点:

- ズームイン / ズームアウトを連続実行しても `_latLngToNewLayerPoint` エラーが出ない
- パンやズームだけでは API が実行されない
- 「このエリアで再検索」押下時のみ API が実行される
- 再検索後に marker が更新される

確認結果:

- 動作確認 OK

### P2: 長期的に Leaflet popup から Vue/Vuetify overlay へ移行するか検討する
対象:

- `src/components/post/PostMap.vue`
- `src/components/post/PostPopup.vue`

背景:

- Leaflet popup 内に Vue app を mount する構造は、Leaflet と Vue の DOM lifecycle が重なりやすい
- 長期的には marker click で `selectedPost` を更新し、投稿プレビューは Vue/Vuetify の `v-bottom-sheet` や overlay で表示する方が保守しやすい

検討内容:

- PC は地図上カード、モバイルは bottom sheet にするか
- `PostPopup.vue` を Vue overlay 用コンポーネントとして再利用できるか
- Leaflet popup を完全に廃止するか

## モバイル対応

### P0: モバイル対応状況ドキュメントを現状に更新する
対象:

- `docs/todo/mobile_responsive_status.md`

現状:

- `Search`、`MyPage`、投稿詳細モーダル、返信モーダル、投稿作成モーダル、Map は実装済みまたは一部対応済み
- しかし `mobile_responsive_status.md` では未対応として残っている項目がある

対応方針:

- 実装済み項目を `対応済み` に移動する
- 残課題を実機確認・改善課題として再整理する
- Leaflet の popup 空白化とズーム確認は Leaflet 関連 TODO に寄せる

### P1: `375px` / `390px` / `768px` で主要画面の実機・DevTools 確認を行う
対象画面:

- `/login`
- `/timeline`
- `/search`
- `/mypage`
- `/map`

確認観点:

- `375px` 幅で横スクロールが発生しない
- `390px` 幅で主要導線が無理なく操作できる
- `768px` 境界で 1 カラム / 複数カラムの切り替えが自然である
- ヘッダーの検索、メニュー、MyPage 導線が各画面で利用できる
- FAB、モーダル、再検索ボタンが操作しやすい

### P1: モーダル表示時の操作性を確認する
対象:

- `src/components/login/RegisterModal.vue`
- `src/components/layout/SideUserActions.vue`
- `src/components/post/detail/PostDetailModal.vue`
- `src/components/post/detail/ReplyModal.vue`

確認観点:

- モバイル時に fullscreen 表示される
- 入力欄、アクションボタン、閉じる導線が画面内で操作できる
- キーボード表示時に入力欄や送信ボタンが大きく隠れない
- 投稿作成モーダルで画像選択、プレビュー、コメント入力が問題なくできる

### P1: マップ画面のモバイル操作性を確認する
対象:

- `src/entries/map/App.vue`
- `src/components/post/PostMap.vue`
- `src/components/post/PostPopup.vue`

確認観点:

- モバイル時に footer が非表示になり、地図領域が十分に確保される
- ズームコントロールが右下に表示される
- 「このエリアで再検索」ボタンがヘッダーやズームコントロールと干渉しない
- marker popup がモバイル幅で見切れない
- 投稿詳細モーダルが fullscreen で表示される

### P2: 残っている scoped CSS の扱いを確認する
対象例:

- `src/components/layout/SideUserActions.vue`
- `src/components/post/PostMap.vue`
- `src/components/post/PostPopup.vue`
- `src/components/post/detail/CommentThread.vue`
- `src/components/post/detail/PostDetailContent.vue`

方針:

- 空の `<style scoped>` は削除済み
- 実 CSS が残っている箇所は、Vuetify utility で置き換え可能か個別に確認する
- Leaflet や line-clamp など、utility だけでは代替しづらいものは scoped CSS を許容する

## 優先順
1. `PostMap.vue` の popup 空白化を ADR 005 の方針で修正する
2. Leaflet ズーム操作と再検索方式の動作確認を行う
3. `docs/todo/mobile_responsive_status.md` を現状に更新する
4. `375px` / `390px` / `768px` で主要画面を確認する
5. モーダルとマップ画面の操作性を実機で確認する
6. scoped CSS の残存箇所を必要に応じて整理する
