<script setup>
import { computed, ref } from 'vue';
import { useDateFormatter } from "@/composables/useDateFormatter.js";
import { useReplyStore } from "@/stores/replyStore.js";

/**
 * 返信（コメント）を 1 件表示するコンポーネント
 *
 * - 返信本文、日時、返信ボタンを表示する
 * - 「n件の返信を表示/非表示」を制御し、必要なら子返信一覧を取得する
 * - 子返信は Pinia（replyStore）のキャッシュを参照して表示する
 */
const props = defineProps({
  // 表示する返信データ
  reply: { type: Object, required: true },

  // 子返信として表示する場合、見た目を変えるためのフラグ（インデント/背景色など）
  isChild: { type: Boolean, default: false }
});

const emit = defineEmits(['reply']);
const { formatDate } = useDateFormatter();
const replyStore = useReplyStore();
const isLoading = ref(false);

/**
 * この返信（reply.id）に紐づく子返信一覧（キャッシュ）
 * - 未取得なら空配列
 * - 取得済みなら replyStore が保持している配列
 */
const children = computed(() => replyStore.getChildReplies(props.reply.id));

/**
 * この返信の子返信一覧を「表示中かどうか」
 */
const showChildren = computed(() => replyStore.isExpanded(props.reply.id));

/**
 * 「n件の返信を表示/非表示」をトグルする
 */
const toggleChildren = async () => {
  // すでに開いていれば閉じる
  if (showChildren.value) {
    replyStore.collapse(props.reply.id);
    return;
  }

  replyStore.expand(props.reply.id);

  // 初回だけ取得（未取得の場合のみ）
  if (children.value.length === 0) {
    isLoading.value = true;
    try {
      await replyStore.fetchChildReplies(props.reply.id);
    } finally {
      isLoading.value = false;
    }
  }
};

/**
 * 子返信の一覧を最新化する
 */
const refreshChildren = async () => {
  replyStore.expand(props.reply.id);
  isLoading.value = true;
  try {
    await replyStore.fetchChildReplies(props.reply.id);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="reply-section">
    <div class="reply-item" :class="{ 'child-item': isChild }">
      <!-- 返信本文 -->
      <p class="reply-comment">{{ reply.content }}</p>

      <!-- 返信のメタ情報（日時）と返信ボタン -->
      <div class="reply-footer">
        <span class="reply-meta">{{ formatDate(reply.createdAt) }}</span>
        <button class="btn-text" @click="emit('reply', reply.id)">返信する</button>
      </div>

      <div v-if="(reply.replyCount && reply.replyCount > 0) || children.length > 0" class="child-reply-trigger">
        <button class="btn-text load-more-btn" @click="toggleChildren">
          <span v-if="!showChildren">▶ {{ reply.replyCount || children.length }} 件の返信を表示</span>
          <span v-else>▼ 返信を非表示</span>
          <span v-if="isLoading" class="loading-mini">...</span>
        </button>
      </div>
    </div>

    <!-- 子返信一覧（開いているときだけ表示） -->
    <div class="child-replies" v-if="showChildren">
      <ReplyItem
        v-for="child in children"
        :key="child.id"
        :reply="child"
        :isChild="true"
        @reply="(id) => emit('reply', id)"
      />
    </div>
  </div>
</template>

<style scoped>
.reply-item {
  padding: 12px;
  background-color: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.child-item {
  background-color: var(--bg-color);
}

.child-replies {
  margin-left: 30px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-meta {
  font-size: 0.75em;
  color: var(--text-muted);
}

.load-more-btn {
  font-weight: bold;
}
</style>
