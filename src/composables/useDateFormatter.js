/**
 * 日付表示のフォーマッタ
 *
 * @returns {{formatDate: (function(*): (string|string))|*}}
 */
export function useDateFormatter() {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return {
    formatDate
  };
}
