<script setup>
import { ref, onMounted } from 'vue';
import { useMobileLayout } from '@/composables/useMobileLayout';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import postService from "@/services/postService.js";

import SideUserActions from '@/components/layout/SideUserActions.vue';
import SideSearchOption from "@/components/layout/SideSearchOption.vue";
import TwoColumnLayout from '@/components/layout/TwoColumnLayout.vue';
import SearchResultItem from '@/components/post/SearchResultItem.vue';
import PostDetailModal from '@/components/post/detail/PostDetailModal.vue';

/**
 * モバイル向け検索結果画面レイアウトかどうか。
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileSearch } = useMobileLayout();

/**
 * 投稿詳細モーダルで表示するために選択された投稿オブジェクト。
 * @type {import('vue').Ref<Object|null>}
 */
const selectedPost = ref(null);

/**
 * URL から取得した検索クエリ。
 * @type {string}
 */
const query = new URLSearchParams(window.location.search).get('q') || '';

/**
 * 無限スクロール監視対象の DOM 要素。
 * @type {import('vue').Ref<HTMLElement|null>}
 */
const scrollObserver = ref(null);

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
 * 検索結果一覧の無限スクロール状態と制御関数。
 */
const {items: posts, isLoading, hasMore, observe} =
  useInfiniteScroll(async (lastId, pageSize) => {
    if (!query) return [];
    return await postService.search(query, lastId, pageSize);
  }, { pageSize: 10 });

onMounted( () => {
  // マウント時に Composable に DOM を渡して監視を開始
  observe(scrollObserver.value);
});
</script>

<template>
  <TwoColumnLayout>
    <!-- メインヘッダーエリア -->
    <template #header>
      <v-card variant="flat" class="bg-transparent mb-4 mb-md-6">
        <p class="text-caption text-medium-emphasis mb-1">検索結果</p>
        <h2
          class="font-weight-bold search-title"
          :class="isMobileSearch ? 'text-h6' : 'text-h5'"
        >
          「{{ query }}」
        </h2>
      </v-card>
    </template>

    <!-- メインコンテンツ -->
    <template #main>
      <!-- 投稿リスト -->
      <v-row v-if="posts.length > 0" :dense="isMobileSearch">
        <v-col v-for="post in posts" :key="post.id" cols="12">
          <SearchResultItem :post="post" @click="openDetail" />
        </v-col>
      </v-row>

      <!-- 監視用の目印 ＆ ローダー -->
      <div
        ref="scrollObserver"
        class="text-center"
        :class="isMobileSearch ? 'py-6' : 'py-10'"
      >
        <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>

        <v-alert
          v-else-if="posts.length === 0"
          type="info"
          variant="tonal"
          class="rounded-xl"
          :density="isMobileSearch ? 'compact' : 'default'"
        >
          一致する投稿は見つかりませんでした。
        </v-alert>

        <p v-else-if="!hasMore" class="text-caption text-medium-emphasis">
          すべての検索結果を表示しました
        </p>
      </div>
    </template>

    <!-- サイドバー -->
    <template #sidebar>
      <SideUserActions />
      <SideSearchOption />
    </template>

    <!-- モーダル類 -->
    <template #modals>
      <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />
    </template>
  </TwoColumnLayout>
</template>

<style scoped>
.search-title {
  overflow-wrap: anywhere;
}
</style>
