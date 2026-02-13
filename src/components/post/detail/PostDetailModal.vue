<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import ReplyModal from "./ReplyModal.vue";
import PostDetailContent from "./PostDetailContent.vue";
import CommentThread from "./CommentThread.vue";
import { useReplyStore } from '@/stores/replyStore.js';

const replyStore = useReplyStore();

/** 詳細を表示する投稿 */
const props = defineProps({
  post: { type: Object, required: true }
});

const emit = defineEmits(['close']);

/**
 * 投稿詳細
 */
const detailedPost = ref(props.post);

/**
 * 詳細取得中の表示制御
 */
const isLoading = ref(true);

/**
 * 返信モーダルを表示するか
 */
const showReplyModal = ref(false);

/**
 * どの返信に対する返信か（nullなら「投稿への返信」= 親返信）
 */
const selectedParentReplyId = ref(null);

/** モーダルの開閉状態を管理する */
const dialog = ref(true);


/**
 * 返信入力モーダルを開く
 *
 * @param {number|null} replyId - 返信先の返信ID（null なら投稿への返信）
 */
const openReplyModal = (replyId = null) => {
  selectedParentReplyId.value = replyId;
  showReplyModal.value = true;
};

/**
 * 投稿詳細（投稿本文など）を取得
 */
const fetchPostDetail = async () => {
  try {
    const postRes = await axios.get(`/api/post/${props.post.id}`);
    detailedPost.value = postRes.data;
  } catch (error) {
    console.error('データの取得に失敗しました:', error);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 返信投稿が成功したときの処理
 *
 * - 投稿への返信（親返信）なら、親返信一覧だけを更新する
 * - 返信への返信（子/孫返信...）なら、その「返信先（親）」の子一覧だけを更新して、
 *   さらに「返信ツリーを開いた状態」にしておく（投稿直後に見えるようにする）
 */
const handleReplySubmitted = async () => {
  // 送信先が「投稿」なら 1階層目（親返信一覧）を更新
  if (!selectedParentReplyId.value) {
    await replyStore.fetchTopLevelReplies(props.post.id);
  } else {
    // 送信先が「返信」なら、その親返信の子一覧だけ更新して開く
    replyStore.expand(selectedParentReplyId.value);
    await replyStore.fetchChildReplies(selectedParentReplyId.value);
  }

  // 返信モーダルを閉じる
  showReplyModal.value = false;
};

/** 投稿詳細モーダルを閉じるときのキャッシュリセット */
const closeModal = () => {
  replyStore.reset();
  emit('close');
};

/** モーダル外側をクリックした時などのイベント監視 */
const updateDialog = (val) => {
  if (!val) closeModal();
};

/**
 * 初期表示時の処理
 *
 * - 投稿詳細を取得
 * - 親返信一覧（1階層目）を取得
 */
onMounted(async () => {
  await fetchPostDetail();
  await replyStore.fetchTopLevelReplies(props.post.id);
});
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    scrollable
    @update:model-value="updateDialog"
  >
    <v-card rounded="xl">
      <!-- ヘッダー -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6 font-weight-bold">投稿詳細</span>
        <v-chip v-if="isLoading" size="small" color="primary" variant="tonal">更新中...</v-chip>
      </v-card-title>

      <v-divider></v-divider>

      <!-- コンテンツ部分 -->
      <v-card-text class="pa-0">
        <v-container class="pa-4">
          <!-- 投稿本体 -->
          <PostDetailContent :post="detailedPost" @reply="openReplyModal(null)" />

          <v-divider class="my-4"></v-divider>

          <!-- 返信一覧 -->
          <CommentThread :replies="replyStore.topLevelReplies" @reply="openReplyModal" />
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <!-- フッター -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          rounded="pill"
          @click="closeModal"
        >
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 返信入力モーダル -->
  <ReplyModal
    v-if="showReplyModal"
    :postId="detailedPost.id"
    :parentReplyId="selectedParentReplyId"
    @close="showReplyModal = false"
    @submitted="handleReplySubmitted"
  />
</template>

<style scoped>

</style>
