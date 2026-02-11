<script setup>
import { onMounted, ref, render, h, getCurrentInstance} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import PostPopup from './PostPopup.vue';
import PostDetailModal from './PostDetailModal.vue';

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
const selectedPost = ref(null);
const isModalOpen = ref(false);

const openDetail = (post) => {
  selectedPost.value = post;
  isModalOpen.value = true;
};

const fetchPosts = async () => {
  try {
    const response = await axios.get('/api/posts');
    posts.value = response.data;

    // 取得した投稿を地図に描画
    renderMarkers();
  } catch (error) {
    console.error('投稿の取得に失敗しました:', error);
  }
};

// 現在の Vue アプリのインスタンスを取得
const { appContext } = getCurrentInstance();

const renderMarkers = () => {
  if (!map.value) return;

  posts.value.forEach(post => {
    if (post.latitude && post.longitude) {

      const marker = L.marker([post.latitude, post.longitude], { icon: customIcon })
        .addTo(map.value);

      // Leaflet内部でPostPopupを利用するための設定
      const container = document.createElement('div');
      const vnode = h(PostPopup, {
        post,
        onShowDetail: (clickedPost) => openDetail(clickedPost)
      });
      vnode.appContext = appContext;
      render(vnode, container);

      marker.bindPopup(container, {
        maxWidth: 280,
        minWidth: 150
      });
    }
  });
};

onMounted(() => {
  // 地図の初期化
  if (mapContainer.value) {
    const initialCenter = [35.6852, 139.7528] // 皇居
    const initialZoom = 12; // 都道府県〜市区町村くらいの拡大倍率
    map.value = L.map(mapContainer.value).setView(initialCenter, initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.value);

    // 初期表示時：投稿データを取得
    fetchPosts();
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
