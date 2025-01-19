import { defineConfig } from 'vite';
import { resolve } from 'path';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'dist');

export default defineConfig({
  root,
  base: '/',
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
      },
    },
  },
  server: {
    hmr: true, // Enable HMR
    watch: {
      usePolling: true, // Use polling for file changes
    },
  },
});

