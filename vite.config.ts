/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],

  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },

  // Vite 8 Rolldown can hang while crawling three.js / R3F. Serve those raw.
  optimizeDeps: {
    exclude: ['three', '@react-three/fiber', '@react-three/drei'],
  },

  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.localhost',
      'kingfisherwings-frontend.onrender.com',
      '.onrender.com',
    ],
    proxy: {
      '/backend': {
        target: 'https://kingfisherwings-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        timeout: 120_000,
        proxyTimeout: 120_000,
        rewrite: (requestPath) => requestPath.replace(/^\/backend/, ''),
        cookieDomainRewrite: 'localhost',
      },
    },
  },

  preview: {
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.localhost',
      'kingfisherwings-frontend.onrender.com',
      '.onrender.com',
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },

  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
}));
