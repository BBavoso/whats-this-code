import { defineConfig } from 'vite';
import { resolve } from 'path';
import.meta.env.local

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        ai_interaction: resolve(__dirname, 'src/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
    emptyOutDir: true,
    sourcemap: false,
    assetsDir: '',
  },
});
