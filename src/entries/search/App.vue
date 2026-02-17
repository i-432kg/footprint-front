<script setup>
import { ref, onMounted } from 'vue';
import { useInfiniteScroll } from '@/composables/useInfiniteScroll';
import postService from "@/services/postService.js";

import SideUserActions from '@/components/layout/SideUserActions.vue';
import SideSearchOption from "@/components/layout/SideSearchOption.vue";
import TwoColumnLayout from '@/components/layout/TwoColumnLayout.vue';
import SearchResultItem from '@/components/post/SearchResultItem.vue';
import PostDetailModal from '@/components/post/detail/PostDetailModal.vue';

const selectedPost = ref(null);

// URLから検索クエリを取得
const query = new URLSearchParams(window.location.search).get('q') || '';
const scrollObserver = ref(null);

const openDetail = (post) => { selectedPost.value = post; };
const closeDetail = () => { selectedPost.value = null; };

/** 無限スクロールロジック */
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
      <h2 class="text-h5 font-weight-bold">「{{ query }}」の検索結果</h2>
    </template>

    <!-- メインコンテンツ -->
    <template #main>
      <!-- 投稿リスト -->
      <v-row v-if="posts.length > 0">
        <v-col v-for="post in posts" :key="post.id" cols="12">
          <SearchResultItem :post="post" @click="openDetail" />
        </v-col>
      </v-row>

      <!-- 監視用の目印 ＆ ローダー -->
      <div ref="scrollObserver" class="text-center py-10">
        <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>

        <v-alert v-else-if="posts.length === 0" type="info" variant="tonal" class="rounded-xl">
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
