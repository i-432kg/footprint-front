<script setup>
import { ref, onMounted } from 'vue';
import { useDateFormatter } from "@/composables/useDateFormatter.js";
import userService from "@/services/userService.js";

import TheHeader from '@/components/layout/Header.vue';
import PostDetailModal from '@/components/post/detail/PostDetailModal.vue';

const { formatDate } = useDateFormatter();

/** 定数 */
const PAGE_SIZE = 6;

/** ユーザー情報 */
const user = ref({
  username: '',
  postCount: 0,
  replyCount: 0,
  avatarUrl: ''
});

/** 投稿リストの状態管理 */
const myPosts = ref([]);
const isPostsLoading = ref(false);
const hasMorePosts = ref(true);

/** コメントリストの状態管理 */
const myComments = ref([]);
const isCommentsLoading = ref(false);
const hasMoreComments = ref(true);

/** 現在選択されているタブ */
const activeTab = ref('posts');

const selectedPost = ref(null);

const openDetail = (post) => { selectedPost.value = post; };
const closeDetail = () => { selectedPost.value = null; };

/**
 * 投稿を読み込む関数
 */
const loadMorePosts = async () => {
  if (isPostsLoading.value || !hasMorePosts.value) return;

  isPostsLoading.value = true;
  try {
    const lastId = myPosts.value.length > 0 ? myPosts.value[myPosts.value.length - 1].id : null;
    const newPosts = await userService.fetchMyPosts(lastId, PAGE_SIZE);

    if (newPosts && newPosts.length > 0) {
      myPosts.value.push(...newPosts);
      if (newPosts.length < PAGE_SIZE) hasMorePosts.value = false;
    } else {
      hasMorePosts.value = false;
    }
  } catch (error) {
    console.error('投稿の取得に失敗しました:', error);
  } finally {
    isPostsLoading.value = false;
  }
};

/**
 * 返信履歴を読み込む関数
 */
const loadMoreComments = async () => {
  if (isCommentsLoading.value || !hasMoreComments.value) return;

  isCommentsLoading.value = true;
  try {
    const lastId = myComments.value.length > 0 ? myComments.value[myComments.value.length - 1].id : null;
    const newReplies = await userService.fetchMyReplies(lastId, PAGE_SIZE);

    if (newReplies && newReplies.length > 0) {
      myComments.value.push(...newReplies);
      if (newReplies.length < PAGE_SIZE) hasMoreComments.value = false;
    } else {
      hasMoreComments.value = false;
    }
  } catch (error) {
    console.error('返信履歴の取得に失敗しました:', error);
  } finally {
    isCommentsLoading.value = false;
  }
};

onMounted(async () => {
  try {
    // ユーザー情報を取得
    user.value = await userService.fetchMe();

    // 初回の投稿と返信をそれぞれ取得
    await Promise.all([
      loadMorePosts(),
      loadMoreComments()
    ]);

  } catch (error) {
    console.error('データの取得に失敗しました:', error);
  }
});
</script>

<template>
  <v-app>
    <TheHeader />

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-10" style="max-width: 900px;">

        <!-- プロフィールセクション -->
        <v-row align="center" class="mb-8">
          <v-col cols="auto">
            <v-avatar color="primary" size="80" class="text-h4 text-white">
              <v-img v-if="user.avatarUrl" :src="user.avatarUrl"></v-img>
              <span v-else>{{ user?.username?.charAt(0) || '?' }}</span>
            </v-avatar>
          </v-col>
          <v-col>
            <h1 class="text-h4 font-weight-bold mb-2">{{ user.username || '読み込み中...' }}</h1>
            <div class="text-subtitle-1 text-medium-emphasis">
              <span class="mr-6"><strong>{{ user.postCount }}</strong> 投稿</span>
              <span><strong>{{ user.replyCount }}</strong> 返信</span>
            </div>
          </v-col>
        </v-row>

        <!-- コンテンツエリア（タブ切り替え） -->
        <v-card>
          <v-tabs v-model="activeTab" color="primary" grow>
            <v-tab value="posts">自分の投稿</v-tab>
            <v-tab value="comments">返信履歴</v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-window v-model="activeTab">

              <!-- 投稿一覧タブ -->
              <v-window-item value="posts">
                <div v-if="myPosts.length === 0 && !isPostsLoading" class="text-center py-10 text-grey">
                  まだ投稿がありません。
                </div>
                <v-row v-else>
                  <v-col
                    v-for="post in myPosts"
                    :key="post.id"
                    cols="12" sm="6" md="4"
                  >
                    <v-card hover @click="openDetail(post)">
                      <v-img
                        v-if="post.mainImageUrl"
                        :src="post.mainImageUrl"
                        alt="投稿画像"
                        aspect-ratio="1"
                        cover
                      ></v-img>
                      <v-card-subtitle class="py-2 text-caption">
                        {{ formatDate(post.createdAt) }}
                      </v-card-subtitle>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- もっと読み込むボタンエリア -->
                <div class="text-center py-6">
                  <v-btn
                    v-if="hasMorePosts"
                    variant="outlined"
                    color="primary"
                    :loading="isPostsLoading"
                    @click="loadMorePosts"
                    prepend-icon="mdi-plus"
                  >
                    もっと読み込む
                  </v-btn>
                  <div v-else-if="myPosts.length > 0" class="text-caption text-grey">
                    すべての投稿を表示しました
                  </div>
                </div>
              </v-window-item>

              <!-- コメント一覧タブ -->
              <v-window-item value="comments">
                <div v-if="myComments.length === 0 && !isCommentsLoading" class="text-center py-10 text-grey">
                  まだ返信がありません。
                </div>
                <v-list v-else lines="two" class="bg-transparent">
                  <v-list-item
                    v-for="comment in myComments"
                    :key="comment.id"
                    class="mb-4 border rounded-lg bg-white"
                  >
                    <v-list-item-title class="text-subtitle-2 font-weight-bold">
                      投稿 ID: {{ comment.postId }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption mb-2">
                      {{ formatDate(comment.createdAt) }}
                    </v-list-item-subtitle>
                    <p class="text-body-2">{{ comment.message }}</p>
                  </v-list-item>
                </v-list>

                <!-- 返信履歴のもっと読み込むボタンエリア -->
                <div class="text-center py-6">
                  <v-btn
                    v-if="hasMoreComments"
                    variant="outlined"
                    color="primary"
                    :loading="isCommentsLoading"
                    @click="loadMoreComments"
                    prepend-icon="mdi-plus"
                  >
                    もっと読み込む
                  </v-btn>
                  <div v-else-if="myComments.length > 0" class="text-caption text-grey">
                    すべての返信履歴を表示しました
                  </div>
                </div>
              </v-window-item>

            </v-window>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>

    <!-- 投稿詳細モーダル -->
    <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />
  </v-app>
</template>

<style scoped>

</style>
