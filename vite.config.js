import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import vueDevTools from 'vite-plugin-vue-devtools'
import devtoolsJson from 'vite-plugin-devtools-json'

export default defineConfig(({ command, mode }) => {
  const rootDir = fileURLToPath(new URL('.', import.meta.url))

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
    server: isDev ? {
      origin: 'http://localhost:5173',
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    } : undefined,
    build: {
      manifest: 'manifest.json',
      rollupOptions: {
        input: {
          login: resolve(rootDir, 'src/entries/login/main.js'),
          map: resolve(rootDir, 'src/entries/map/main.js'),
          mypage: resolve(rootDir, 'src/entries/mypage/main.js'),
          search: resolve(rootDir, 'src/entries/search/main.js'),
          timeline: resolve(rootDir, 'src/entries/timeline/main.js'),
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
