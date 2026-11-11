import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build bundle client (hydration): src/entry.client.tsx -> dist/client/client.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    minify: "esbuild",
    rollupOptions: {
      input: "src/entry.client.tsx",
      output: {
        entryFileNames: "client.js",
        format: "iife",
      },
    },
  },
});
