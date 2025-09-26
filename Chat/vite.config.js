import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import axios from 'axios'

export const http = axios.create({
  baseURL: '/api',   // 關鍵：讓 /user/login -> /api/user/login
  withCredentials: true, // 若後端要 cookie
})

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  server: {
    // 用本機即可；若想讓區網其他裝置可訪問可改為 '0.0.0.0'
    host: 'localhost',
    // Vite 慣用 5173；若被占用可換 5174 等
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        // 如果你有本地後端，改成它的位址（示例：localhost:8889）
        // 若目前沒有後端，就先保留或註解掉都可以
        target: 'http://localhost:8889',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
