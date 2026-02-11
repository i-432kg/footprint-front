<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

import TheHeader from '@/components/layout/Header.vue';
import PostDetailModal from '@/components/post/PostDetailModal.vue';
import { useDateFormatter } from "@/composables/useDateFormatter.js";

/**
 * タイムライン画面（メインエントリーポイント）
 *
 * 役割:
 * - 投稿一覧の表示（リスト/グリッド切り替え）
 * - ユーザー情報の表示と新規投稿への導線（右サイドバー）
 * - 各種モーダル（新規投稿・投稿詳細）の制御
 */
const { formatDate } = useDateFormatter();

/** サーバーから取得した投稿データの配列 */
const posts = ref([]);

/** ログイン中のユーザー名（右サイドバー表示用） */
const username = ref('ゲスト');

/** 投稿詳細モーダルで表示するために選択された投稿オブジェクト */
const selectedPost = ref(null);

/** 新規投稿モーダルの表示フラグ */
const showModal = ref(false);

/** 新規投稿時のテキストコメント（任意） */
const postContent = ref('');

/** 新規投稿用にユーザーが選択した画像ファイル（必須） */
const selectedFile = ref(null);

/**
 * タイムラインの表示形式
 * 'list': 1枚ずつ大きく表示（SNS風）
 * 'grid': 画像をタイル状に並べて表示（ギャラリー風）
 */
const viewMode = ref('list');

// --- コンピューテッド (Computed) ---

/** 画像が選択されていない場合は投稿ボタンを無効化する */
const isPostDisabled = computed(() => !selectedFile.value);

// --- 関数 (Methods) ---

/** 投稿詳細モーダルを開く */
const openDetail = (post) => { selectedPost.value = post; };

/** 投稿詳細モーダルを閉じる */
const closeDetail = () => { selectedPost.value = null; };

/** ファイル選択時に実行され、選択されたファイルを state に保存する */
const onFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

/** 新規投稿をサーバーに送信する */
const submitPost = async () => {
  if (!selectedFile.value) return;
  try {
    const formData = new FormData();
    // コメントは任意なので空文字を許容する
    formData.append('comment', postContent.value || '');
    formData.append('imageFile', selectedFile.value);

    await axios.post('/api/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // フォームリセット
    showModal.value = false;
    postContent.value = '';
    selectedFile.value = null;

    // 最新の投稿一覧を再取得
    const res = await axios.get('/api/posts');
    posts.value = res.data;
  } catch (error) {
    console.error('投稿に失敗しました:', error);
  }
};

/** 初期表示時 */
onMounted(async () => {
  try {
    const [userRes, postsRes] = await Promise.all([
      axios.get('/api/users/me'),
      axios.get('/api/posts')
    ]);
    username.value = userRes.data.name;
    posts.value = postsRes.data;
  } catch (error) {
    console.error('データの取得に失敗しました:', error);
  }
});
</script>

<template>
  <v-app>
    <TheHeader />

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-6">
        <v-row>
          <!-- タイムライン -->
          <v-col cols="12" md="8">
            <v-card variant="flat" class="bg-transparent mb-4">
              <v-row align="center" no-gutters>
                <h2 class="text-h5 font-weight-bold">タイムライン</h2>
                <v-spacer></v-spacer>
                <!-- 表示形式切り替え -->
                <v-btn-toggle v-model="viewMode" mandatory color="primary" density="compact" variant="outlined">
                  <v-btn value="list" icon="mdi-view-list"></v-btn>
                  <v-btn value="grid" icon="mdi-view-grid"></v-btn>
                </v-btn-toggle>
              </v-row>
            </v-card>

            <!-- 読み込み中表示 -->
            <v-row v-if="posts.length === 0" justify="center" class="py-10">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-row>

            <!-- 投稿一覧 -->
            <v-row v-else :dense="viewMode === 'grid'">
              <v-col
                v-for="post in posts"
                :key="post.id"
                :cols="viewMode === 'grid' ? 4 : 12"
                :sm="viewMode === 'grid' ? 3 : 12"
              >
                <v-card
                  :hover="true"
                  @click="openDetail(post)"
                  class="rounded-xl overflow-hidden"
                  :variant="viewMode === 'grid' ? 'flat' : 'elevated'"
                >
                  <v-img
                    v-if="post.imageUrl"
                    :src="post.imageUrl"
                    :aspect-ratio="viewMode === 'grid' ? 1 : undefined"
                    cover
                  ></v-img>

                  <v-card-text v-if="viewMode === 'list'" class="d-flex align-center py-2">
                    <v-icon size="small" color="primary" class="mr-1">mdi-map-marker</v-icon>
                    <span class="text-caption" v-if="post.latitude">
                      {{ post.latitude.toFixed(2) }}, {{ post.longitude.toFixed(2) }}
                    </span>
                    <v-spacer></v-spacer>
                    <span class="text-caption text-medium-emphasis">{{ formatDate(post.createdAt) }}</span>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- サイドバー -->
          <v-col cols="12" md="4" class="hidden-sm-and-down">
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

            <!-- おすすめエリア -->
            <v-card class="pa-4 rounded-xl" border flat>
              <h3 class="text-subtitle-1 font-weight-bold mb-2">おすすめ</h3>
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
