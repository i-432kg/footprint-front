<script setup>
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
import PostMap from '@/components/post/PostMap.vue';
</script>

<template>
  <v-app>
    <Header />

    <v-main>
      <v-container fluid class="pa-0 fill-height">
        <!-- 投稿マップ -->
        <PostMap />
      </v-container>
    </v-main>

    <Footer />
  </v-app>
</template>

<style scoped>
.fill-height {
  height: 100%;
}
</style>
