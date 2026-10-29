import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');

/** Isolated Vite app for Phase 3 PDF generation — does not alter production routes. */
export default defineConfig({
  root: dir,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5199,
    strictPort: true,
    watch: {
      ignored: ['**/tmp/**', '**/playwright-report/**', '**/test-results/**'],
    },
  },
  optimizeDeps: {
    exclude: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});
