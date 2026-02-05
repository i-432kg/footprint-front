<script setup>
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
import PostMap from '@/components/post/PostMap.vue';
</script>

<template>
  <div class="app-container">
    <Header />
    <main class="app-main">
      <PostMap />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}
</style>
