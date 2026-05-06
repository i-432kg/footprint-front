# モバイル対応状況と今後の TODO

## 前提
モバイル対応の基準幅は `docs/adr/adr_002_define_mobile_breakpoints_for_responsive_support.md` に従う。

主な確認幅:

- `390px`: iPhone 13 実機基準
- `375px`: 狭めの iPhone 系端末向け下限確認
- `768px`: タブレット縦向き、および 1 カラム / 複数カラム切り替え境界

## 画面別一覧
| 画面 | 状態 | 対応内容 | 残対応 |
| --- | --- | --- | --- |
| `/login` | 完了 | モバイル時はカード型をやめ、背景一体型のログイン画面に調整 | なし |
| `/timeline` | 完了 | ヘッダー操作の縦積み、グリッド 2 列、FAB 投稿導線に対応 | なし |
| `/search` | 完了 | 見出し、検索結果カード、折り返し、余白をモバイル向けに調整 | なし |
| `/mypage` | 完了 | プロフィール、投稿グリッド、返信履歴、余白をモバイル向けに調整 | なし |
| `/map` | 完了 | footer 非表示、地図高さ、再検索方式、ズーム/ポップアップ問題に対応 | Leaflet popup の overlay 化は将来検討 |

## コンポーネント別一覧
| コンポーネント | 状態 | 対応内容 | 残対応 |
| --- | --- | --- | --- |
| `src/composables/useMobileLayout.js` | 完了 | `768px` 未満をモバイルとして扱う判定を共通化 | なし |
| `src/components/layout/TheHeader.vue` | 完了 | モバイルメニュー、検索 extension、MyPage 導線を調整 | なし |
| `src/components/layout/TheFooter.vue` | 完了 | map 画面ではモバイル時に非表示 | なし |
| `src/components/layout/TwoColumnLayout.vue` | 完了 | モバイル時 1 カラム化、sidebar を main 下へ再配置 | なし |
| `src/components/layout/SideUserActions.vue` | 完了 | モバイル時に右下 FAB を表示し、投稿モーダルを fullscreen 化 | scoped CSS の整理余地あり |
| `src/components/login/RegisterModal.vue` | 完了 | モバイル時 fullscreen、余白と角丸を調整 | なし |
| `src/components/post/SearchResultItem.vue` | 完了 | モバイル時の余白、画像、本文、メタ情報を調整 | なし |
| `src/components/post/PostCard.vue` | 完了 | timeline 側の列数制御でモバイル表示を吸収 | なし |
| `src/components/post/PostMap.vue` | 完了 | 地図高さ、再検索方式、ズームエラー、popup 再表示問題に対応 | Leaflet popup の overlay 化は将来検討 |
| `src/components/post/PostPopup.vue` | 完了 | marker popup として表示確認済み | Leaflet popup の overlay 化は将来検討 |
| `src/components/post/detail/PostDetailModal.vue` | 完了 | モバイル時 fullscreen、余白と角丸を調整 | なし |
| `src/components/post/detail/ReplyModal.vue` | 完了 | モバイル時 fullscreen、余白と角丸を調整 | なし |
| `src/components/post/detail/PostDetailContent.vue` | 完了 | fullscreen モーダル内で表示確認済み | scoped CSS の整理余地あり |
| `src/components/post/detail/CommentThread.vue` | 完了 | fullscreen モーダル内で表示確認済み | scoped CSS の整理余地あり |
| `src/components/post/detail/ReplyItem.vue` | 完了 | fullscreen モーダル内で表示確認済み | なし |
| `src/components/layout/SideRecommendation.vue` | 完了 | `TwoColumnLayout` によりモバイルでは main 下へ再配置 | なし |
| `src/components/layout/SideSearchOption.vue` | 完了 | `TwoColumnLayout` によりモバイルでは main 下へ再配置 | なし |

## 対応済み詳細

### 基盤
- `src/composables/useMobileLayout.js`
- `768px` 未満をモバイルとして扱う判定を共通化済み
- 画面・コンポーネントごとの独自ブレークポイント増加を抑制

### Header
- `src/components/layout/TheHeader.vue`
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
- 投稿導線は `SideUserActions.vue` の右下 FAB で提供

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

### Search
- `src/entries/search/App.vue`
- `src/components/post/SearchResultItem.vue`
- 検索結果見出し、空結果表示、ローディング領域の余白を調整
- 検索結果アイテムの画像、本文、メタ情報をモバイル向けに調整
- 長い検索語や投稿本文は `text-break` で折り返し

### MyPage
- `src/entries/mypage/App.vue`
- プロフィール行、アバター、ユーザー名、投稿数 / 返信数をモバイル向けに調整
- 投稿一覧をモバイル時 2 列に調整
- 返信履歴の密度と折り返しを調整
- もっと読み込むボタンをモバイル時 block 表示

### Map
- `src/entries/map/App.vue`
- `src/components/post/PostMap.vue`
- `src/components/post/PostPopup.vue`
- モバイル時は footer を非表示にして地図領域を確保
- `v-main` / `v-container` / map wrapper の高さを `100%` で伝播
- ズームコントロールをモバイル時は右下へ配置
- 地図移動・ズームでは API を自動実行せず、「このエリアで再検索」ボタンから取得
- Leaflet インスタンスは `shallowRef` / `markRaw` で扱い、Vue の深い Proxy 化を回避
- popup 再表示時の空白化は marker 削除時 cleanup 方式で対応

### 投稿・返信モーダル
- `src/components/layout/SideUserActions.vue`
- `src/components/post/detail/PostDetailModal.vue`
- `src/components/post/detail/ReplyModal.vue`
- 投稿作成モーダル、投稿詳細モーダル、返信モーダルはモバイル時 fullscreen 表示
- 余白、角丸、アクション領域をモバイル向けに調整

## 確認結果
- `375px` / `390px` / `768px` で主要画面の確認 OK
- モーダル表示時の操作性確認 OK
- マップ画面のモバイル操作性確認 OK
- Leaflet ズーム操作時エラーの解消確認 OK
- Leaflet popup 再表示時の空白化解消確認 OK

## 残 TODO
| 優先度 | 課題 | 対象 | 内容 |
| --- | --- | --- | --- |
| P2 | scoped CSS の整理 | `SideUserActions.vue`, `PostMap.vue`, `PostPopup.vue`, `CommentThread.vue`, `PostDetailContent.vue` | Vuetify utility で代替可能なものを個別確認する |
| P2 | Leaflet popup の将来設計 | `PostMap.vue`, `PostPopup.vue` | marker は選択のみ担当し、投稿プレビューを Vue/Vuetify overlay や bottom sheet に寄せるか検討する |

## 確認観点
- `375px` 幅で横スクロールが発生しない
- `390px` 幅で主要導線が無理なく操作できる
- `768px` 境界で 1 カラム / 複数カラムの切り替えが自然である
- モーダル表示時に入力欄、アクションボタン、閉じる導線が画面内で操作できる
- キーボード表示時にフォーム操作が大きく破綻しない
- `TheHeader` の検索、メニュー、MyPage 導線が各画面で利用できる
- マップ画面でズーム、パン、再検索、popup 表示、投稿詳細表示が操作できる
