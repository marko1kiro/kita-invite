import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
    // Client tidak mengimpor gambar; limit tinggi sekadar pengaman.
    assetsInlineLimit: 100000000,
    rollupOptions: {
      input: 'src/client.tsx',
      output: {
        entryFileNames: 'client.js',
        chunkFileNames: 'client-[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
