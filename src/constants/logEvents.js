/**
 * ログイベント定数
 */
export const LOG_EVENTS = {
  // 認証関連
  AUTH: {
    LOGIN_SUCCESS: { event: 'AUTH_LOGIN_SUCCESS', message: 'User logged in successfully' },
    LOGIN_FAILURE: { event: 'AUTH_LOGIN_FAILURE', message: 'User login failed' },
    LOGIN_VALIDATION_FAIL: { event: 'AUTH_LOGIN_VALIDATION_FAIL', message: 'Login validation failed' },
    SIGNUP_SUCCESS: { event: 'AUTH_SIGNUP_SUCCESS', message: 'User signed up successfully' },
    SIGNUP_FAILURE: { event: 'AUTH_SIGNUP_FAILURE', message: 'User signup failed' },
    SIGNUP_VALIDATION_FAIL: { event: 'AUTH_SIGNUP_VALIDATION_FAIL', message: 'Signup validation failed' },
    SIGNUP_CONFIRM_OPEN: { event: 'AUTH_SIGNUP_CONFIRM_OPEN', message: 'User opened signup confirmation' },
    SIGNUP_CLOSE: { event: 'AUTH_SIGNUP_CLOSE', message: 'User closed signup modal' },
  },

  // 投稿関連
  POST: {
    TIMELINE_FETCH: { event: 'POST_TIMELINE_FETCH', message: 'Fetching post timeline' },
    SEARCH_FETCH: { event: 'POST_SEARCH_FETCH', message: 'Fetching post search result' },
    SEARCH_EXECUTE: { event: 'POST_SEARCH_EXECUTE', message: 'User executed search' },
    DETAIL_FETCH: { event: 'POST_DETAIL_FETCH', message: 'Fetching post detail' },
    DETAIL_OPEN: { event: 'POST_DETAIL_OPEN', message: 'User opened post detail modal' },
    DETAIL_CLOSE: { event: 'POST_DETAIL_CLOSE', message: 'User closed post detail modal' },
    CREATE_OPEN: { event: 'POST_CREATE_OPEN', message: 'User opened create post modal' },
    CREATE_CLOSE: { event: 'POST_CREATE_CLOSE', message: 'User closed create post modal' },
    CREATE_SUCCESS: { event: 'POST_CREATE_SUCCESS', message: 'Post created successfully' },
    CREATE_FAILED: { event: 'POST_CREATE_FAILED', message: 'Post creation failed' },
    CREATE_VALIDATION_FAIL: { event: 'POST_CREATE_VALIDATION_FAIL', message: 'Post creation validation failed' },
    MAP_MOVE: { event: 'POST_MAP_MOVE', message: 'Map boundary changed' },
  },

  // 返信関連
  REPLY: {
    LIST_FETCH: { event: 'REPLY_LIST_FETCH', message: 'Fetching reply list' },
    LIST_EXPAND: { event: 'REPLY_LIST_EXPAND', message: 'User expanded child replies' },
    CREATE_OPEN: { event: 'REPLY_CREATE_OPEN', message: 'User opened reply modal' },
    CREATE_CLOSE: { event: 'REPLY_CREATE_CLOSE', message: 'User closed reply modal' },
    CREATE_SUCCESS: { event: 'REPLY_CREATE_SUCCESS', message: 'Reply created successfully' },
    CREATE_FAILED: { event: 'REPLY_CREATE_FAILED', message: 'Reply creation failed' },
    CREATE_VALIDATION_FAIL: { event: 'REPLY_CREATE_VALIDATION_FAIL', message: 'Reply creation validation failed' },
    BUTTON_CLICK: { event: 'REPLY_BUTTON_CLICK', message: 'User clicked reply button' },
  },

  // マイページ関連
  ME: {
    FETCH: { event: 'ME_FETCH', message: 'Fetching current user info' },
    POSTS_FETCH: { event: 'ME_POSTS_FETCH', message: 'Fetching user posts' },
    REPLIES_FETCH: { event: 'ME_REPLIES_FETCH', message: 'Fetching user replies' },
    PROFILE_FETCH: { event: 'ME_PROFILE_FETCH', message: 'Fetching my profile' },
  }
};
