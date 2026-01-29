<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import ReplyModal from "./ReplyModal.vue";
import PostDetailContent from "./PostDetailContent.vue";
import CommentThread from "./CommentThread.vue";
import { useReplyStore } from '@/stores/replyStore';

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
  <!-- モーダル外クリックで閉じる -->
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-window detail-window">
      <div class="modal-header">
        <h3>投稿詳細</h3>
        <span v-if="isLoading" class="loading-badge">更新中...</span>
      </div>

      <div class="detail-content">
        <!-- 投稿の表示（画像/本文/緯度経度/日付/投稿への返信ボタン） -->
        <PostDetailContent :post="detailedPost" @reply="openReplyModal(null)" />

        <!-- 親返信一覧 -->
        <CommentThread :replies="replyStore.topLevelReplies" @reply="openReplyModal" />
      </div>

      <div class="modal-footer">
        <button class="btn-text" @click="closeModal">閉じる</button>
      </div>
    </div>
  </div>

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
/* 投稿詳細モーダルの見た目 */
.detail-window {
  width: 600px;
}

/* 「更新中...」表示 */
.loading-badge {
  font-size: 0.75em;
  color: var(--primary-color);
  background: #e8f5fd;
  padding: 2px 8px;
  border-radius: 10px;
}
</style>
