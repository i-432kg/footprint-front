/**
 * APIレスポンスをフロントエンド用の安定したReplyオブジェクトに変換する
 */
export const mapToReply = (raw) => {
  if (!raw) return null;

  return {
    id: raw.id,
    postId: raw.postId,
    parentReplyId: raw.parentReplyId,
    message: raw.message || '',
    childCount: raw.childCount || 0,
    createdAt: raw.createdAt,
    // ヘルパープロパティ
    hasChildren: (raw.childCount || 0) > 0
  };
};

/**
 * リスト形式の返信レスポンスを一括変換する
 */
export const mapToReplyList = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(mapToReply);
};
