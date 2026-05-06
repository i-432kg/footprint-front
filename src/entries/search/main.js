import { createApp } from 'vue';
import App from './App.vue';
import vuetify from '@/plugins/vuetify';
import pinia from '@/stores';
import { useUserStore } from '@/stores/userStore';

import '@/assets/style.css';

// Thymeleaf の埋め込みデータを取得
const appElement = document.getElementById('app-search');
const username = appElement.dataset.username;

const app = createApp(App);

app.use(pinia);
app.use(vuetify);

const userStore = useUserStore(pinia);
if (username) {
  userStore.setUsername(username);
}

app.mount('#app-search');
