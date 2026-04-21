<script setup>
import { useMobileLayout } from '@/composables/useMobileLayout';
import TheHeader from '@/components/layout/TheHeader.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import PostMap from '@/components/post/PostMap.vue';

/**
 * モバイル向けマップ画面レイアウトかどうか。
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileMapPage } = useMobileLayout();
</script>

<template>
  <v-app>
    <TheHeader />

    <v-main class="map-main h-100">
      <v-container fluid class="pa-0 h-100">
        <!-- 投稿マップ -->
        <PostMap />
      </v-container>
    </v-main>

    <TheFooter v-if="!isMobileMapPage" />
  </v-app>
</template>

<style scoped>
.map-main {
  min-height: 0;
}
</style>
