<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef, markRaw, createApp } from 'vue';
import { useMobileLayout } from '@/composables/useMobileLayout';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import postService from "@/services/postService.js";
import { uiLogger } from '@/utils/logger';
import { LOG_EVENTS } from '@/constants/logEvents';
import vuetify from '@/plugins/vuetify';
import pinia from '@/stores';

import PostPopup from './PostPopup.vue';
import PostDetailModal from './detail/PostDetailModal.vue';

/**
 * モバイル向け地図表示かどうか。
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileMap } = useMobileLayout();

/**
 * Leaflet 標準マーカー画像の URL。
 * Vite で画像を解決できるように `new URL()` 経由で参照する。
 */
const markerIcon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const markerIcon2x = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
const markerShadow = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

/**
 * Leaflet マーカー用のカスタムアイコン定義。
 * @type {import('leaflet').Icon}
 */
const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * Leaflet の地図をマウントする DOM 要素。
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const mapContainer = ref(null);

/**
 * Leaflet の地図インスタンス。
 * 外部クラスの深い Proxy 化を避けるため `shallowRef` と `markRaw` で扱う。
 *
 * @type {import('vue').ShallowRef<import('leaflet').Map|null>}
 */
const map = shallowRef(null);

/**
 * 現在表示中の投稿一覧。
 * @type {import('vue').Ref<Object[]>}
 */
const posts = ref([]);

/**
 * 地図上に描画している Leaflet マーカーと popup app の cleanup 一覧。
 * 外部クラスの深い Proxy 化を避けるため `shallowRef` と `markRaw` で扱う。
 *
 * @type {import('vue').ShallowRef<{ marker: import('leaflet').Marker, cleanup: Function }[]>}
 */
const markers = shallowRef([]);

/**
 * 投稿詳細モーダルで表示する投稿。
 * @type {import('vue').Ref<Object|null>}
 */
const selectedPost = ref(null);

/**
 * 投稿詳細モーダルの表示状態。
 * @type {import('vue').Ref<boolean>}
 */
const isModalOpen = ref(false);

/**
 * Leaflet のズームコントロール。
 * @type {import('vue').ShallowRef<import('leaflet').Control.Zoom|null>}
 */
const zoomControl = shallowRef(null);

/**
 * 最後に投稿取得した範囲から、地図の表示範囲が変更されたかどうか。
 * `true` の場合は「このエリアで再検索」ボタンを表示する。
 *
 * @type {import('vue').Ref<boolean>}
 */
const hasMoved = ref(false);

/**
 * 地図範囲に基づく投稿取得中かどうか。
 * @type {import('vue').Ref<boolean>}
 */
const isFetching = ref(false);

/**
 * 投稿取得リクエストの最新 ID。
 * 古いレスポンスを地図へ反映しないために利用する。
 *
 * @type {import('vue').Ref<number>}
 */
const latestRequestId = ref(0);

/**
 * 投稿詳細モーダルを開く。
 *
 * @param {Object} post - 表示対象の投稿オブジェクト
 */
const openDetail = (post) => {
  selectedPost.value = post;
  isModalOpen.value = true;
};

/**
 * 現在の地図表示範囲に基づいて投稿を取得し、マーカーを再描画する。
 * 古いリクエストのレスポンスは描画に反映しない。
 *
 * @async
 * @returns {Promise<void>}
 */
const fetchPosts = async () => {
  if (!map.value) return;

  const requestId = latestRequestId.value + 1;
  latestRequestId.value = requestId;
  isFetching.value = true;

  try {
    const bounds = map.value.getBounds();
    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    // 地図検索APIを呼び出し
    const fetchedPosts = await postService.searchMap(minLat, maxLat, minLng, maxLng);

    // 古いリクエストの結果は現在の地図表示に反映しない
    if (requestId !== latestRequestId.value) return;

    posts.value = fetchedPosts;

    // 取得した投稿を地図に描画
    renderMarkers();
    hasMoved.value = false;
  } catch (error) {
    console.error('投稿の取得に失敗しました:', error);
  } finally {
    if (requestId === latestRequestId.value) {
      isFetching.value = false;
    }
  }
};

/**
 * 地図の移動・ズーム終了時のハンドリング。
 * API は呼ばず、表示範囲が変更されたことだけを記録する。
 */
const handleMoveEnd = () => {
  if (!map.value) return;

  const bounds = map.value.getBounds();
  const zoom = map.value.getZoom();

  // bbox ログ
  uiLogger.info(LOG_EVENTS.POST.MAP_MOVE, {
    zoom,
    bbox: {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast()
    }
  });

  // API は自動実行せず、ユーザーに再検索の判断を委ねる
  hasMoved.value = true;
};

/**
 * 現在表示している地図範囲で投稿を再検索する。
 */
const searchCurrentArea = () => {
  fetchPosts();
};

/**
 * 地図上の既存 marker と popup app を破棄する。
 */
const cleanupMarkers = () => {
  if (!map.value) return;

  markers.value.forEach(({ marker, cleanup }) => {
    cleanup();
    map.value.removeLayer(marker);
  });
  markers.value = [];
};

/**
 * 現在の投稿一覧を Leaflet マーカーとして地図へ描画する。
 * 既存マーカーは削除し、投稿一覧に基づいて作り直す。
 */
const renderMarkers = () => {
  if (!map.value) return;

  cleanupMarkers();

  posts.value.forEach(post => {
    if (post.hasLocation) {
      const marker = markRaw(
        L.marker([post.location.lat, post.location.lng], { icon: customIcon })
          .addTo(map.value)
      );

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

      // Leaflet は popup DOM を再利用するため、popupclose では破棄しない。
      markers.value.push({
        marker,
        cleanup: () => popupApp.unmount()
      });
    }
  });
};

onMounted(() => {
  // 地図の初期化
  if (mapContainer.value) {
    const defaultCenter = [35.6852, 139.7528] // 皇居
    const initialZoom = 12; // 都道府県〜市区町村くらいの拡大倍率

    // 地図の初期インスタンス作成
    map.value = markRaw(
      L.map(mapContainer.value, {
        zoomControl: false
      })
    );

    zoomControl.value = markRaw(
      L.control.zoom({
        position: isMobileMap.value ? 'bottomright' : 'topleft'
      }).addTo(map.value)
    );

    // タイルレイヤーの追加
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.value);

    // 現在地の取得を試みる
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.value.setView([latitude, longitude], initialZoom);
          // 位置情報取得後に投稿をロード
          fetchPosts();
        },
        (error) => {
          // 位置情報が取得できなかった場合、デフォルトの中心位置
          console.warn('位置情報の取得に失敗しました。デフォルト位置を表示します:', error.message);
          map.value.setView(defaultCenter, initialZoom);
          fetchPosts();
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      // Geolocation API 非対応の場合、デフォルトの中心位置
      map.value.setView(defaultCenter, initialZoom);
      fetchPosts();
    }

    // 地図移動・ズーム終了イベントの検知を開始
    map.value.on('moveend', handleMoveEnd);

    // レイアウト確定後に Leaflet の表示サイズを再計算する
    requestAnimationFrame(() => {
      map.value?.invalidateSize();
    });
  }
});

onBeforeUnmount(() => {
  cleanupMarkers();
});
</script>

<template>
  <v-sheet class="map-wrapper h-100 bg-grey-lighten-3">
    <!-- 投稿マップ -->
    <div ref="mapContainer" class="leaflet-map"></div>

    <!-- エリア再検索ボタン -->
    <v-btn
      v-if="hasMoved"
      class="map-search-button"
      color="primary"
      rounded="pill"
      elevation="6"
      prepend-icon="mdi-refresh"
      :loading="isFetching"
      @click="searchCurrentArea"
    >
      このエリアで再検索
    </v-btn>

    <!-- 投稿詳細モーダル -->
    <PostDetailModal
      v-if="isModalOpen"
      :post="selectedPost"
      @close="isModalOpen = false"
    />
  </v-sheet>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  min-height: 500px;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-search-button {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  white-space: nowrap;
}
</style>
