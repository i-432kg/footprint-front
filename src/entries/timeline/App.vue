<script setup>
import { ref, onMounted, computed } from 'vue';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import postService from "@/services/postService.js";

import SideUserActions from '@/components/layout/SideUserActions.vue';
import SideRecommendation from "@/components/layout/SideRecommendation.vue";
import TwoColumnLayout from '@/components/layout/TwoColumnLayout.vue';
import PostCard from '@/components/post/PostCard.vue';
import PostDetailModal from '@/components/post/detail/PostDetailModal.vue';

/**
 * タイムライン画面（メインエントリーポイント）
 *
 * 役割:
 * - 投稿一覧の表示（リスト/グリッド切り替え）
 * - ユーザー情報の表示と新規投稿への導線（右サイドバー）
 * - 各種モーダル（新規投稿・投稿詳細）の制御
 */

/** 投稿詳細モーダルで表示するために選択された投稿オブジェクト */
const selectedPost = ref(null);

/**
 * タイムラインの表示形式
 * 'list': 1枚ずつ大きく表示（SNS風）
 * 'grid': 画像をタイル状に並べて表示（ギャラリー風）
 */
const viewMode = ref('list');

/** グリッド表示時は余白を詰める */
const isDense = computed(() => viewMode.value === 'grid');

// --- 関数 (Methods) ---

/** 投稿詳細モーダルを開く */
const openDetail = (post) => { selectedPost.value = post; };

/** 投稿詳細モーダルを閉じる */
const closeDetail = () => { selectedPost.value = null; };

const scrollObserver = ref(null);

/** 無限スクロールロジック */
const { items: posts, isLoading, hasMore, observe, reset } =
  useInfiniteScroll(async (lastId, pageSize) => {
    return await postService.fetchTimeline(lastId, pageSize);
  }, { pageSize: 10 });

/** 初期表示 */
onMounted(() => {
  // 監視を開始するだけで、Composable内の IntersectionObserver が
  // 自動的に初回(lastId=null)の読み込みをトリガーします。
  observe(scrollObserver.value);
});

/**
 * 再取得処理（投稿成功時など）
 * Composable の reset() を呼ぶだけで、リストが空になり
 * 自動的に最新の1ページ目が読み込まれます。
 */
const refreshPosts = () => {
  reset();
};
</script>

<template>
  <TwoColumnLayout>
    <!-- メインヘッダーエリア -->
    <template #header>
      <v-card variant="flat" class="bg-transparent mb-6">
        <v-row align="center" no-gutters>
          <h2 class="text-h5 font-weight-bold">タイムライン</h2>
          <v-spacer></v-spacer>
          <v-btn-toggle v-model="viewMode" mandatory color="primary" density="compact" variant="outlined">
            <v-btn value="list" icon="mdi-view-list"></v-btn>
            <v-btn value="grid" icon="mdi-view-grid"></v-btn>
          </v-btn-toggle>
        </v-row>
      </v-card>
    </template>

    <!-- メインコンテンツ -->
    <template #main>
      <!-- 投稿リスト -->
      <v-row :dense="isDense">
        <v-col
          v-for="post in posts"
          :key="post.id"
          :cols="isDense ? 4 : 12"
          :sm="isDense ? 3 : 12"
        >
          <PostCard :post="post" :viewMode="viewMode" @click="openDetail" />
        </v-col>
      </v-row>

      <!-- 監視用の目印 ＆ ローダー -->
      <div ref="scrollObserver" class="text-center py-10">
        <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>
        <p v-else-if="!hasMore && posts.length > 0" class="text-caption text-medium-emphasis">
          すべての投稿を表示しました
        </p>
      </div>
    </template>

    <!-- サイドバー -->
    <template #sidebar>
      <SideUserActions @submitted="refreshPosts" />
      <SideRecommendation />
    </template>

    <!-- モーダル類 -->
    <template #modals>
      <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />
    </template>
  </TwoColumnLayout>
</template>
