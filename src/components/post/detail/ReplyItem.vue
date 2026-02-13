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
</script>

<template>
  <div class="reply-wrapper mb-4">
    <v-card
      variant="outlined"
      :color="isChild ? 'grey-lighten-3' : 'grey-lighten-2'"
      :class="['rounded-lg', { 'bg-grey-lighten-5': isChild, 'bg-white': !isChild }]"
    >
      <v-card-text class="pa-3">
        <!-- 返信本文 -->
        <p class="text-body-2 mb-2" style="white-space: pre-wrap;">{{ reply.content }}</p>

        <!-- メタ情報と返信ボタン -->
        <v-row align="center" no-gutters>
          <span class="text-caption text-medium-emphasis">
            {{ formatDate(reply.createdAt) }}
          </span>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="primary"
            size="x-small"
            rounded="pill"
            prepend-icon="mdi-reply"
            @click="emit('reply', reply.id)"
          >
            返信する
          </v-btn>
        </v-row>
      </v-card-text>

      <!-- 子返信の展開トリガー -->
      <v-divider v-if="(reply.replyCount && reply.replyCount > 0) || children.length > 0"></v-divider>
      <v-card-actions v-if="(reply.replyCount && reply.replyCount > 0) || children.length > 0" class="pa-1">
        <v-btn
          variant="text"
          block
          size="small"
          class="text-none"
          :loading="isLoading"
          @click="toggleChildren"
        >
          <template v-slot:prepend>
            <v-icon :icon="showChildren ? 'mdi-chevron-down' : 'mdi-chevron-right'"></v-icon>
          </template>
          {{ showChildren ? '返信を非表示' : `${reply.replyCount || children.length} 件の返信を表示` }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- 子返信一覧 -->
    <v-expand-transition>
      <div v-if="showChildren" class="child-replies mt-2 ml-4 ml-sm-8">
        <ReplyItem
          v-for="child in children"
          :key="child.id"
          :reply="child"
          :isChild="true"
          @reply="(id) => emit('reply', id)"
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<style scoped>
.reply-wrapper {
  width: 100%;
}

.child-replies {
  border-left: 2px solid rgba(var(--v-border-color), 0.1);
}
</style>
