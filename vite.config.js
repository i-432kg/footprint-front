import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import vueDevTools from 'vite-plugin-vue-devtools'
import devtoolsJson from 'vite-plugin-devtools-json'

export default defineConfig(({ command, mode }) => {

  const isDev = command === 'serve' || mode === 'development'

  return {
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
      // 開発時のみ、Vue DevTools と DevTools JSON を有効化
      ...(isDev ? [vueDevTools(), devtoolsJson()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      manifest: 'manifest.json',
      rollupOptions: {
        input: {
          login: resolve(__dirname, 'src/entries/login/main.js'),
          map: resolve(__dirname, 'src/entries/map/main.js'),
          mypage: resolve(__dirname, 'src/entries/mypage/main.js'),
          search: resolve(__dirname, 'src/entries/search/main.js'),
          timeline: resolve(__dirname, 'src/entries/timeline/main.js'),
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  }
})
