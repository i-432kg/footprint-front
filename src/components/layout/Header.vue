<script setup>
import { ref, onMounted } from 'vue';
import { uiLogger } from '@/utils/logger';
import { LOG_EVENTS } from '@/constants/logEvents';

/**
 * 検索クエリ文字列
 * @type {import('vue').Ref<string>}
 */
const searchQuery = ref('');

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
  window.location.href = `/search?${params.toString()}`;
};

onMounted(() => {
  // 現在のパスを取得
  currentPath.value = window.location.pathname;
});
</script>

<template>
  <v-app-bar color="white" flat border density="compact" class="px-4">
    <!-- ロゴ -->
    <v-app-bar-title class="flex-shrink-0" style="min-width: 100px;">
      <v-btn variant="plain" href="/" class="text-h6 font-weight-bold text-primary pa-0">
        LOGO
      </v-btn>
    </v-app-bar-title>

    <!-- ナビゲーション -->
    <v-btn
      variant="text"
      href="/map"
      class="hidden-sm-and-down rounded-0"
      height="100%"
      :class="{ 'text-primary border-b-lg': currentPath.startsWith('/map') }"
    >
      Maps
    </v-btn>
    <v-btn
      variant="text"
      href="/timeline"
      class="hidden-sm-and-down rounded-0"
      height="100%"
      :class="{ 'text-primary border-b-lg': currentPath.startsWith('/timeline') }"
    >
      TL
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

    <v-spacer></v-spacer>

    <!-- マイページ -->
    <v-btn icon="mdi-account-circle" href="/mypage" title="MyPage"></v-btn>
  </v-app-bar>
</template>
