<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="copyright">&copy; {{ currentYear }} Footprint. All rights reserved.</p>
      <nav class="footer-nav">
        <a href="/about">About</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 2rem 1rem;
  margin-top: auto;
  color: #6c757d;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-nav {
  display: flex;
  gap: 1.5rem;
}

.footer-nav a {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.footer-nav a:hover {
  color: #212529;
}

.copyright {
  font-size: 0.9rem;
  margin: 0;
}
</style>
