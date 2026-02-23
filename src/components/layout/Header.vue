<script setup>
import { ref } from 'vue';
import { uiLogger } from '@/utils/logger';
import { LOG_EVENTS } from '@/constants/logEvents';

const searchQuery = ref('');

const search = () => {
  const query = (searchQuery.value || '').trim();

  // 未入力の場合は検索しない
  if (!query) return;

  // 検索実行ログ（クエリの内容も記録）
  uiLogger.info(LOG_EVENTS.POST.SEARCH_EXECUTE, { query });

  const params = new URLSearchParams({ q: query });
  window.location.href = `/search?${params.toString()}`;
};
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
    <v-btn variant="text" href="/map" class="hidden-sm-and-down">Maps</v-btn>
    <v-btn variant="text" href="/timeline" class="hidden-sm-and-down text-primary border-b-lg">TL</v-btn>

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

<style scoped>

</style>
