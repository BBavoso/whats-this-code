import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        index: resolve(__dirname, 'src/index.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        highlightMenu: resolve(__dirname, 'src/highlightMenu.ts'),
        history_index: resolve(__dirname, 'src/history_index.tsx'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
      external: ['history/**'],
    },
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: '',
  },
});
