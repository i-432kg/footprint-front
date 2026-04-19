<script setup>
import Header from '@/components/layout/Header.vue';
import { useMobileLayout } from '@/composables/useMobileLayout';

/**
 * 共通2カラムレイアウト。
 *
 * PC ではメインカラムとサイドバーを横並びにし、
 * モバイルでは 1 カラム化してサイドバーをメイン下へ再配置する。
 */

/**
 * モバイル向けレイアウトかどうか。
 * `true` の場合はサイドバーを右カラムではなくメイン下に表示する。
 *
 * @type {import('vue').ComputedRef<boolean>}
 */
const { isMobile: isMobileLayout } = useMobileLayout();
</script>

<template>
  <v-app>
    <Header />

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-4 py-md-6">
        <v-row class="align-start">
          <!-- メインカラム (左) -->
          <v-col cols="12" md="8">
            <!-- ヘッダーエリア -->
            <slot name="header"></slot>

            <!-- メインコンテンツ -->
            <slot name="main"></slot>

            <!-- モバイル用サイドバー -->
            <div v-if="isMobileLayout" class="mt-6">
              <slot name="sidebar"></slot>
            </div>
          </v-col>

          <!-- サイドバーカラム (右) -->
          <v-col v-if="!isMobileLayout" cols="12" md="4">
            <slot name="sidebar"></slot>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- モーダル -->
    <slot name="modals"></slot>
  </v-app>
</template>
