<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import TheHeader from '@/components/layout/Header.vue';
import PostDetailModal from '@/components/post/PostDetailModal.vue';
import { useDateFormatter } from "@/composables/useDateFormatter.js";

const { formatDate } = useDateFormatter();

/** ユーザー情報 */
const user = ref({
  name: '読み込み中...',
  postCount: 0,
  commentCount: 0
});

/** 自分の投稿リスト */
const myPosts = ref([]);

/** 自分のコメントリスト */
const myComments = ref([]);

/** 現在選択されているタブ */
const activeTab = ref('posts');

const selectedPost = ref(null);

const openDetail = (post) => { selectedPost.value = post; };
const closeDetail = () => { selectedPost.value = null; };

onMounted(async () => {
  try {
    const [userRes, postsRes, commentsRes] = await Promise.all([
      axios.get('/api/users/me'),
      axios.get('/api/users/me/posts'),
      axios.get('/api/users/me/replies')
    ]);

    user.value = {
      name: userRes.data.name,
      postCount: postsRes.data.length,
      commentCount: commentsRes.data.length
    };
    myPosts.value = postsRes.data;
    myComments.value = commentsRes.data;
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
              {{ user.name.charAt(0) }}
            </v-avatar>
          </v-col>
          <v-col>
            <h1 class="text-h4 font-weight-bold mb-2">{{ user.name }}</h1>
            <div class="text-subtitle-1 text-medium-emphasis">
              <span class="mr-6"><strong>{{ user.postCount }}</strong> 投稿</span>
              <span><strong>{{ user.commentCount }}</strong> コメント</span>
            </div>
          </v-col>
        </v-row>

        <!-- コンテンツエリア（タブ切り替え） -->
        <v-card>
          <v-tabs v-model="activeTab" color="primary" grow>
            <v-tab value="posts">自分の投稿</v-tab>
            <v-tab value="comments">コメント履歴</v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <v-window v-model="activeTab">

              <!-- 投稿一覧タブ -->
              <v-window-item value="posts">
                <div v-if="myPosts.length === 0" class="text-center py-10 text-grey">
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
                        v-if="post.imageUrl"
                        :src="post.imageUrl"
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
              </v-window-item>

              <!-- コメント一覧タブ -->
              <v-window-item value="comments">
                <div v-if="myComments.length === 0" class="text-center py-10 text-grey">
                  まだコメントがありません。
                </div>
                <v-list v-else lines="two" class="bg-transparent">
                  <v-list-item
                    v-for="comment in myComments"
                    :key="comment.id"
                    class="mb-4 border rounded-lg bg-white"
                  >
                    <v-list-item-title class="text-subtitle-2 font-weight-bold">
                      投稿: {{ comment.postTitle || '無題の投稿' }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption mb-2">
                      {{ formatDate(comment.createdAt) }}
                    </v-list-item-subtitle>
                    <p class="text-body-2">{{ comment.content }}</p>
                  </v-list-item>
                </v-list>
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
