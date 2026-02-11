<script setup>
import { useDateFormatter } from '@/composables/useDateFormatter';

const props = defineProps(['post']);
const emit = defineEmits(['show-detail']);
const { formatDate } = useDateFormatter();

const openDetailModal = () => {
  emit('show-detail', props.post);
};
</script>

<template>
  <v-card
    variant="flat"
    class="post-popup bg-transparent mx-n3 my-n2"
    max-width="280"
  >
    <!-- 画像 -->
    <v-img
      v-if="post.imageUrl"
      :src="post.imageUrl"
      alt="投稿画像"
      height="140"
      cover
      class="cursor-pointer rounded-t-lg"
      @click="openDetailModal"
    ></v-img>

    <v-card-text class="pa-3">
      <!-- 投稿コメント -->
      <p class="text-body-2 mb-2 text-truncate-2">
        {{ post.comment }}
      </p>

      <v-divider class="mb-2"></v-divider>

      <!-- 日付と詳細リンク -->
      <v-row align="center" no-gutters>
        <span class="text-caption text-medium-emphasis">
          {{ formatDate(post.createdAt) }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="primary"
          size="x-small"
          density="compact"
          class="text-none"
          @click="openDetailModal"
        >
          詳細を見る
        </v-btn>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.post-popup {
  min-width: 180px;
}

.cursor-pointer {
  cursor: pointer;
}

/* 2行以上のコメントは省略表示する */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
