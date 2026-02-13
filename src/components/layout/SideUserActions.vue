<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

/**
 * 共通2カラムレイアウト用：ユーザアクションカード
 */
const props = defineProps({
  username: { type: String, required: true }
});

const emit = defineEmits(['submitted']);

// ユーザー情報・投稿用
const showModal = ref(false);
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
    showModal.value = false;
    emit('submitted'); // 投稿成功を親に通知（一覧更新用）
  } catch (error) {
    console.error('投稿失敗:', error);
    alert('投稿に失敗しました。');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <!-- プロフィールカード -->
  <v-card class="pa-4 rounded-xl mb-4" border flat>
    <v-list-item class="px-0">
      <template v-slot:prepend>
        <v-avatar color="primary" class="text-white">{{ username.charAt(0) }}</v-avatar>
      </template>
      <v-list-item-title class="font-weight-bold">こんにちは {{ username }} さん</v-list-item-title>
    </v-list-item>
    <v-btn
      block
      color="primary"
      class="mt-4 rounded-pill"
      size="large"
      @click="showModal = true"
    >
      今どうしてる？
    </v-btn>
  </v-card>

  <!-- 新規投稿モーダル -->
  <v-dialog v-model="showModal" max-width="500">
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
        <v-btn variant="text" rounded="pill" @click="showModal = false">キャンセル</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
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
