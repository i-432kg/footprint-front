<script setup>
import { useDateFormatter } from "@/composables/useDateFormatter.js";

/**
 * 投稿詳細の「投稿本体（画像・本文・メタ情報）」だけを表示するコンポーネント
 *
 * - 投稿の画像、本文（コメント）、緯度経度、投稿日時を表示する
 * - 「投稿への返信」ボタンが押されたら、親へ通知する
 */
const props = defineProps({
  // 投稿詳細データ
  post: { type: Object, required: true }
});

const emit = defineEmits(['reply']);

const { formatDate } = useDateFormatter();
</script>

<template>
  <div class="post-detail-content">
    <!-- 画像 -->
    <div class="post-image-container" v-if="post.imageUrl">
      <img :src="post.imageUrl" alt="投稿画像" class="post-main-image" />
    </div>

    <div class="post-info">
      <!-- 投稿コメント -->
      <p class="post-caption">{{ post.comment }}</p>

      <!-- 緯度経度表示 -->
      <div class="post-location" v-if="post.latitude">
        📍 {{ post.latitude.toFixed(4) }}, {{ post.longitude.toFixed(4) }}
      </div>

      <!-- メタ情報とアクション -->
      <div class="post-meta">
        <span class="date">{{ formatDate(post.createdAt) }}</span>
        <button class="btn-text" @click="emit('reply')">返信する</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* コンポーネント全体のコンテナ */
.post-detail-content {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 20px;
  margin-bottom: 20px;
}

/* メイン画像のスタイル */
.post-main-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  background-color: #000;
  border-radius: 12px;
  margin-bottom: 16px;
  display: block;
}

/* 投稿本文 */
.post-caption {
  font-size: 1.1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0 0 12px 0;
}

/* 緯度経度の表示 */
.post-location {
  font-size: 0.9rem;
  color: var(--primary-color);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 日付とボタンの横並び */
.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
