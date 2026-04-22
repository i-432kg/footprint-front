# ADR: Leaflet ポップアップ内 Vue app は marker 削除時に破棄する

## ステータス
Proposed

## 背景
マップ画面では、Leaflet の marker に投稿ポップアップを紐づけている。

現在の実装では、marker ごとに DOM コンテナを作成し、その中へ Vue app として `PostPopup` を mount してから、Leaflet の `bindPopup(container)` に渡している。

```js
const container = document.createElement('div');
const popupApp = createApp(PostPopup, {
  post,
  onShowDetail: (clickedPost) => openDetail(clickedPost)
});

popupApp.use(pinia);
popupApp.use(vuetify);
popupApp.mount(container);

marker.bindPopup(container, options);
```

この構造では、Leaflet が popup content の DOM を管理し、Vue がその DOM 内の UI を管理している。

調査の結果、`popupclose` 時に `popupApp.unmount()` すると、次回同じ marker の popup を開いた時に中身が空白になることが分かった。

原因は、Leaflet が `bindPopup(container)` に渡された DOM を再利用する一方で、Vue app は `popupclose` で破棄されているためである。

詳細は `docs/investigations/leaflet_popup_blank_after_reopen.md` に記録している。

## 問題
- `popupclose` で Vue app を破棄すると、Leaflet が再利用する popup DOM の中身が空になる
- Leaflet popup の DOM lifecycle と Vue app lifecycle が一致していない
- 理想的には、Leaflet popup 内に Vue app を埋め込む設計自体を見直し、Vue/Vuetify 側の overlay や bottom sheet に寄せる方が保守しやすい
- ただし現時点でそこまで変更すると、マップ UI と popup 表示の構造変更が大きくなる

## 決定
暫定対応として、`popupclose` では `PostPopup` 用 Vue app を `unmount()` しない。

marker が存在する間は、対応する Vue app も生かしておく。
marker を削除するタイミングで、対応する Vue app をまとめて `unmount()` する。

これにより、同じ marker の popup を閉じて再度開く場合でも、Leaflet が保持している DOM 内に Vue app が残っているため、空白表示を避ける。

## 設計方針

### 1. marker と popup app をセットで管理する
現在は `markers` に Leaflet marker だけを保持している。

今後は marker 削除時に popup app も破棄できるよう、marker と popup app の対応関係を保持する。

例:

```js
markers.value.push({
  marker,
  popupApp
});
```

または、marker 本体とは別に cleanup 関数を保持する。

```js
markers.value.push({
  marker,
  cleanup: () => popupApp.unmount()
});
```

### 2. `popupclose` では `unmount()` しない
Leaflet は `bindPopup(container)` の DOM を次回表示時にも再利用する。

そのため、popup を閉じるだけでは Vue app を破棄しない。

### 3. marker 削除時に popup app を破棄する
`renderMarkers()` で既存 marker を削除する前に、対応する popup app を `unmount()` する。

その後、Leaflet の marker を map から削除する。

これにより、marker が存在しないのに Vue app だけが残る状態を避ける。

### 4. 長期的には Vue/Vuetify 側の overlay 表示へ寄せる
Leaflet popup 内に Vue app を mount する構造は、Leaflet と Vue の DOM 管理責務が重なりやすい。

長期的には、marker は投稿選択だけを担当し、投稿プレビューは Vue/Vuetify の `v-bottom-sheet`、`v-dialog`、または独自 overlay で表示する方が望ましい。

ただし今回の目的は既存構造を大きく変えずに空白 popup 問題を解消することなので、長期案は採用しない。

## 選択肢

### 案1: `popupclose` では unmount せず、marker 削除時に破棄する
採用。

理由:

- 既存の `bindPopup(container)` 構造を大きく変えずに対応できる
- 同じ marker の popup 再表示時に DOM を再利用できる
- 実装変更が比較的小さい
- marker 削除時に cleanup すれば、Vue app の残存も防げる

### 案2: popup を開くたびに Vue app を mount し、閉じるたびに unmount する
不採用。

理由:

- popup の開閉と Vue app lifecycle が一致するため設計としてはきれい
- ただし、現在の `bindPopup(container)` に固定 DOM を渡す構造とは相性が悪い
- `popupopen` 時に container / app を作成し、popup content を差し替える構造変更が必要
- 今回の暫定対応としては変更範囲が大きい

### 案3: Leaflet popup をやめ、Vue/Vuetify の overlay や bottom sheet で投稿プレビューを表示する
不採用。

理由:

- Vue の lifecycle に完全に乗せられるため、長期的には最も保守しやすい
- モバイル UX とも相性がよい
- ただし、既存の `PostPopup` と Leaflet popup の構造を大きく変更する必要がある
- 現時点では暫定対応として過剰である

## 実装手順
1. `markers` に Leaflet marker だけでなく、popup app の cleanup 情報も保持する
2. `popupclose` で `popupApp.unmount()` している処理を削除する
3. `renderMarkers()` の先頭で既存 marker を削除する際、先に cleanup を実行する
4. cleanup 後に `map.removeLayer(marker)` を実行する
5. popup を開く、閉じる、再度開く操作で中身が表示されることを確認する
6. 「このエリアで再検索」後に古い popup app が残らないことを確認する

## 期待する効果
- 同じ marker の popup を再度開いた時に空白表示にならない
- 既存の Leaflet popup UI を維持できる
- 変更範囲を `PostMap.vue` に限定しやすい
- marker 削除時に Vue app を破棄することで、不要な Vue app の残存を防げる

## 将来の見直し
マップ画面の UI をさらにモバイル最適化する段階では、Leaflet popup 内に Vue app を mount する構造を見直す。

候補:

- marker click で `selectedPost` を更新する
- 投稿プレビューは Vue/Vuetify の `v-bottom-sheet` または overlay で表示する
- PC では地図上カード、モバイルでは bottom sheet に切り替える

この方式に移行すれば、Leaflet は地図と marker の描画に専念し、投稿プレビュー UI は Vue の lifecycle で管理できる。
