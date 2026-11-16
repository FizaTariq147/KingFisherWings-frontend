import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');

export default defineConfig({
  root: dir,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5203,
    strictPort: true,
    proxy: {
      // Same CORS bypass as app vite.config.ts for official Fresa sample browse.
      '/fresa-sample': {
        target: 'https://fresatechnologies.com',
        changeOrigin: true,
        secure: true,
        timeout: 120_000,
        proxyTimeout: 120_000,
        rewrite: (requestPath) => requestPath.replace(/^\/fresa-sample/, ''),
      },
    },
    fs: {
      allow: [root],
    },
  },
  optimizeDeps: {
    exclude: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});
