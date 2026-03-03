<script setup>
import { ref, onMounted } from 'vue';
import { rules as commonRules } from '@/utils/validationRules';
import { uiLogger } from '@/utils/logger';
import { LOG_EVENTS } from '@/constants/logEvents';
import postService from '@/services/postService';

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
const replyMessage = ref('');

// 送信中フラグ（二重送信防止）
const isSubmitting = ref(false);

/** ダイアログの開閉状態を管理する */
const dialog = ref(true);

/** v-formコンポーネントへの参照 */
const form = ref(null);

/** フォーム全体の妥当性フラグ */
const isValid = ref(false);

/**
 * 返信投稿フォーム専用のバリデーションルール定義
 * @type {Object.<string, Array<Function>>}
 */
const replyRules = {
  content: [
    commonRules.max(100)
  ]
};

const submitReply = async () => {

  // バリデーション実行
  const { valid } = await form.value.validate();
  if (!valid) {
    uiLogger.warn(LOG_EVENTS.REPLY.CREATE_VALIDATION_FAIL, { postId: props.postId, parentReplyId: props.parentReplyId });
    return;
  }

  isSubmitting.value = true;
  try {

    await postService.createReply(
      props.postId,
      replyMessage.value,
      props.parentReplyId
    );

    uiLogger.info(LOG_EVENTS.REPLY.CREATE_SUCCESS, { postId: props.postId, parentReplyId: props.parentReplyId });

    // 送信成功時に入力欄をクリア
    replyMessage.value = '';

    // 送信成功時にモーダルを閉じる
    emit('submitted');
    emit('close');
  } catch (error) {
    uiLogger.error(LOG_EVENTS.REPLY.CREATE_FAILED, { error: error.message, postId: props.postId });
    alert('返信に失敗しました。');
  } finally {
    // 成否に関わらず送信中フラグを戻す
    isSubmitting.value = false;
  }
};

/**
 * モーダルを閉じる
 */
const closeModal = () => {
  uiLogger.info(LOG_EVENTS.REPLY.CREATE_CLOSE);
  emit('close');
};

/** モーダル外側をクリックした時などのイベント監視 */
const updateDialog = (val) => {
  if (!val) closeModal();
};

onMounted(() => {
  uiLogger.info(LOG_EVENTS.REPLY.CREATE_OPEN, { postId: props.postId, parentReplyId: props.parentReplyId });
});
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
        <v-form ref="form" v-model="isValid">
          <v-textarea
            v-model="replyMessage"
            :rules="replyRules.content"
            :counter="100"
            maxlength="100"
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
        </v-form>
      </v-card-text>

      <!-- フッター -->
      <v-card-actions class="pa-4">
        <v-btn
          variant="text"
          color="grey-darken-1"
          rounded="pill"
          :disabled="isSubmitting"
          @click="closeModal"
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
