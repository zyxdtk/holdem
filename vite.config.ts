import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueTsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  root: 'src',
  plugins: [vue(), vueTsx()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})