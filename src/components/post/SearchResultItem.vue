<script setup>
import { useMobileLayout } from '@/composables/useMobileLayout';
import { useDateFormatter } from "@/composables/useDateFormatter.js";

defineProps({
  post: { type: Object, required: true }
});

const emit = defineEmits(['click']);
const { formatDate } = useDateFormatter();

/**
 * モバイル向け検索結果アイテム表示かどうか。
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileResultItem } = useMobileLayout();
</script>

<template>
  <v-card hover @click="emit('click', post)" class="rounded-xl overflow-hidden">
    <v-card-text :class="isMobileResultItem ? 'pa-3' : 'pa-4'">
      <v-row :dense="isMobileResultItem">
        <!-- 左側：画像 -->
        <v-col v-if="post.mainImageUrl" cols="12" sm="4">
          <v-img
            :src="post.mainImageUrl"
            cover
            rounded="lg"
            :aspect-ratio="isMobileResultItem ? 1.6 : 1.5"
          ></v-img>
        </v-col>

        <!-- 右側：投稿詳細 -->
        <v-col :cols="post.hasImages ? 12 : 12" :sm="post.hasImages ? 8 : 12">
          <p
            class="mb-3 search-result-caption"
            :class="isMobileResultItem ? 'text-body-2' : 'text-body-1'"
          >
            {{ post.caption }}
          </p>

          <div
            class="text-caption text-medium-emphasis search-result-meta"
            :class="isMobileResultItem ? 'flex-column align-start ga-1' : 'align-center'"
          >
            <span v-if="post.hasLocation" class="d-inline-flex align-center">
              <v-icon size="x-small" color="primary" class="mr-1">mdi-map-marker</v-icon>
              {{ post.location.lat.toFixed(4) }}, {{ post.location.lng.toFixed(4) }}
            </span>
            <span>{{ formatDate(post.createdAt) }}</span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.search-result-caption {
  overflow-wrap: anywhere;
}

.search-result-meta {
  display: flex;
  justify-content: space-between;
}
</style>
