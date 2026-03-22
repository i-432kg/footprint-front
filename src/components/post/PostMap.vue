<script setup>
import { onMounted, ref, createApp, getCurrentInstance } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import postService from "@/services/postService.js";
import { uiLogger } from '@/utils/logger';
import { LOG_EVENTS } from '@/constants/logEvents';
import vuetify from '@/plugins/vuetify';
import pinia from '@/stores';

import PostPopup from './PostPopup.vue';
import PostDetailModal from './detail/PostDetailModal.vue';

// 404エラー対策 new URL として読み込む
const markerIcon = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href;
const markerIcon2x = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href;
const markerShadow = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href;

// 404エラー対策 独自のアイコン定義にする
const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mapContainer = ref(null);
const map = ref(null);
const posts = ref([]);
const markers = ref([]);
const selectedPost = ref(null);
const isModalOpen = ref(false);

const openDetail = (post) => {
  selectedPost.value = post;
  isModalOpen.value = true;
};

/**
 * 地図の表示範囲に基づいて投稿を取得する
 */
const fetchPosts = async () => {
  if (!map.value) return;

  try {
    const bounds = map.value.getBounds();
    const minLat = bounds.getSouth();
    const maxLat = bounds.getNorth();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();

    // 地図検索APIを呼び出し
    posts.value = await postService.searchMap(minLat, maxLat, minLng, maxLng);

    // 取得した投稿を地図に描画
    renderMarkers();
  } catch (error) {
    console.error('投稿の取得に失敗しました:', error);
  }
};

/**
 * 地図の移動・ズーム終了時のハンドリング
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

  // 移動が終わるたびに範囲内の投稿を再取得
  fetchPosts();
};

// 現在の Vue アプリのインスタンスを取得
const { appContext } = getCurrentInstance();

const renderMarkers = () => {
  if (!map.value) return;

  // 既存のマーカーをすべて削除
  markers.value.forEach(marker => map.value.removeLayer(marker));
  markers.value = [];

  posts.value.forEach(post => {
    if (post.hasLocation) {
      const marker = L.marker([post.location.lat, post.location.lng], { icon: customIcon })
        .addTo(map.value);

      // 後で削除できるように配列に保持
      markers.value.push(marker);

      const container = document.createElement('div');
      const popupApp = createApp(PostPopup, {
        post,
        onShowDetail: (clickedPost) => openDetail(clickedPost)
      });

      popupApp.use(pinia);
      popupApp.use(vuetify);
      popupApp.mount(container);

      marker.bindPopup(container, {
        maxWidth: 280,
        minWidth: 150
      });

      marker.on('popupclose', () => {
        popupApp.unmount();
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
    map.value = L.map(mapContainer.value);

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
  }
});
</script>

<template>
  <v-sheet class="map-wrapper fill-height bg-grey-lighten-3">
    <!-- 投稿マップ -->
    <div ref="mapContainer" class="leaflet-map"></div>

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
  position: relative;
  overflow: hidden;
  min-height: 500px;
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* モーダルが地図の背面に隠れないように z-index を調整 */
:deep(.v-overlay) {
  z-index: 2000;
}
</style>
