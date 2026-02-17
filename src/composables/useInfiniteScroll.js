import { ref, onUnmounted } from 'vue';

/**
 * カスタム無限スクロール Composable
 *
 * Intersection Observer API を使用して、画面最下部の要素が
 * 表示されたことを検知し、自動的に次のデータを読み込む。
 *
 * Vuetify の v-infinite-scroll と slot を組み合わせると
 * 要素の読み込みが安定しないため手動実装する。
 *
 * @param {Function} fetchFn - データを取得する非同期関数。引数に lastId と pageSize を受け取る。
 * @param {Object} options - オプション設定
 * @param {number} options.pageSize - 1回あたりの取得件数（デフォルト: 10）
 */
export function useInfiniteScroll(fetchFn, { pageSize = 10 } = {}) {
  /** 取得したデータのリスト */
  const items = ref([]);

  /** 最後に読み込んだデータのID（次回の取得開始位置） */
  const lastId = ref(null);

  /** 読み込み中フラグ（二重リクエスト防止用） */
  const isLoading = ref(false);

  /** まだ続きのデータがあるかどうか */
  const hasMore = ref(true);

  /** IntersectionObserver のインスタンス保持用 */
  let observer = null;

  /**
   * データを取得してリストに追加する内部関数
   */
  const load = async () => {
    // 読み込み中、またはこれ以上データがない場合は何もしない
    if (isLoading.value || !hasMore.value) return;

    isLoading.value = true;
    try {
      // 外部から渡された取得関数を実行
      const newItems = await fetchFn(lastId.value, pageSize);

      // データが空（これ以上ない）場合
      if (!newItems || newItems.length === 0) {
        hasMore.value = false;
      } else {
        // 既存のリストに新しいデータを追加
        items.value.push(...newItems);

        // 最後のデータのIDを保存して、次回の位置を特定する
        lastId.value = newItems[newItems.length - 1].id;

        // 取得した件数が指定された pageSize より少なければ、次が最後と判断
        if (newItems.length < pageSize) hasMore.value = false;
      }
    } catch (error) {
      console.error('読み込みに失敗しました:', error);
    } finally {
      // 成功・失敗に関わらず読み込み中状態を解除
      isLoading.value = false;
    }
  };

  /**
   * 指定した要素（目印となるDOM）の監視を開始する
   *
   * @param {HTMLElement} element - 監視対象となる要素（ref.value で渡す）
   */
  const observe = (element) => {
    if (!element) return;

    // すでに監視中であれば一旦解除（再初期化用）
    if (observer) observer.disconnect();

    // 交差判定（要素が画面に入ったか）の設定
    observer = new IntersectionObserver((entries) => {
      // 要素が少しでも（10%以上）画面内に入ったら load() を実行
      if (entries[0].isIntersecting) {
        load();
      }
    }, { threshold: 0.1 });

    observer.observe(element);
  };

  /**
   * データを空にして最初から読み直す
   */
  const reset = () => {
    items.value = [];
    lastId.value = null;
    hasMore.value = true;
    load(); // リセット直後に初回のデータを読み込む
  };

  /**
   * コンポーネント破棄時にブラウザの監視を停止する（メモリリーク防止）
   */
  onUnmounted(() => {
    if (observer) observer.disconnect();
  });

  // 画面側で使用する状態と関数
  return { items, isLoading, hasMore, observe, reset };
}
