import { ref } from 'vue'
import { defineStore } from 'pinia'
import postService from '@/services/postService'

/**
 * 返信（コメント）関連の状態管理ストア
 *
 * 目的:
 * - 投稿詳細モーダル内で「親返信（1階層目）」と「子返信（n階層目）」を扱う
 * - YouTubeのように「n件の返信を表示/非表示」を階層ごとに開閉できるようにする
 * - 子返信は必要になったタイミングで取得し、取得済みならキャッシュを使う
 *
 * 設計メモ:
 * - 親返信（1階層目）は postId ごとに取得して配列で保持する
 * - 子返信（返信への返信）は parentReplyId ごとに取得して Mapにキャッシュする
 * - 開閉状態は parentReplyId のSetで管理する
 */
export const useReplyStore = defineStore('reply', () => {
  /**
   * 投稿に紐づく親返信（1階層目）
   */
  const topLevelReplies = ref([])

  /**
   * 子返信のキャッシュ
   * key: parentReplyId（親となる返信のid）
   * value: その親にぶら下がる子返信配列
   */
  const childRepliesMap = ref({})

  /**
   * 「返信ツリーを開いている」親返信IDの集合
   */
  const expandedIds = ref(new Set())

  /**
   * 親返信（1階層目）を取得して置き換える
   * - 投稿詳細モーダルを開いたとき
   * - 親返信を投稿したあと
   */
  async function fetchTopLevelReplies(postId) {
    topLevelReplies.value = await postService.fetchReplies(postId);
  }

  /**
   * 子返信（parentReplyId 直下の返信）を取得してキャッシュに保存する
   * - 「n件の返信を表示」を押したとき
   * - 子返信を投稿したあと、その階層だけ再取得して反映する
   */
  async function fetchChildReplies(parentReplyId) {
    const data = await postService.fetchChildReplies(parentReplyId);

    childRepliesMap.value = {
      ...childRepliesMap.value,
      [parentReplyId]: data,
    }

    return data;
  }

  /**
   * 子返信の取得結果（キャッシュ）を返す
   * 未取得なら空配列を返す（呼び出し側が扱いやすい）
   */
  function getChildReplies(parentReplyId) {
    return childRepliesMap.value[parentReplyId] ?? []
  }

  /** parentReplyId の返信ツリーが「開いている」か */
  function isExpanded(parentReplyId) {
    return expandedIds.value.has(parentReplyId)
  }

  /** 返信ツリーを開く（表示する） */
  function expand(parentReplyId) {
    expandedIds.value.add(parentReplyId)
  }

  /** 返信ツリーを閉じる（非表示にする） */
  function collapse(parentReplyId) {
    expandedIds.value.delete(parentReplyId)
  }

  /** 開閉をトグル */
  function toggleExpanded(parentReplyId) {
    if (isExpanded(parentReplyId)) collapse(parentReplyId)
    else expand(parentReplyId)
  }

  /**
   * 状態リセット
   */
  function reset() {
    topLevelReplies.value = []
    childRepliesMap.value = {}
    expandedIds.value = new Set()
  }

  return {
    // state
    topLevelReplies,

    // fetch/cache
    fetchTopLevelReplies,
    fetchChildReplies,
    getChildReplies,

    // expand/collapse
    isExpanded,
    expand,
    collapse,
    toggleExpanded,

    // maintenance
    reset,
  }
})
