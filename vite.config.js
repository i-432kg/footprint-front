import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import devtoolsJson from "vite-plugin-devtools-json";
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    devtoolsJson(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
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
    rollupOptions: {
      input: {
        // 各画面ごとのエントリーポイントを定義
        // login: resolve(__dirname, 'src/entries/login/main.js'),
        // map: resolve(__dirname, 'src/entries/map/main.js'),
        // mypage: resolve(__dirname, 'src/entries/mypage/main.js'),
        // search: resolve(__dirname, 'src/entries/search/main.js'),
        timeline: resolve(__dirname, 'src/entries/timeline/main.js'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  }
})
