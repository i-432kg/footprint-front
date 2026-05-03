<script setup>
import { ref, onMounted } from 'vue';
import { useMobileLayout } from '@/composables/useMobileLayout';
import { uiLogger } from '@/utils/logger';
import { LOG_EVENTS } from '@/constants/logEvents';
import userService from '@/services/userService';

/**
 * ヘッダーの検索入力値。
 * @type {import('vue').Ref<string>}
 */
const searchQuery = ref('');

/**
 * モバイル向けヘッダー表示かどうか。
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileHeader } = useMobileLayout();

/**
 * モバイル検索バーの開閉状態。
 * @type {import('vue').Ref<boolean>}
 */
const isSearchOpen = ref(false);

/**
 * モバイルメニューの開閉状態。
 * @type {import('vue').Ref<boolean>}
 */
const isMenuOpen = ref(false);

/**
 * ログアウト処理の実行中フラグ。
 * @type {import('vue').Ref<boolean>}
 */
const isLoggingOut = ref(false);

/**
 * 現在のブラウザパス。
 * ナビゲーションのアクティブ状態判定に利用する。
 *
 * @type {import('vue').Ref<string>}
 */
const currentPath = ref(typeof window !== 'undefined' ? window.location.pathname : '');

/**
 * ヘッダーに表示する主要ナビゲーション定義。
 * @type {{ title: string, href: string, icon: string, activePrefix: string }[]}
 */
const navigationItems = [
  { title: 'Maps', href: '/map', icon: 'mdi-map-outline', activePrefix: '/map' },
  { title: 'TL', href: '/timeline', icon: 'mdi-format-list-bulleted', activePrefix: '/timeline' },
];

/**
 * 検索を実行して検索結果ページへ遷移する。
 */
const search = () => {
  const query = (searchQuery.value || '').trim();

  // 未入力の場合は検索しない
  if (!query) return;

  // 検索実行ログ（クエリの内容も記録）
  uiLogger.info(LOG_EVENTS.POST.SEARCH_EXECUTE, { query });

  const params = new URLSearchParams({ q: query });
  isSearchOpen.value = false;
  window.location.href = `/search?${params.toString()}`;
};

/**
 * モバイル検索バーの開閉を切り替える。
 * 検索バーを開く際はメニューを閉じる。
 */
const toggleMobileSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;

  if (isSearchOpen.value) {
    isMenuOpen.value = false;
  }
};

/**
 * ログアウトを実行してログイン画面へ遷移する。
 */
const handleLogout = async () => {
  if (isLoggingOut.value) return;

  isLoggingOut.value = true;

  try {
    await userService.logout();
    uiLogger.info(LOG_EVENTS.AUTH.LOGOUT_SUCCESS);
    window.location.href = '/login';
  } catch (error) {
    uiLogger.warn(LOG_EVENTS.AUTH.LOGOUT_FAILURE, { reason: error.message });
    alert('ログアウトに失敗しました。時間をおいて再度お試しください。');
  } finally {
    isLoggingOut.value = false;
  }
};

onMounted(() => {
  // 現在のパスを取得
  currentPath.value = window.location.pathname;
});
</script>

<template>
  <div class="header-shell">
    <v-app-bar
      color="white"
      flat
      border
      density="compact"
      class="px-2 px-md-4"
      :extension-height="isMobileHeader && isSearchOpen ? 64 : 0"
    >
      <!-- ロゴ -->
      <v-app-bar-title class="flex-shrink-0" style="min-width: 0;">
        <v-btn variant="plain" href="/" class="text-h6 font-weight-bold text-primary pa-0">
          LOGO
        </v-btn>
      </v-app-bar-title>

      <template v-if="!isMobileHeader">
        <!-- ナビゲーション -->
        <v-btn
          v-for="item in navigationItems"
          :key="item.href"
          variant="text"
          :href="item.href"
          class="rounded-0"
          height="100%"
          :class="{ 'text-primary border-b-lg': currentPath.startsWith(item.activePrefix) }"
        >
          {{ item.title }}
        </v-btn>

        <v-spacer></v-spacer>

        <!-- 検索バー -->
        <v-responsive max-width="400" class="mx-4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="キーワードで検索"
            variant="solo-filled"
            flat
            hide-details
            rounded="pill"
            density="compact"
            @keydown.enter="search"
          ></v-text-field>
        </v-responsive>
      </template>

      <v-spacer></v-spacer>

      <!-- モバイル検索トグル -->
      <v-btn
        v-if="isMobileHeader"
        icon="mdi-magnify"
        title="Search"
        aria-label="検索バーを開く"
        @click="toggleMobileSearch"
      ></v-btn>

      <!-- アカウントメニュー -->
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn
            icon="mdi-account-circle"
            title="Account"
            aria-label="アカウントメニューを開く"
            v-bind="props"
          ></v-btn>
        </template>

        <v-list min-width="200" density="compact">
          <v-list-item href="/mypage" prepend-icon="mdi-account-circle">
            <v-list-item-title>マイページ</v-list-item-title>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item
            prepend-icon="mdi-logout"
            :disabled="isLoggingOut"
            @click="handleLogout"
          >
            <v-list-item-title>ログアウト</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- モバイルメニュー -->
      <v-menu v-if="isMobileHeader" v-model="isMenuOpen" location="bottom end">
        <template #activator="{ props }">
          <v-btn icon="mdi-menu" title="Menu" aria-label="メニューを開く" v-bind="props"></v-btn>
        </template>

        <v-list min-width="200" density="compact">
          <v-list-item
            v-for="item in navigationItems"
            :key="item.href"
            :href="item.href"
            :prepend-icon="item.icon"
            :active="currentPath.startsWith(item.activePrefix)"
            color="primary"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <template v-if="isMobileHeader && isSearchOpen" #extension>
        <v-expand-transition>
          <!-- モバイル検索バー -->
          <v-sheet color="white" class="w-100 px-4 pb-3 pt-1">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              placeholder="キーワードで検索"
              variant="solo-filled"
              flat
              hide-details
              rounded="pill"
              density="compact"
              autofocus
              @keydown.enter="search"
            ></v-text-field>
          </v-sheet>
        </v-expand-transition>
      </template>
    </v-app-bar>
  </div>
</template>
