import { computed } from 'vue';
import { useDisplay } from 'vuetify';

/**
 * モバイルレイアウトとして扱う画面幅の閾値（CSS px）。
 * `768px` 未満をモバイルとして扱う。
 *
 * @type {number}
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * モバイルレイアウト判定を共通化する composable。
 *
 * @returns {{ isMobile: import('vue').ComputedRef<boolean> }}
 */
export function useMobileLayout() {
  const { width } = useDisplay();

  const isMobile = computed(() => width.value < MOBILE_BREAKPOINT);

  return {
    isMobile,
  };
}
