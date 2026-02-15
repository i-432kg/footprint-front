<script setup>
import { ref, onMounted } from 'vue';
import postService from "@/services/postService.js";
import userService from "@/services/userService.js";

import SideUserActions from '@/components/layout/SideUserActions.vue';
import SideSearchOption from "@/components/layout/SideSearchOption.vue";
import TwoColumnLayout from '@/components/layout/TwoColumnLayout.vue';
import SearchResultItem from '@/components/post/SearchResultItem.vue';
import PostDetailModal from '@/components/post/detail/PostDetailModal.vue';

// 無限スクロール用
const posts = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const observerTarget = ref(null);
const lastId = ref(null);
const selectedPost = ref(null);

// ユーザー情報
const username = ref('ゲスト');

// URLから検索クエリを取得
const urlParams = new URLSearchParams(window.location.search);
const query = ref(urlParams.get('q') || '');

const openDetail = (post) => { selectedPost.value = post; };
const closeDetail = () => { selectedPost.value = null; };

/** 検索結果取得 */
const fetchSearchResults = async () => {
  if (isLoading.value || !hasMore.value || !query.value) return;
  isLoading.value = true;
  try {
    const newPosts = await postService.search(query.value, lastId.value);
    if (newPosts.length === 0) {
      hasMore.value = false;
    } else {
      lastId.value = newPosts[newPosts.length - 1].id;
      posts.value = [...posts.value, ...newPosts];
      if (newPosts.length < 10) hasMore.value = false;
    }
  } catch (error) {
    console.error('検索失敗:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {

  try {
    const userData = await userService.getMe();
    username.value = userData.name;
  } catch (e) { console.error(e); }

  await fetchSearchResults();

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) fetchSearchResults();
  }, { threshold: 0.1 });
  if (observerTarget.value) observer.observe(observerTarget.value);
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
      <v-alert
        v-if="posts.length === 0 && !isLoading"
        type="info"
        variant="tonal"
        text="一致する投稿は見つかりませんでした。"
        class="rounded-xl mb-6"
      ></v-alert>

      <v-row>
        <v-col v-for="post in posts" :key="post.id" cols="12">
          <SearchResultItem :post="post" @click="openDetail" />
        </v-col>
      </v-row>

      <div ref="observerTarget" class="text-center py-10">
        <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>
        <p v-if="!hasMore && posts.length > 0" class="text-caption text-medium-emphasis">
          すべての検索結果を表示しました
        </p>
      </div>
    </template>

    <!-- サイドバー -->
    <template #sidebar>
      <SideUserActions :username="username" />
      <SideSearchOption />
    </template>

    <!-- モーダル類 -->
    <template #modals>
      <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />
    </template>
  </TwoColumnLayout>
</template>
