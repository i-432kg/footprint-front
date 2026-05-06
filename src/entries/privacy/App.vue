<script setup>
import PublicInfoPageLayout from '@/components/layout/PublicInfoPageLayout.vue';
</script>

<template>
  <PublicInfoPageLayout
    title="Privacy"
    subtitle="プライバシーポリシー"
  >
    <!-- 取得する情報 -->
    <section class="mb-6">
      <h2 class="text-h6 font-weight-bold mb-3">取得する情報</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        本アプリでは、ログイン情報、投稿内容、画像、位置情報、コメント内容など、アプリの動作に必要な情報を保存する場合があります。
      </p>
    </section>

    <!-- 入力時の注意 -->
    <section class="mb-6">
      <h2 class="text-h6 font-weight-bold mb-3">入力時の注意</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        本アプリはポートフォリオ用途のデモアプリです。実在する個人情報、機密情報、公開したくない画像や位置情報は入力しないでください。
      </p>
    </section>

    <!-- データ削除 -->
    <section>
      <h2 class="text-h6 font-weight-bold mb-3">データ削除</h2>
      <p class="text-body-1 text-medium-emphasis mb-0">
        保存されたデータは、開発・動作確認・メンテナンスの都合により予告なく削除される場合があります。
      </p>
    </section>
  </PublicInfoPageLayout>
</template>
