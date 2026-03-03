<script setup>
import { useDateFormatter } from "@/composables/useDateFormatter.js";

const props = defineProps({
  post: { type: Object, required: true }
});

const emit = defineEmits(['click']);
const { formatDate } = useDateFormatter();
</script>

<template>
  <v-card hover @click="emit('click', post)" class="rounded-xl overflow-hidden">
    <v-card-text class="pa-4">
      <v-row>
        <!-- 左側：画像 -->
        <v-col v-if="post.mainImageUrl" cols="12" sm="4">
          <v-img :src="post.mainImageUrl" cover rounded="lg" aspect-ratio="1.5"></v-img>
        </v-col>

        <!-- 右側：投稿詳細 -->
        <v-col :cols="post.hasImages ? 12 : 12" :sm="post.hasImages ? 8 : 12">
          <p class="text-body-1 mb-4">{{ post.caption }}</p>
          <v-row align="center" no-gutters class="text-caption text-medium-emphasis">
            <v-icon size="x-small" color="primary" class="mr-1">mdi-map-marker</v-icon>
            <span v-if="post.hasLocation">
              {{ post.location.lat.toFixed(4) }}, {{ post.location.lng.toFixed(4) }}
            </span>
            <v-spacer></v-spacer>
            <span>{{ formatDate(post.createdAt) }}</span>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
