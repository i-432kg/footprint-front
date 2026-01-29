<script setup>
import { ref } from 'vue';
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

const submitReply = async () => {
  // 空文字や空白のみNG
  if (!replyContent.value.trim()) return;

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
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-window">
      <h3>返信を投稿</h3>

      <textarea v-model="replyContent" placeholder="返信を入力してください" rows="4"></textarea>
      <div class="modal-footer">
        <!-- 送信中は操作を止める -->
        <button class="btn-text" @click="emit('close')" :disabled="isSubmitting">キャンセル</button>

        <!-- 空入力・送信中は押せない -->
        <button class="btn-primary" @click="submitReply" :disabled="isSubmitting || !replyContent.trim()">
          {{ isSubmitting ? '送信中...' : '返信する' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
