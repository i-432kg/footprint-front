<script setup>
import TheHeader from '@/components/layout/TheHeader.vue';
import TheFooter from '@/components/layout/TheFooter.vue';
import PostMap from '@/components/post/PostMap.vue';
</script>

<template>
  <v-app>
    <TheHeader />

    <v-main>
      <v-container fluid class="pa-0 fill-height">
        <!-- 投稿マップ -->
        <PostMap />
      </v-container>
    </v-main>

    <TheFooter />
  </v-app>
</template>

<style scoped>
.fill-height {
  height: 100%;
}
</style>
