# Leaflet ズーム操作時エラー調査メモ

## 事象
地図画面で拡大・縮小操作を行うと、以下のエラーが発生する。

```text
leaflet.js?v=dc8381e7:6731 Uncaught TypeError: Cannot read properties of null (reading '_latLngToNewLayerPoint')
    at Proxy._animateZoom
    at Proxy.fire
    at Proxy._animateZoom
```

## 発生箇所
Leaflet 1.9.4 の `Marker._animateZoom()` 相当の処理で、マーカーが保持する `this._map` が `null` の状態で `_latLngToNewLayerPoint()` を呼び出している。

意味としては、Leaflet 側ではズームアニメーション対象としてマーカーを扱っているが、そのマーカーはすでに map から外れている状態になっている。

## 関連コード
対象コンポーネント:

- `src/components/post/PostMap.vue`

特に関係がありそうな処理:

```js
markers.value.forEach(marker => map.value.removeLayer(marker));
markers.value = [];
```

`renderMarkers()` では、投稿一覧を再取得するたびに既存マーカーをすべて削除し、新しいマーカーを作り直している。

また、`moveend` イベントごとに `fetchPosts()` を呼び出し、API 取得完了後に `renderMarkers()` を実行している。

## 推定原因

### 1. ズーム中にマーカー削除・再作成が走っている可能性
ズーム操作や地図移動のたびに `moveend` が発火し、非同期で投稿取得が行われる。

連続してズーム操作を行った場合、前回の `fetchPosts()` が遅れて返ってきて、Leaflet のズームアニメーション中に `renderMarkers()` が走る可能性がある。

その結果、ズームアニメーション対象だったマーカーが `removeLayer()` により map から外される。
しかし Leaflet 側のズームイベント処理では、そのマーカーに対して `_animateZoom()` が呼ばれ、`this._map === null` のためエラーになると考えられる。

### 2. Leaflet インスタンスが Vue の通常 `ref` に入っている
現在、Leaflet の `Map` や `Marker` を Vue の通常 `ref` に保持している。

```js
const map = ref(null);
const markers = ref([]);
const zoomControl = ref(null);
```

Leaflet の `Map` / `Marker` は内部状態を多く持つ外部クラスであり、Vue のリアクティブ Proxy 化と相性がよくない。

エラースタックにも `Proxy._animateZoom` と出ているため、Leaflet オブジェクトが Vue Proxy 経由で扱われている可能性が高い。

### 3. 今回のモバイル対応で表面化した可能性
今回、モバイル対応として以下を追加した。

- Leaflet の `zoomControl` を明示的に作成
- モバイル時にズームコントロールを右下へ移動
- 地図初期化後に `invalidateSize()` を呼び出し

これら自体が直接原因とは限らない。
ただし、ズーム操作を明示的に触る機会が増えたことで、既存の「全マーカー削除・再作成」と Leaflet のズームアニメーションの競合が表面化した可能性がある。

## 修正候補

### 1. Leaflet インスタンスを `shallowRef` または `markRaw` で扱う
Leaflet の `Map`、`Marker`、`Control` を Vue の深いリアクティブ Proxy 対象にしない。

候補:

- `map` を `shallowRef` にする
- `markers` を `shallowRef` にする
- `L.map()`、`L.marker()`、`L.control.zoom()` の戻り値を `markRaw()` する

### 2. 古い API レスポンスを破棄する
連続ズーム時に古い `fetchPosts()` の結果が後から返ってきても、最新のリクエストでなければ `renderMarkers()` しないようにする。

例:

- request id を採番する
- 最新 request id 以外のレスポンスは捨てる

### 3. ズーム中のマーカー再描画を避ける
Leaflet がズームアニメーション中の間は `renderMarkers()` を実行しない。

候補:

- `zoomstart` でフラグを立てる
- `zoomend` でフラグを戻す
- ズーム中に取得が完了した場合は `zoomend` 後に再描画する

### 4. マーカーの全削除・再作成を差分更新にする
毎回すべてのマーカーを削除せず、投稿 ID ごとに差分更新する。

ただし実装量は増えるため、まずは `shallowRef` / `markRaw` と古いレスポンス破棄を優先するのが現実的。

## 優先度の高い対応案
まずは次の順で対応するのがよい。

1. `map` / `markers` / `zoomControl` を `shallowRef` または `markRaw` で扱う
2. `fetchPosts()` に request id を導入し、古いレスポンスを破棄する
3. それでも再現する場合、ズーム中の `renderMarkers()` を抑制する

## 確認観点
- ズームイン / ズームアウトを連続で押してもエラーが出ない
- マーカーが消えたままにならない
- ポップアップが表示できる
- 投稿詳細モーダルを開ける
- PC / モバイルの両方でズームコントロールが期待位置に表示される
