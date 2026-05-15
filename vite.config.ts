import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [react(), Icons({ compiler: "jsx", jsx: "react" }), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
});
