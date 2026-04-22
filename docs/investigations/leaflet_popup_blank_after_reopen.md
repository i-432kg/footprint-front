# Leaflet ポップアップ再表示時に空白になる問題の調査メモ

## 事象
マップ画面で投稿ピンを押下してポップアップを表示した後、同じピンを再度押下してポップアップを閉じる。

その後、再び同じピンを押下すると、ポップアップ枠は表示されるが中身が空白になる。

## 関連コード
対象コンポーネント:

- `src/components/post/PostMap.vue`
- `src/components/post/PostPopup.vue`

`PostMap.vue` では、Leaflet の marker ごとに DOM コンテナを作成し、その中へ Vue アプリとして `PostPopup` を mount している。

```js
const container = document.createElement('div');
const popupApp = createApp(PostPopup, {
  post,
  onShowDetail: (clickedPost) => openDetail(clickedPost)
});

popupApp.use(pinia);
popupApp.use(vuetify);
popupApp.mount(container);

marker.bindPopup(container, {
  maxWidth: isMobileMap.value ? 240 : 280,
  minWidth: isMobileMap.value ? 180 : 150
});

marker.on('popupclose', () => {
  popupApp.unmount();
});
```

## 推定原因
Leaflet は `bindPopup(container)` に渡された DOM コンテナを popup content として保持し、同じ marker の popup を開くたびにその DOM を再利用する。

一方、現在の実装では `popupclose` のタイミングで Vue アプリを `unmount()` している。

そのため、初回表示時は以下の流れで正常に表示される。

1. `container` を作成する
2. `PostPopup` を `container` に mount する
3. Leaflet popup に `container` を bind する
4. marker 押下で popup が表示される

しかし popup を閉じると、`popupApp.unmount()` により `container` 内の Vue コンポーネントが破棄される。

その後、同じ marker を再度押下すると、Leaflet は保持している同じ `container` を使って popup を開く。
しかし、その `container` には Vue コンポーネントが mount されていないため、中身が空白になる。

つまり、Leaflet 側の DOM 再利用と Vue アプリの `unmount()` タイミングが噛み合っていないことが原因と考えられる。

## 問題点
- `popupclose` で Vue app を破棄している
- しかし `popupopen` 時に再 mount していない
- Leaflet は popup content の DOM を再利用する
- 結果として、破棄済みの空 DOM が次回表示される

## 修正方針候補

### 案1: `popupclose` で `unmount()` しない
marker が存在する間は popup 用 Vue app も生かしておく。

marker を削除するタイミング、つまり `renderMarkers()` で既存 marker を削除する前に、対応する popup app をまとめて `unmount()` する。

メリット:

- 実装が比較的シンプル
- 同じ marker の popup 再表示で DOM を再利用できる
- Leaflet の popup 再利用挙動と相性がよい

デメリット:

- marker と popup app の対応関係を管理する必要がある
- marker 削除時の cleanup を忘れると Vue app が残る

### 案2: `popupopen` のたびに Vue app を mount し、`popupclose` で unmount する
popup を開くたびに新しい DOM コンテナと Vue app を作る。

メリット:

- popup の開閉と Vue app の lifecycle が一致する
- popup close 時に確実に cleanup できる

デメリット:

- `bindPopup(container)` に固定 DOM を渡す今の構造とは相性が悪い
- `popupopen` ごとに container / app を作り直すため、実装がやや複雑になる
- Leaflet の popup content 更新処理を明示的に扱う必要がある

## 優先度の高い対応案
現状の構造では、まず案1を採用するのが現実的。

具体的には、`popupclose` では `popupApp.unmount()` しない。
代わりに、marker を削除するタイミングで popup app も破棄する。

実装イメージ:

- marker と popup app をセットで保持する
- `renderMarkers()` の先頭で既存 marker を削除する前に、対応する popup app を `unmount()` する
- その後、marker を map から削除する
- 新しい marker 作成時に popup app も作成する

## 確認観点
- 同じ marker の popup を開く、閉じる、再度開く操作で中身が表示される
- 別 marker の popup を開いても正しく内容が切り替わる
- 「詳細を見る」から投稿詳細モーダルを開ける
- 「このエリアで再検索」後も popup が正しく表示される
- 再検索による marker 再描画後に古い popup app が残らない
