<script setup>
import Header from '@/components/layout/Header.vue';

/**
 * 共通2カラムレイアウト
 */
</script>

<template>
  <v-app>
    <Header />

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-6">
        <v-row>
          <!-- メインカラム (左) -->
          <v-col cols="12" md="8">
            <!-- ヘッダーエリア -->
            <slot name="header"></slot>

            <!-- メインコンテンツ -->
            <slot name="main"></slot>
          </v-col>

          <!-- サイドバーカラム (右) -->
          <v-col cols="12" md="4" class="hidden-sm-and-down">
            <slot name="sidebar"></slot>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- モーダル -->
    <slot name="modals"></slot>
  </v-app>
</template>
