import apiClient, { withLog } from './apiClient';
import { LOG_EVENTS } from '@/constants/logEvents';

export default {
  /** ログイン中のユーザー情報を取得 */
  getMe() {
    return apiClient.get('/users/me', withLog(LOG_EVENTS.ME.FETCH));
  },

  /** ログインユーザの投稿一覧を取得 */
  getMyPosts() {
    return apiClient.get('/users/me/posts', withLog(LOG_EVENTS.ME.POSTS_FETCH));
  },

  /** ログインユーザの返信一覧を取得 */
  getMyReplies() {
    return apiClient.get('/users/me/replies', withLog(LOG_EVENTS.ME.REPLIES_FETCH));
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

  /** 会員登録 */
  signup(userData) {
    return apiClient.post('/signup', userData, withLog(LOG_EVENTS.AUTH.SIGNUP_SUCCESS));
  }
};
