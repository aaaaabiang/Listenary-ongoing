import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/deepl': {
        target: 'https://api-free.deepl.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/deepl/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@services': path.resolve(__dirname, 'src/services'),
    },
  },

    // 如果需要旧分支的构建行为，再取消注释：
  // build: {
  //   sourcemap: true,
  //   minify: false,
  //   rollupOptions: {
  //     manualChunks: {
  //       vendor: ['react', 'react-dom'],
  //     },
  //   },
  // },
});
