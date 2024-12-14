export default {
    root: 'src',
    base: '/',
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: 'src/index.html'
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js', // JS soubory
          chunkFileNames: 'assets/[name].[hash].js', // Chunky JS souborů
          assetFileNames: 'assets/[name].[hash][extname]', // CSS a další soubory
        },
      }
    },
    server: {
      port: 3000
    },
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: ['src/scss']
        }
      }
    },
    resolve: {
        alias: {
          '@': '/src'
        }
    }
}