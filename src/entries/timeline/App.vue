<script setup>
import { ref, onMounted } from 'vue';
import postService from "@/services/postService.js";
import userService from '@/services/userService';

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

/** サーバーから取得した投稿データの配列 */
const posts = ref([]);

/** ログイン中のユーザー名（右サイドバー表示用） */
const username = ref('ゲスト');

/** 投稿詳細モーダルで表示するために選択された投稿オブジェクト */
const selectedPost = ref(null);

/**
 * タイムラインの表示形式
 * 'list': 1枚ずつ大きく表示（SNS風）
 * 'grid': 画像をタイル状に並べて表示（ギャラリー風）
 */
const viewMode = ref('list');

// --- 関数 (Methods) ---

/** 投稿詳細モーダルを開く */
const openDetail = (post) => { selectedPost.value = post; };

/** 投稿詳細モーダルを閉じる */
const closeDetail = () => { selectedPost.value = null; };

/**
 * 投稿一覧を再取得する
 *
 * @returns {Promise<void>}
 */
const refreshPosts = async () => {
  posts.value = await postService.fetchTimeline();
};

/** 初期表示時 */
onMounted(async () => {
  try {
    const [userData, timelinePosts] = await Promise.all([
      userService.getMe(),
      postService.fetchTimeline()
    ]);

    username.value = userData.name;
    posts.value = timelinePosts;

  } catch (error) {
    console.error('データの取得に失敗しました:', error);
  }
});
</script>

<template>
  <TwoColumnLayout>
    <!-- メインヘッダーエリア -->
    <template #header>
      <v-card variant="flat" class="bg-transparent">
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
      <v-row v-if="posts.length === 0" justify="center" class="py-10">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-row>

      <v-row v-else :dense="viewMode === 'grid'">
        <v-col
          v-for="post in posts"
          :key="post.id"
          :cols="viewMode === 'grid' ? 4 : 12"
          :sm="viewMode === 'grid' ? 3 : 12"
        >
          <PostCard :post="post" :viewMode="viewMode" @click="openDetail" />
        </v-col>
      </v-row>
    </template>

    <!-- サイドバー -->
    <template #sidebar>
      <SideUserActions :username="username" @submitted="refreshPosts" />
      <SideRecommendation />
    </template>

    <!-- モーダル類 -->
    <template #modals>
      <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />
    </template>
  </TwoColumnLayout>
</template>
