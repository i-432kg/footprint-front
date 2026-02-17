/**
 * バリデーションエラーメッセージの定数定義
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: (field) => `${field}を入力してください`,
  MIN_LENGTH: (length) => `${length}文字以上で入力してください`,
  MAX_LENGTH: (length) => `${length}文字以内で入力してください`,
  INVALID_FORMAT: '形式が正しくありません',
  ALPHANUMERIC_UNDERSCORE: '半角英数字とアンダースコア(_)のみ使用できます',
  PASSWORD_MISMATCH: 'パスワードが一致しません',
  SELECT_REQUIRED: (field) => `${field}を選択してください`,
};
