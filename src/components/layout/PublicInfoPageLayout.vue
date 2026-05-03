<script setup>
import TheFooter from '@/components/layout/TheFooter.vue';

/**
 * 静的ページのタイトル。
 * @type {string}
 */
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <v-app>
    <v-app-bar color="white" flat border density="compact" class="px-2 px-md-4">
      <!-- ロゴ -->
      <v-app-bar-title class="flex-shrink-0">
        <v-btn variant="plain" href="/login" class="text-h6 font-weight-bold text-primary pa-0">
          Footprint
        </v-btn>
      </v-app-bar-title>
    </v-app-bar>

    <v-main class="bg-grey-lighten-5">
      <v-container class="px-4 py-8 py-md-12" max-width="900">
        <!-- ページヘッダー -->
        <v-card variant="flat" class="bg-transparent mb-6 mb-md-8">
          <h1 class="text-h4 text-md-h3 font-weight-black mb-3">{{ title }}</h1>
          <p v-if="subtitle" class="text-body-1 text-medium-emphasis mb-0">
            {{ subtitle }}
          </p>
        </v-card>

        <!-- ページ本文 -->
        <v-card class="pa-5 pa-md-8" rounded="lg">
          <slot></slot>
        </v-card>
      </v-container>
    </v-main>

    <!-- フッター -->
    <TheFooter />
  </v-app>
</template>
