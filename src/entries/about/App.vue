<script setup>
import PublicInfoPageLayout from '@/components/layout/PublicInfoPageLayout.vue';
</script>

<template>
  <PublicInfoPageLayout
    title="About"
    subtitle="Footprint について"
  >
    <!-- サービス概要 -->
    <section class="mb-6">
      <h2 class="text-h6 font-weight-bold mb-3">サービス概要</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Footprint は、位置情報付きの写真投稿を地図上で共有できるポートフォリオ用Webアプリです。
      </p>
    </section>

    <!-- 主な機能 -->
    <section class="mb-6">
      <h2 class="text-h6 font-weight-bold mb-3">主な機能</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        投稿、検索、地図表示、コメント、マイページなど、SNS風アプリケーションの基本機能を実装しています。
      </p>
    </section>

    <!-- 補足 -->
    <section>
      <h2 class="text-h6 font-weight-bold mb-3">補足</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        本アプリは学習・制作実績の公開を目的としており、商用サービスとして運営しているものではありません。
      </p>
    </section>
  </PublicInfoPageLayout>
</template>
