import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Served from "/" locally; the GitHub Pages workflow sets VITE_BASE to the
  // repo subpath (e.g. "/coinflip-ui/") so assets and routing resolve there.
  base: process.env.VITE_BASE || '/',
  root: 'app',
  envDir: projectRoot,
  envPrefix: ['VITE_', 'TONCENTER_'],
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@wrappers': path.resolve(projectRoot, 'wrappers-ts'),
      '@': path.resolve(projectRoot, 'app/src'),
    },
  },
  build: {
    emptyOutDir: true,
    outDir: '../dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react/') || id.includes('/react-dom/'))
            return 'react';
          if (id.includes('/@ton/ton/') || id.includes('/@ton/core/'))
            return 'ton-sdk';
          if (id.includes('/@tonconnect/')) return 'tonconnect';
          return undefined;
        },
      },
    },
  },
  server: {
    fs: {
      allow: ['.', path.resolve(projectRoot, 'wrappers-ts')],
    },
    port: 5173,
  },
});
