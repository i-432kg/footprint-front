<script setup>
import { useDateFormatter } from "@/composables/useDateFormatter.js";

defineProps({
  post: { type: Object, required: true },
  viewMode: { type: String, default: 'list' } // 'list' | 'grid'
});

const emit = defineEmits(['click']);
const { formatDate } = useDateFormatter();
</script>

<template>
  <v-card
    hover
    @click="emit('click', post)"
    class="rounded-xl overflow-hidden"
    :variant="viewMode === 'grid' ? 'flat' : 'elevated'"
  >
    <v-img
      v-if="post.mainImageUrl"
      :src="post.mainImageUrl"
      :aspect-ratio="viewMode === 'grid' ? 1 : undefined"
      cover
    ></v-img>

    <!-- リスト表示の時だけ下部に情報を出す -->
    <v-card-text v-if="viewMode === 'list'" class="d-flex align-center py-2 px-3">
      <v-icon size="x-small" color="primary" class="mr-1">mdi-map-marker</v-icon>
      <span class="text-caption text-medium-emphasis" v-if="post.hasLocation">
        {{ post.location.lat.toFixed(2) }}, {{ post.location.lng.toFixed(2) }}
      </span>
      <v-spacer></v-spacer>
      <span class="text-caption text-medium-emphasis">{{ formatDate(post.createdAt) }}</span>
    </v-card-text>
  </v-card>
</template>
