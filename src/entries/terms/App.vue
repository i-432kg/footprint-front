<script setup>
import PublicInfoPageLayout from '@/components/layout/PublicInfoPageLayout.vue';
</script>

<template>
  <PublicInfoPageLayout
    title="Terms"
    subtitle="利用規約"
  >
    <!-- はじめに -->
    <section class="mb-6">
      <h2 class="text-h6 font-weight-bold mb-3">はじめに</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        本アプリはポートフォリオ用途のデモアプリです。
      </p>
    </section>

    <!-- 禁止事項 -->
    <section class="mb-6">
      <h2 class="text-h6 font-weight-bold mb-3">禁止事項</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        利用者は、法令または公序良俗に反する内容、第三者の権利を侵害する内容、個人情報を含む内容を投稿しないものとします。
      </p>
    </section>

    <!-- データと機能 -->
    <section>
      <h2 class="text-h6 font-weight-bold mb-3">データと機能</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        本アプリの内容、機能、保存データは、予告なく変更・削除される場合があります。
      </p>
    </section>
  </PublicInfoPageLayout>
</template>
