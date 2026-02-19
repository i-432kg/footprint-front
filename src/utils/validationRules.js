import {VALIDATION_MESSAGES} from '@/constants/validationMessages';

/**
 * Vuetify の rules プロパティで使用する共通バリデーションルール
 */
export const rules = {

  /** 必須チェック */
  required: (message = VALIDATION_MESSAGES.REQUIRED('項目')) => v => !!v || message,

  /** 文字数チェック（最小） */
  min: (length, message) => v => !v || (v && v.length >= length) || message || VALIDATION_MESSAGES.MIN_LENGTH(length),

  /** 文字数チェック（最大） */
  max: (length, message) => v => !v || (v && v.length <= length) || message || VALIDATION_MESSAGES.MAX_LENGTH(length),

  /** 許可文字チェック（半角英数字とアンダースコアのみ） */
  alphanumericUnderscore: (message = VALIDATION_MESSAGES.ALPHANUMERIC_UNDERSCORE) =>
    v => /^[a-zA-Z0-9_]+$/.test(v) || message,

  /** 値の一致チェック */
  sameAs: (targetValue, message = VALIDATION_MESSAGES.PASSWORD_MISMATCH) =>
    v => v === targetValue || message,

  /** ファイルサイズチェック (MB単位) */
  fileSize: (maxMb, message) => v => {
    if (!v) return true;
    const file = Array.isArray(v) ? v[0] : v;
    const maxSize = maxMb * 1024 * 1024;
    return file.size <= maxSize || message || `${maxMb}MB以下の画像を選択してください`;
  },

  /** ファイル形式チェック */
  imageType: (message = '画像ファイル(jpg, png, webp)を選択してください') => v => {
    if (!v) return true;
    const file = Array.isArray(v) ? v[0] : v;
    return /^image\/(jpeg|png|webp)$/.test(file.type) || message;
  }
};
