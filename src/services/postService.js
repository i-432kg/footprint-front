import apiClient, { withLog } from './apiClient';
import { LOG_EVENTS } from '@/constants/logEvents';
import { mapToPost, mapToPostList } from '@/models/postModel';
import { mapToReplyList } from '@/models/replyModel';

export default {
  /** 一覧取得（タイムライン用） */
  async fetchTimeline(lastId, size) {
    const data =
      await apiClient.get('/posts',
        withLog(LOG_EVENTS.POST.TIMELINE_FETCH, { params: { lastId, size } })
      );
    return mapToPostList(data);
  },

  /** 検索実行 */
  async search(keyword, lastId, size) {
    const data =
      await apiClient.get('/posts/search',
        withLog(LOG_EVENTS.POST.SEARCH_FETCH, { params: { keyword, lastId, size } })
      );
    return mapToPostList(data);
  },

  /** 地図検索実行 */
  async searchMap(minLat, maxLat, minLng, maxLng) {
    const data =
      await apiClient.get('/posts/search/map',
        withLog(LOG_EVENTS.POST.SEARCH_FETCH, { params: { minLat, maxLat, minLng, maxLng } })
      );
    return mapToPostList(data);
  },

  /** 投稿詳細取得 */
  async fetchDetail(postId) {
    const data =
      await apiClient.get(`/posts/${postId}`, withLog(LOG_EVENTS.POST.DETAIL_FETCH));
    return mapToPost(data);
  },

  /** 新規投稿 */
  createPost({ comment, imageFile }) {
    const formData = new FormData();
    formData.append('comment', comment || '');
    formData.append('imageFile', imageFile);

    return apiClient.post('/posts', formData, withLog(LOG_EVENTS.POST.CREATE_SUCCESS));
  },

  /** 返信（コメント）投稿 */
  createReply(postId, message, parentReplyId = null) {
    return apiClient.post(`/replies/${postId}/reply`,
      { message, parentReplyId }, withLog(LOG_EVENTS.REPLY.CREATE_SUCCESS)
    );
  },

  /** 投稿に紐づく親返信（1階層目）一覧を取得 */
  async fetchReplies(postId) {
    const data =
      await apiClient.get(`/posts/${postId}/replies`,
        withLog(LOG_EVENTS.REPLY.LIST_FETCH)
      );
    return mapToReplyList(data);
  },

  /** 返信に対する子返信一覧を取得 */
  async fetchChildReplies(parentReplyId) {
    const data =
      await apiClient.get(`/replies/${parentReplyId}`,
        withLog(LOG_EVENTS.REPLY.LIST_FETCH)
      );
    return mapToReplyList(data);
  }
};
