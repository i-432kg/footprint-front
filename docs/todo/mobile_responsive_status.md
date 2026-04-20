# モバイル対応状況と今後の TODO

## 前提
モバイル対応の基準幅は `docs/adr_002_define_mobile_breakpoints_for_responsive_support.md` に従う。

主な確認幅:

- `390px`: iPhone 13 実機基準
- `375px`: 狭めの iPhone 系端末向け下限確認
- `768px`: タブレット縦向き、および 1 カラム / 複数カラム切り替え境界

## 対応済み

### 基盤
- `src/composables/useMobileLayout.js`
- `768px` 未満をモバイルとして扱う判定を共通化済み
- 今後の画面・コンポーネントでは `useMobileLayout()` を利用し、画面ごとの独自ブレークポイントを増やしすぎない

### Header
- `src/components/layout/Header.vue`
- モバイル時に PC 向け横並びナビを非表示化
- `Maps` / `TL` はメニュー内に移動
- 検索欄は虫眼鏡アイコン押下で `v-app-bar` の extension 領域に表示
- `MyPage` 導線は右上に維持

### TwoColumnLayout
- `src/components/layout/TwoColumnLayout.vue`
- PC ではメインカラム + 右サイドバーを維持
- モバイルでは 1 カラム化
- モバイル時に `sidebar` スロットを非表示にせず、メインコンテンツ下へ再配置

### Timeline
- `src/entries/timeline/App.vue`
- モバイル時にヘッダー操作を縦積み化
- 表示切替ボタンをモバイル時に横幅いっぱいで表示
- リスト表示は 1 列を維持
- グリッド表示はモバイル 2 列、`md` 以上で 3 列に調整

### Login
- `src/entries/login/App.vue`
- モバイル時はカード型デザインをやめ、背景と一体化した表示に変更
- PC では従来どおり中央寄せカード表示を維持
- モバイル時は上寄せ、余白縮小、タイトル周りを左寄せに調整

### RegisterModal
- `src/components/login/RegisterModal.vue`
- モバイル時に `fullscreen` 表示へ切り替え
- モバイル時は角丸なし、余白少なめに調整
- PC では従来どおり `max-width="500"` のカード型モーダルを維持

## 未対応・要確認

### Search
- `src/entries/search/App.vue`
- `src/components/post/SearchResultItem.vue`
- `TwoColumnLayout` の 1 カラム化は適用済み
- 検索結果アイテム自体のモバイル表示は未調整
- 画像あり / 画像なしの表示、本文の折り返し、余白を確認する

### MyPage
- `src/entries/mypage/App.vue`
- モバイル対応未着手
- プロフィール行、アバター、投稿数 / 返信数、タブ、カードグリッド、コメント一覧の調整が必要
- `py-10`、`pa-6`、`max-width: 900px` 周辺の余白確認が必要

### Map
- `src/entries/map/App.vue`
- `src/components/post/PostMap.vue`
- モバイル対応未着手
- 地図の高さ、操作 UI、投稿ポップアップ、現在地やズーム操作の実機確認が必要

### 投稿詳細モーダル
- `src/components/post/detail/PostDetailModal.vue`
- `src/components/post/detail/ReplyModal.vue`
- モバイル時の `fullscreen` または準全画面化が未対応
- 画像、本文、コメント、返信入力のスクロール挙動を確認する

### 投稿作成モーダル
- `src/components/layout/SideUserActions.vue`
- `v-dialog max-width="500"` のままで、モバイル対応未着手
- `timeline` / `search` のモバイル利用時に投稿導線として重要
- 画像選択、プレビュー、コメント入力、アクションボタンの配置を確認する

## 優先順位
1. `SideUserActions.vue` の新規投稿モーダルをモバイル対応する
2. `PostDetailModal.vue` と `ReplyModal.vue` をモバイル時 `fullscreen` 寄りにする
3. `search/App.vue` と `SearchResultItem.vue` を調整する
4. `mypage/App.vue` を調整する
5. `map/App.vue` と `PostMap.vue` を実機確認しながら調整する

## 確認観点
- `375px` 幅で横スクロールが発生しない
- `390px` 幅で主要導線が無理なく操作できる
- `768px` 境界で 1 カラム / 複数カラムの切り替えが自然である
- モーダル表示時に入力欄、アクションボタン、閉じる導線が画面内で操作できる
- キーボード表示時にフォーム操作が大きく破綻しない
- `Header` の検索、メニュー、MyPage 導線が各画面で利用できる
