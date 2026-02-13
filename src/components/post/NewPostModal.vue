
<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  modelValue: { type: Boolean, required: true }
});

const emit = defineEmits(['update:modelValue', 'submitted']);

// ユーザー情報・投稿用
const postContent = ref('');
const selectedFile = ref(null);
const isSubmitting = ref(false);

const isPostDisabled = computed(() => !selectedFile.value || isSubmitting.value);

const onFileChange = (e) => {
  const files = e.target.files;
  if (files.length > 0) selectedFile.value = files[0];
};

/** 新規投稿送信 */
const submitPost = async () => {
  if (!selectedFile.value) return;
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('comment', postContent.value || '');
    formData.append('imageFile', selectedFile.value);

    await axios.post('/api/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    postContent.value = '';
    selectedFile.value = null;
    emit('submitted');
    emit('update:modelValue', false);
    alert('投稿しました！');
  } catch (error) {
    console.error('投稿に失敗しました:', error);
    alert('投稿に失敗しました。');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500">
    <v-card rounded="xl">
      <v-card-title class="font-weight-bold pa-4">新規投稿</v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4">
        <v-file-input
          label="画像を選択（必須）"
          accept="image/*"
          prepend-icon="mdi-camera"
          variant="filled"
          rounded="lg"
          @change="onFileChange"
          hide-details
          class="mb-4"
        ></v-file-input>
        <v-textarea
          v-model="postContent"
          placeholder="コメントを入力（任意）"
          variant="filled"
          rounded="lg"
          rows="4"
          hide-details
        ></v-textarea>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-btn variant="text" rounded="pill" @click="emit('update:modelValue', false)">キャンセル</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          min-width="100"
          :loading="isSubmitting"
          :disabled="isPostDisabled"
          @click="submitPost"
        >
          投稿する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
