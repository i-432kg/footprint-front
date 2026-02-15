import apiClient from './apiClient';

export default {
  /** 一覧取得（タイムライン用） */
  fetchTimeline() {
    return apiClient.get('/api/posts');
  },

  /** 検索実行 */
  search(keyword, lastId, size = 10) {
    return apiClient.get('/api/posts/search', { params: { keyword, lastId, size } });
  },

  /** 投稿詳細取得 */
  fetchDetail(postId) {
    return apiClient.get(`/api/post/${postId}`);
  },

  /** 新規投稿 */
  createPost(formData) {
    return apiClient.post('/api/post', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  /** 返信（コメント）投稿 */
  createReply(postId, content, parentReplyId = null) {
    return apiClient.post(`/api/post/${postId}/reply`, { content, parentReplyId });
  },

  /** 投稿に紐づく親返信（1階層目）一覧を取得 */
  fetchReplies(postId) {
    return apiClient.get(`/api/post/${postId}/replies`);
  },

  /** 返信に対する子返信一覧を取得 */
  fetchChildReplies(parentReplyId) {
    return apiClient.get(`/api/reply/${parentReplyId}/replies`);
  }
};
