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
  <v-list class="comment-thread bg-transparent" aria-label="返信一覧">
    <!-- 返信がある場合のリスト表示 -->
    <div v-if="replies.length > 0" class="reply-chain pl-2 pl-sm-4">
      <ReplyItem
        v-for="reply in replies"
        :key="reply.id"
        :reply="reply"
        @reply="(id) => emit('reply', id)"
      />
    </div>

    <!-- 返信がまだない場合のメッセージ -->
    <v-list-item v-else class="text-center text-caption text-medium-emphasis py-4">
      まだ返信はありません。
    </v-list-item>
  </v-list>
</template>

<style scoped>
.comment-thread {
  position: relative;
}

.reply-chain {
  border-left: 1px solid rgba(var(--v-border-color), 0.12);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
