import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',   // 后端服务器
        changeOrigin: true,                // 必须改origin
        secure: false,                     // 本地开发无https，设为false
        rewrite: (path) => path             // 保持/api前缀，不改写
      }
    }
  }
})
