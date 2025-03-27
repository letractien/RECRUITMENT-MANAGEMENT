import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      jsx: true // Enable JSX support
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173
  },
  esbuild: {
    loader: {
      '.js': 'jsx' // Treat JS files as JSX
    }
  }
}) 