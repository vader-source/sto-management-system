import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Підключаємо плагін React, який відповідає за автоматичне підключення React у файли
  plugins: [react()],
  
  build: {
    // Вказуємо, куди збирати готовий фронтенд
    outDir: 'dist',
    // Очищуємо папку перед кожною збіркою
    emptyOutDir: true,
  },

  // Налаштування для коректного відображення JSX
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },

  // Якщо ти захочеш запустити фронтенд окремо локально
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:10000'
    }
  }
})