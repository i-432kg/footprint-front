<script setup>
import ReplyItem from "./ReplyItem.vue";

/**
 * 親返信（1階層目）の一覧を表示するコンポーネント
 *
 * - 「親返信リスト」を受け取り、ReplyItem を 再帰的に表示する
 * - 返信ボタンが押されたら、親（PostDetailModal）に「どの返信に返信するか」を通知する
 */
const props = defineProps({
  // 親返信（1階層目）の配列
  replies: { type: Array, default: () => [] }
});

/**
 * 親に通知するイベント
 *
 * - reply: 返信ボタンが押された返信先の replyId
 */
const emit = defineEmits(['reply']);
</script>

<template>
  <div class="comment-thread">
    <div class="reply-chain" v-if="replies.length > 0">
      <ReplyItem
        v-for="reply in replies"
        :key="reply.id"
        :reply="reply"
        @reply="(id) => emit('reply', id)"
      />
    </div>
  </div>
</template>

<style scoped>
/* 返信一覧 */
.comment-thread {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: 16px;
}

/* 1階層目の返信リストのインデント */
.reply-chain {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
