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

/** 現在選択されているタブ ('posts' | 'comments') */
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
  <div class="app-wrapper">
    <TheHeader />

    <main class="mypage-container">
      <!-- プロフィールセクション -->
      <section class="profile-header">
        <div class="user-info">
          <div class="avatar-placeholder">{{ user.name.charAt(0) }}</div>
          <div class="user-details">
            <h1>{{ user.name }}</h1>
            <div class="stats">
              <span><strong>{{ user.postCount }}</strong> 投稿</span>
              <span><strong>{{ user.commentCount }}</strong> コメント</span>
            </div>
          </div>
        </div>
      </section>

      <!-- タブナビゲーション -->
      <nav class="tab-nav">
        <button
          :class="['tab-btn', { active: activeTab === 'posts' }]"
          @click="activeTab = 'posts'"
        >
          自分の投稿
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'comments' }]"
          @click="activeTab = 'comments'"
        >
          コメント履歴
        </button>
      </nav>

      <!-- コンテンツエリア -->
      <div class="content-area">
        <!-- 投稿一覧 -->
        <div v-if="activeTab === 'posts'" class="post-grid">
          <div v-if="myPosts.length === 0" class="empty-msg">まだ投稿がありません。</div>
          <article
            v-for="post in myPosts"
            :key="post.id"
            class="post-card"
            @click="openDetail(post)"
          >
            <img v-if="post.imageUrl" :src="post.imageUrl" alt="投稿画像" class="post-image"/>
            <div class="post-info">
              <span class="post-date">{{ formatDate(post.createdAt) }}</span>
            </div>
          </article>
        </div>

        <!-- コメント一覧 -->
        <div v-if="activeTab === 'comments'" class="comment-list">
          <div v-if="myComments.length === 0" class="empty-msg">まだコメントがありません。</div>
          <div
            v-for="comment in myComments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-context">
              <span class="target-post">投稿: {{ comment.postTitle || '無題の投稿' }}</span>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 投稿詳細モーダル -->
    <PostDetailModal v-if="selectedPost" :post="selectedPost" @close="closeDetail" />
  </div>
</template>

<style scoped>
.mypage-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-header {
  margin-bottom: 40px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
}
.avatar-placeholder {
  width: 80px;
  height: 80px;
  background-color: var(--primary-color, #42b983);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}
.user-details h1 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
}
.stats {
  display: flex;
  gap: 20px;
  color: #666;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 24px;
}
.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: bold;
  color: #666;
  position: relative;
}
.tab-btn.active {
  color: var(--primary-color, #42b983);
}
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color, #42b983);
}

.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.post-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}
.post-card:hover {
  transform: translateY(-4px);
}
.post-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.post-info {
  padding: 8px;
  font-size: 0.8rem;
  color: #999;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.comment-item {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color, #42b983);
}
.comment-context {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.85rem;
}
.target-post {
  font-weight: bold;
  color: #555;
}
.comment-date {
  color: #999;
}
.comment-text {
  margin: 0;
  line-height: 1.5;
}

.empty-msg {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
