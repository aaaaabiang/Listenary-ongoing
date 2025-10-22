// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // 读取 .env.development / .env.production 等
  // 后端基址：优先用环境变量，回退本地
  const apiBase = (env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  // WebSocket 基址：由 HTTP(S) 基址推导
  const wsBase = apiBase.replace(/^http/i, 'ws');

  return {
    plugins: [react()],
    // 抑制Node.js弃用警告
    define: {
      'process.env.NODE_OPTIONS': JSON.stringify('--no-deprecation'),
    },
    server: {
      port: 8080,
      proxy: {
        '/deepl': {
          target: 'https://api-free.deepl.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/deepl/, ''),
        },
        // 统一转发到后端（开发环境用）
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: true,   // 如果是 https 目标，建议开
          // 保留路径，不做 rewrite
          configure: (proxy) => {
            proxy.on('proxyReq', (_, req) => {
            });
            proxy.on('error', (err) => {
              // 静默处理代理错误，不输出到控制台
            });
          },
        },
        // WebSocket 代理（开发环境用）
        '/ws': {
          target: wsBase,
          changeOrigin: true,
          ws: true,
          secure: true,
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
  };
});
