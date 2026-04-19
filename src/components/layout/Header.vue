<script setup>
import { ref, onMounted } from 'vue';
import { useMobileLayout } from '@/composables/useMobileLayout';
import { uiLogger } from '@/utils/logger';
import { LOG_EVENTS } from '@/constants/logEvents';

/**
 * 検索クエリ文字列
 * @type {import('vue').Ref<string>}
 */
const searchQuery = ref('');
const { isMobile: isMobileHeader } = useMobileLayout();
const isSearchOpen = ref(false);
const isMenuOpen = ref(false);

/**
 * 現在のブラウザパス（アクティブなリンクの判定に使用）
 * @type {import('vue').Ref<string>}
 */
const currentPath = ref(typeof window !== 'undefined' ? window.location.pathname : '');

/**
 * 検索を実行し、検索結果ページへ遷移する
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

const navigationItems = [
  { title: 'Maps', href: '/map', icon: 'mdi-map-outline', activePrefix: '/map' },
  { title: 'TL', href: '/timeline', icon: 'mdi-format-list-bulleted', activePrefix: '/timeline' },
];

const toggleMobileSearch = () => {
  isSearchOpen.value = !isSearchOpen.value;

  if (isSearchOpen.value) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  // 現在のパスを取得
  currentPath.value = window.location.pathname;
});
</script>

<template>
  <div class="header-shell">
    <v-app-bar color="white" flat border density="compact" class="px-2 px-md-4">
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
        @click="toggleMobileSearch"
      ></v-btn>

      <!-- マイページ -->
      <v-btn icon="mdi-account-circle" href="/mypage" title="MyPage"></v-btn>

      <!-- モバイルメニュー -->
      <v-menu v-if="isMobileHeader" v-model="isMenuOpen" location="bottom end">
        <template #activator="{ props }">
          <v-btn icon="mdi-menu" title="Menu" v-bind="props"></v-btn>
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
    </v-app-bar>

    <v-expand-transition>
      <!-- モバイル検索バー -->
      <v-sheet
        v-if="isMobileHeader && isSearchOpen"
        color="white"
        border
        class="px-4 pb-4"
      >
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="キーワードで検索"
          variant="solo-filled"
          flat
          hide-details
          rounded="pill"
          density="comfortable"
          @keydown.enter="search"
        ></v-text-field>
      </v-sheet>
    </v-expand-transition>
  </div>
</template>
