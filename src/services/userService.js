import apiClient, { withLog } from './apiClient';
import { LOG_EVENTS } from '@/constants/logEvents';
import { mapToPostList } from '@/models/postModel';
import { mapToReplyList } from '@/models/replyModel';
import { mapToUser, createSignupRequest } from '@/models/userModel';

export default {

  /** ログインユーザー自身の情報を取得 */
  async fetchMe() {
    const data =
      await apiClient.get('/users/me', withLog(LOG_EVENTS.ME.PROFILE_FETCH));
    return mapToUser(data);
  },

  /** ログインユーザの投稿一覧を取得 */
  async fetchMyPosts(lastId, size) {
    const data =
      await apiClient.get('/users/me/posts',
        withLog(LOG_EVENTS.ME.POSTS_FETCH, { params: { lastId, size } })
      );
    return mapToPostList(data);
  },

  /** ログインユーザの返信一覧を取得 */
  async fetchMyReplies(lastId, size) {
    const data =
      await apiClient.get('/users/me/replies',
        withLog(LOG_EVENTS.ME.REPLIES_FETCH, { params: { lastId, size } })
      );
    return mapToReplyList(data);
  },

  /** ログイン実行 */
  login(loginId, password) {
    const params = new URLSearchParams();
    params.append('loginId', loginId);
    params.append('password', password);

    return apiClient.post(
      '/login',
      params,
      withLog(LOG_EVENTS.AUTH.LOGIN_SUCCESS, {
        // Spring Security でのログイン処理は form データを想定している
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
    );
  },

  /** ログアウト実行 */
  logout() {
    return apiClient.post('/logout', undefined, withLog(LOG_EVENTS.AUTH.LOGOUT_SUCCESS));
  },

  /** ユーザー登録 */
  async signup(formData) {
    // フォームの生データをAPI用のリクエスト形式に変換
    const requestBody = createSignupRequest(formData);

    return apiClient.post('/users', requestBody, withLog(LOG_EVENTS.AUTH.SIGNUP_SUCCESS));
  },
};
