import { VALIDATION_MESSAGES } from '@/constants/validationMessages';

/**
 * Vuetify の rules プロパティで使用する共通バリデーションルール
 */
export const rules = {
  required: (message = VALIDATION_MESSAGES.REQUIRED('項目')) => v => !!v || message,

  min: (length, message) => v => (v && v.length >= length) || message || VALIDATION_MESSAGES.MIN_LENGTH(length),

  max: (length, message) => v => (v && v.length <= length) || message || VALIDATION_MESSAGES.MAX_LENGTH(length),

  // ログインID用: 半角英数字とアンダースコア
  alphanumericUnderscore: (message = VALIDATION_MESSAGES.ALPHANUMERIC_UNDERSCORE) =>
    v => /^[a-zA-Z0-9_]+$/.test(v) || message,

  // 値の一致チェック（パスワード再入力用）
  sameAs: (targetValue, message = VALIDATION_MESSAGES.PASSWORD_MISMATCH) =>
    v => v === targetValue || message,
};
