<script setup>
import { ref } from 'vue';
import '@/assets/style.css'

const searchQuery = ref('');

const search = () => {
  if (!searchQuery.value.trim()) return;
  const params = new URLSearchParams({ q: searchQuery.value.trim() });
  window.location.href = `/search?${params.toString()}`;
};
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-left">
        <a href="/" class="logo">LOGO</a>
        <nav class="nav-links">
          <a href="/map">Maps</a>
          <a href="/timeline" class="active">TL</a>
        </nav>
      </div>

      <div class="header-center">
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="キーワードで検索"
            class="search-input"
            @keydown.enter="search"
          />
        </div>
      </div>

      <div class="header-right">
        <a href="/mypage" class="icon-link">MyPage</a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
  height: 60px;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
  text-decoration: none;
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
}

.nav-links a.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.header-center {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
}

.search-input {
  width: 100%;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: #f0f2f5;
}

.icon-link {
  text-decoration: none;
  color: #333;
}
</style>
