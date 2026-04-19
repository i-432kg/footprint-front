<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMobileLayout } from '@/composables/useMobileLayout';
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

/**
 * 投稿詳細モーダルで表示するために選択された投稿オブジェクト。
 * @type {import('vue').Ref<Object|null>}
 */
const selectedPost = ref(null);

/**
 * タイムラインの表示形式
 * 'list': 1枚ずつ大きく表示（SNS風）
 * 'grid': 画像をタイル状に並べて表示（ギャラリー風）
 */
const viewMode = ref('list');

/**
 * モバイル向けタイムラインレイアウトかどうか。
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileTimeline } = useMobileLayout();

/**
 * グリッド表示時に余白を詰めるかどうか。
 * `v-row` の `dense` 判定に利用する。
 *
 * @type {import('vue').ComputedRef<boolean>}
 */
const isDense = computed(() => viewMode.value === 'grid');

/**
 * 投稿カード一覧の列数設定。
 * リスト表示では常に 1 列、グリッド表示では
 * モバイル 2 列、`md` 以上で 3 列にする。
 *
 * @type {import('vue').ComputedRef<{ cols: number, sm: number, md: number }>}
 */
const gridColumnConfig = computed(() => {
  return isDense.value ?
    { cols: 6, sm: 6, md: 4 } :
    { cols: 12, sm: 12, md: 12 };
});

// --- 関数 (Methods) ---

/**
 * 投稿詳細モーダルを開く。
 *
 * @param {Object} post - 表示対象の投稿オブジェクト
 */
const openDetail = (post) => { selectedPost.value = post; };

/**
 * 投稿詳細モーダルを閉じる。
 */
const closeDetail = () => { selectedPost.value = null; };

/**
 * 無限スクロール監視対象の DOM 要素。
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const scrollObserver = ref(null);

/**
 * タイムライン一覧の無限スクロール状態と制御関数。
 */
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
      <v-card variant="flat" class="bg-transparent mb-4 mb-md-6">
        <v-row
          no-gutters
          :align="isMobileTimeline ? 'start' : 'center'"
          :class="isMobileTimeline ? 'flex-column gap-3' : ''"
        >
          <h2 class="text-h5 font-weight-bold mb-0">タイムライン</h2>
          <v-spacer v-if="!isMobileTimeline"></v-spacer>
          <v-btn-toggle
            v-model="viewMode"
            mandatory
            color="primary"
            density="compact"
            variant="outlined"
            :class="isMobileTimeline ? 'w-100' : ''"
          >
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
          :cols="gridColumnConfig.cols"
          :sm="gridColumnConfig.sm"
          :md="gridColumnConfig.md"
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
