<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

/**
 * - postId: どの投稿に紐づく返信か
 * - parentReplyId: どの返信に対する返信か（null の場合は「投稿への返信」= 親返信）
 */
const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  },
  parentReplyId: {
    type: [String, Number],
    default: null
  }
});

/**
 * - close: モーダルを閉じる
 * - submitted: 返信の投稿が成功
 */
const emit = defineEmits(['close', 'submitted']);

// 入力欄の内容
const replyContent = ref('');

// 送信中フラグ（二重送信防止）
const isSubmitting = ref(false);

/** ダイアログの開閉状態を管理する */
const dialog = ref(true);

/** 入力チェック */
const isValid = computed(() => !!replyContent.value.trim());

const submitReply = async () => {
  if (!isValid.value) return;

  isSubmitting.value = true;
  try {
    await axios.post(`/api/post/${props.postId}/reply`, {
      content: replyContent.value,
      parentReplyId: props.parentReplyId
    });

    // 送信成功時に入力欄をクリア
    replyContent.value = '';

    // 送信成功時にモーダルを閉じる
    emit('submitted');
    emit('close');
  } catch (error) {
    console.error('返信の送信に失敗しました:', error);
    alert('返信に失敗しました。');
  } finally {
    // 成否に関わらず送信中フラグを戻す
    isSubmitting.value = false;
  }
};

/** モーダル外側をクリックした時などのイベント監視 */
const updateDialog = (val) => {
  if (!val) emit('close');
};
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="500"
    persistent
    @update:model-value="updateDialog"
  >
    <v-card rounded="xl" class="pa-2">
      <!-- ヘッダー -->
      <v-card-title class="text-h6 font-weight-bold">
        返信を投稿
      </v-card-title>

      <!-- 入力欄 -->
      <v-card-text>
        <v-textarea
          v-model="replyContent"
          placeholder="返信を入力してください"
          variant="filled"
          auto-grow
          rows="4"
          hide-details="auto"
          bg-color="grey-lighten-4"
          color="primary"
          class="rounded-lg"
          :disabled="isSubmitting"
          counter
        ></v-textarea>
      </v-card-text>

      <!-- フッター -->
      <v-card-actions class="pa-4">
        <v-btn
          variant="text"
          color="grey-darken-1"
          rounded="pill"
          :disabled="isSubmitting"
          @click="emit('close')"
        >
          キャンセル
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          rounded="pill"
          min-width="100"
          :loading="isSubmitting"
          :disabled="!isValid"
          @click="submitReply"
        >
          返信する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
