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
    const userRes = await axios.get('/api/me');
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
  <div class="app-wrapper">
    <TheHeader />

    <div class="main-layout">
      <!-- 左カラム: 検索結果 -->
      <main class="timeline-column">
        <div class="timeline-header">
          <h2>「{{ query }}」の検索結果</h2>
        </div>

        <div v-if="posts.length === 0 && !isLoading" class="no-results">
          一致する投稿は見つかりませんでした。
        </div>

        <div class="post-container view-list">
          <article
            v-for="post in posts"
            :key="post.id"
            class="post-card"
            @click="openDetail(post)"
          >
            <div class="post-body">
              <img v-if="post.imageUrl" :src="post.imageUrl" alt="投稿画像" class="post-image"/>
              <p class="post-comment">{{ post.comment }}</p>
            </div>
            <div class="post-footer">
              <span class="location" v-if="post.latitude">
                📍 {{ post.latitude.toFixed(4) }}, {{ post.longitude.toFixed(4) }}
              </span>
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            </div>
          </article>
        </div>

        <div ref="observerTarget" class="scroll-observer">
          <div v-if="isLoading" class="loading-spinner">読み込み中...</div>
          <div v-if="!hasMore && posts.length > 0" class="end-message">すべての検索結果を表示しました</div>
        </div>
      </main>

      <!-- 右カラム: サイドバー -->
      <aside class="side-column">
        <section class="user-card">
          <p class="welcome-msg">こんにちは <strong>{{ username }}</strong> さん</p>
          <button class="primary-btn" @click="showModal = true">今どうしてる？</button>
        </section>

        <section class="side-section">
          <h3>検索オプション</h3>
          <div class="placeholder-text">期間指定など（予定）</div>
        </section>
      </aside>
    </div>

    <!-- 投稿詳細モーダル -->
    <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-window">
        <h3>新規投稿</h3>
        <div class="modal-file-input">
          <label>画像を選択（必須）: </label>
          <input type="file" accept="image/*" @change="onFileChange"/>
        </div>
        <textarea v-model="postContent" rows="4" placeholder="コメントを入力（任意）"></textarea>
        <div class="modal-footer">
          <button @click="showModal = false">キャンセル</button>
          <button :disabled="isPostDisabled" @click="submitPost">投稿する</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  padding: 24px 20px;
}
.timeline-header {
  margin-bottom: 20px;
}
.post-container.view-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.post-card {
  padding: 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
}
.post-image {
  max-width: 100%;
  border-radius: 8px;
  display: block;
}
.post-comment {
  margin-top: 12px;
  white-space: pre-wrap;
}
.post-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
}
.side-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.user-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  text-align: center;
}
.scroll-observer {
  padding: 40px 0;
  text-align: center;
}
</style>
