// vite.config.js — Vite Build Configuration for HustleHub+ Client
// Configures React plugin, dev server proxy, and test environment.
//
// Vite configuration: https://vitejs.dev/config/
// Vite server proxy: https://vitejs.dev/config/server-options.html#server-proxy
// Vitest configuration: https://vitest.dev/config/
// @vitejs/plugin-react: https://www.npmjs.com/package/@vitejs/plugin-react

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
