<script setup>
import { useDateFormatter } from "@/composables/useDateFormatter.js";

/**
 * 投稿詳細の「投稿本体（画像・本文・メタ情報）」だけを表示するコンポーネント
 *
 * - 投稿の画像、本文（コメント）、緯度経度、投稿日時を表示する
 * - 「投稿への返信」ボタンが押されたら、親へ通知する
 */
defineProps({
  // 投稿詳細データ
  post: { type: Object, required: true }
});

const emit = defineEmits(['reply']);

const { formatDate } = useDateFormatter();
</script>

<template>
  <v-container class="pa-0">
    <!-- 画像エリア -->
    <v-card v-if="post.hasImages" variant="flat" color="black" class="rounded-xl overflow-hidden mb-4">
      <v-carousel
        v-if="post.images.length > 1"
        hide-delimiter-background
        show-arrows="hover"
        height="auto"
      >
        <v-carousel-item
          v-for="image in post.images"
          :key="image.id"
        >
          <v-img
            :src="image.url"
            alt="投稿画像"
            max-height="500"
            width="100%"
            cover
          ></v-img>
        </v-carousel-item>
      </v-carousel>
      <v-img
        v-else
        :src="post.mainImageUrl"
        alt="投稿画像"
        max-height="500"
        width="100%"
        cover
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
          </v-row>
        </template>
      </v-img>
    </v-card>

    <!-- 情報エリア -->
    <div class="px-2">
      <!-- 投稿本文 -->
      <p class="text-body-1 mb-4" style="white-space: pre-wrap; line-height: 1.6;">
        {{ post.caption }}
      </p>

      <!-- 緯度経度表示 -->
      <v-chip
        v-if="post.hasLocation"
        size="small"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-map-marker"
        class="mb-6"
      >
        {{ post.location.lat.toFixed(4) }}, {{ post.location.lng.toFixed(4) }}
      </v-chip>

      <!-- メタ情報とアクション -->
      <v-row align="center" no-gutters>
        <span class="text-caption text-medium-emphasis">
          {{ formatDate(post.createdAt) }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          prepend-icon="mdi-reply"
          size="small"
          @click="emit('reply')"
        >
          返信する
        </v-btn>
      </v-row>
    </div>
  </v-container>
</template>
