import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build worker: src/worker.ts -> dist/worker.mjs (satu ES module self-contained).
// Semua dependensi ter-bundle (ssr.noExternal), gambar di-inline sebagai
// data URI (assetsInlineLimit besar), client JS di-inline via ?raw.
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: "src/worker.ts",
    outDir: "dist",
    emptyOutDir: false,
    target: "node20",
    minify: "esbuild",
    assetsInlineLimit: 200 * 1024 * 1024,
    rollupOptions: {
      output: {
        entryFileNames: "worker.mjs",
      },
    },
  },
  ssr: {
    noExternal: true,
  },
});
