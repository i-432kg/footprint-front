/**
 * APIレスポンスをフロントエンド用の安定したPostオブジェクトに変換する
 */
export const mapToPost = (raw) => {
  if (!raw) return null;

  const lat = raw.location?.lat;
  const lng = raw.location?.lng;
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);

  return {
    id: raw.id,
    // APIのプロパティ名が変わっても、ここで吸収する
    caption: raw.caption || '',
    // 画像が配列でも、常に「メイン画像」を取得しやすくしておく
    images: (raw.images || []).map(img => ({
      id: img.id,
      url: img.url,
      width: img.width,
      height: img.height
    })),
    mainImageUrl: raw.images && raw.images.length > 0 ? raw.images[0].url : null,
    // 位置情報の構造が変わっても、常にこの形式でアクセスできるようにする
    location: raw.location ? {
      lat,
      lng
    } : null,
    createdAt: raw.createdAt,
    // UI側で判定しやすくするためのヘルパープロパティ
    hasLocation,
    hasImages: raw.images && raw.images.length > 0
  };
};

/**
 * リスト形式のレスポンスを一括変換する
 */
export const mapToPostList = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(mapToPost);
};
