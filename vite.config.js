// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      // This rule handles translation API requests
      '/deepl': {
        target: 'https://api-free.deepl.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/deepl/, ''),
      },
      // This rule forwards all other API requests to your backend
      '/api': {
        target: 'http://localhost:3000', // Your backend server address
        changeOrigin: true,
        // This part adds logging to help with debugging
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[Vite Proxy] Forwarding request to backend: ${req.method} ${req.url}`);
          });
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Error:', err);
          });
        }
      },
      '/ws': {
        target: 'ws://localhost:3000',
        changeOrigin: true,
        ws: true,
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
});
