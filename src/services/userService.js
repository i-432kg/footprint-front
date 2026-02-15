import apiClient from './apiClient';

export default {
  /** ログイン中のユーザー情報を取得 */
  getMe() {
    return apiClient.get('/api/users/me');
  },

  /** ログインユーザの投稿一覧を取得 */
  getMyPosts() {
    return apiClient.get('/api/users/me/posts');
  },

  /** ログインユーザの返信一覧を取得 */
  getMyReplies() {
    return apiClient.get('/api/users/me/replies');
  },

  /** ログイン実行 */
  login(loginId, password) {
    const params = new URLSearchParams();
    params.append('loginId', loginId);
    params.append('password', password);
    return apiClient.post('/api/login', params, {
      // Spring Security でのログイン処理は form データを想定している
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },

  /** 会員登録 */
  signup(userData) {
    return apiClient.post('/api/signup', userData);
  }
};
