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
    port: 5202,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['three', '@react-three/fiber', '@react-three/drei'],
  },
});
