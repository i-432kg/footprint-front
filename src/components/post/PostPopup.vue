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
  <div class="post-popup">
    <div v-if="post.imageUrl" class="popup-image-container" @click="openDetailModal" style="cursor: pointer;">
      <img :src="post.imageUrl" alt="Post image" class="popup-image" />
    </div>
    <div class="popup-content">
      <p class="popup-text">{{ post.comment }}</p>
      <div class="popup-footer">
        <small>{{ formatDate(post.createdAt) }}</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-popup {
  max-width: 250px;
  min-width: 150px;
}

.popup-image-container {
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 4px;
}

.popup-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.popup-text {
  margin: 4px 0;
  word-break: break-all;
  white-space: pre-wrap;
}

.popup-footer {
  margin-top: 8px;
  color: #666;
  border-top: 1px solid #eee;
  padding-top: 4px;
}
</style>
