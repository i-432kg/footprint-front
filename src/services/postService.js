import apiClient, { withLog } from './apiClient';
import { LOG_EVENTS } from '@/constants/logEvents';

export default {
  /** 一覧取得（タイムライン用） */
  fetchTimeline(lastId, size) {
    return apiClient.get('/posts', withLog(LOG_EVENTS.POST.TIMELINE_FETCH, { params: { lastId, size } }));
  },

  /** 検索実行 */
  search(keyword, lastId, size) {
    return apiClient.get('/posts/search', withLog(LOG_EVENTS.POST.SEARCH_FETCH, { params: { keyword, lastId, size } }));
  },

  /** 投稿詳細取得 */
  fetchDetail(postId) {
    return apiClient.get(`/posts/${postId}`, withLog(LOG_EVENTS.POST.DETAIL_FETCH));
  },

  /** 新規投稿 */
  createPost({ comment, imageFile }) {
    const formData = new FormData();
    formData.append('comment', comment || '');
    formData.append('imageFile', imageFile);

    return apiClient.post('/posts', formData, withLog(LOG_EVENTS.POST.CREATE_SUCCESS));
  },

  /** 返信（コメント）投稿 */
  createReply(postId, content, parentReplyId = null) {
    return apiClient.post(`/post/${postId}/reply`, { content, parentReplyId }, withLog(LOG_EVENTS.REPLY.CREATE_SUCCESS));
  },

  /** 投稿に紐づく親返信（1階層目）一覧を取得 */
  fetchReplies(postId) {
    return apiClient.get(`/post/${postId}/replies`, withLog(LOG_EVENTS.REPLY.LIST_FETCH));
  },

  /** 返信に対する子返信一覧を取得 */
  fetchChildReplies(parentReplyId) {
    return apiClient.get(`/reply/${parentReplyId}/replies`, withLog(LOG_EVENTS.REPLY.LIST_FETCH));
  }
};
