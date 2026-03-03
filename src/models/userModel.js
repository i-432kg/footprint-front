/**
 * APIレスポンスをフロントエンド用の安定したUserオブジェクトに変換する
 */
export const mapToUser = (raw) => {
  if (!raw) return null;

  return {
    id: raw.id,
    username: raw.username || '',
    email: raw.email || '',
    // 投稿数や返信数をUIで表示しやすい名前で保持
    postCount: raw.postCount || 0,
    replyCount: raw.replyCount || 0,
    // 必要に応じて、アイコンURLなどのデフォルト値をここで設定可能
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${raw.username}`
  };
};

/**
 * 登録フォームの入力をAPI送信用のリクエストボディに変換する
 * (Request Transformer)
 */
export const createSignupRequest = (formData) => {
  return {
    email: formData.email,
    userName: formData.username,
    password: formData.password,
    birthDate: formData.birthdate,
  };
};
