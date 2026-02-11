<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import TheHeader from '@/components/layout/Header.vue';
import PostDetailModal from '@/components/post/PostDetailModal.vue';
import { useDateFormatter } from "@/composables/useDateFormatter.js";

const { formatDate } = useDateFormatter();

// 無限スクロール用
const posts = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const observerTarget = ref(null);
const lastId = ref(null);
const selectedPost = ref(null);

// ユーザー情報・投稿用
const username = ref('ゲスト');
const showModal = ref(false);
const postContent = ref('');
const selectedFile = ref(null);

// URLから検索クエリを取得
const urlParams = new URLSearchParams(window.location.search);
const query = ref(urlParams.get('q') || '');

const isPostDisabled = computed(() => !selectedFile.value);

const openDetail = (post) => { selectedPost.value = post; };
const closeDetail = () => { selectedPost.value = null; };

const onFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

/** 検索結果取得 */
const fetchSearchResults = async () => {
  if (isLoading.value || !hasMore.value || !query.value) return;
  isLoading.value = true;
  try {
    const res = await axios.get('/api/posts/search', {
      params: { keyword: query.value, lastId: lastId.value, size: 10 }
    });
    const newPosts = res.data;
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

/** 新規投稿送信 */
const submitPost = async () => {
  if (!selectedFile.value) return;
  try {
    const formData = new FormData();
    formData.append('comment', postContent.value || '');
    formData.append('imageFile', selectedFile.value);
    await axios.post('/api/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    showModal.value = false;
    postContent.value = '';
    selectedFile.value = null;
    alert('投稿しました！');
  } catch (error) {
    console.error('投稿失敗:', error);
  }
};

onMounted(async () => {

  try {
    const userRes = await axios.get('/api/users/me');
    username.value = userRes.data.name;
  } catch (e) { console.error(e); }

  await fetchSearchResults();

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) fetchSearchResults();
  }, { threshold: 0.1 });
  if (observerTarget.value) observer.observe(observerTarget.value);
});
</script>

<template>
  <v-app>
    <TheHeader />

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-6">
        <v-row>
          <!-- 検索結果 -->
          <v-col cols="12" md="8">
            <h2 class="text-h5 font-weight-bold mb-6">「{{ query }}」の検索結果</h2>

            <v-alert
              v-if="posts.length === 0 && !isLoading"
              type="info"
              variant="tonal"
              text="一致する投稿は見つかりませんでした。"
              class="rounded-xl"
            ></v-alert>

            <!-- 検索結果一覧 -->
            <v-row>
              <v-col v-for="post in posts" :key="post.id" cols="12">
                <v-card
                  hover
                  @click="openDetail(post)"
                  class="rounded-xl overflow-hidden"
                >
                  <v-card-text class="pa-4">
                    <v-row>
                      <v-col v-if="post.imageUrl" cols="12" sm="4">
                        <v-img :src="post.imageUrl" cover rounded="lg" aspect-ratio="1.5"></v-img>
                      </v-col>
                      <v-col :cols="post.imageUrl ? 12 : 12" :sm="post.imageUrl ? 8 : 12">
                        <p class="text-body-1 mb-4">{{ post.comment }}</p>
                        <v-row align="center" no-gutters class="text-caption text-medium-emphasis">
                          <v-icon size="x-small" color="primary" class="mr-1">mdi-map-marker</v-icon>
                          <span v-if="post.latitude">
                            {{ post.latitude.toFixed(4) }}, {{ post.longitude.toFixed(4) }}
                          </span>
                          <v-spacer></v-spacer>
                          <span>{{ formatDate(post.createdAt) }}</span>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- 無限スクロールオブザーバー -->
            <div ref="observerTarget" class="text-center py-10">
              <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>
              <p v-if="!hasMore && posts.length > 0" class="text-caption text-medium-emphasis">
                すべての検索結果を表示しました
              </p>
            </div>
          </v-col>

          <!-- サイドバー -->
          <v-col cols="12" md="4" class="hidden-sm-and-down">
            <!-- 投稿エリア -->
            <v-card class="pa-4 rounded-xl mb-4" border flat>
              <v-list-item class="px-0">
                <template v-slot:prepend>
                  <v-avatar color="primary">{{ username.charAt(0) }}</v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">こんにちは {{ username }} さん</v-list-item-title>
              </v-list-item>
              <v-btn
                block
                color="primary"
                class="mt-4 rounded-pill"
                size="large"
                @click="showModal = true"
              >
                今どうしてる？
              </v-btn>
            </v-card>

            <!-- 検索オプションエリア -->
            <v-card class="pa-4 rounded-xl" border flat>
              <h3 class="text-subtitle-1 font-weight-bold mb-2">検索オプション</h3>
              <p class="text-caption text-medium-emphasis">準備中です...</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- 新規投稿モーダル -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">新規投稿</v-card-title>
        <v-card-text>
          <v-file-input
            label="画像を選択（必須）"
            accept="image/*"
            prepend-icon="mdi-camera"
            variant="filled"
            @change="onFileChange"
            hide-details
            class="mb-4"
          ></v-file-input>
          <v-textarea
            v-model="postContent"
            placeholder="コメントを入力（任意）"
            variant="filled"
            rows="4"
            hide-details
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="showModal = false">キャンセル</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            :disabled="isPostDisabled"
            @click="submitPost"
          >
            投稿する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 投稿詳細モーダル -->
    <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />
  </v-app>
</template>
