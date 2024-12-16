import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  root: 'src',
  base: mode === 'development' ? '/' : '/travelking-challenge/',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    assetsDir: '',
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: {
        main: 'src/index.html',
      },
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
  plugins: [viteSingleFile()],
  server: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['src/scss'],
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}));