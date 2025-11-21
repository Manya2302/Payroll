import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  publicDir:false,
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  optimizeDeps: {
    include: ['@babel/traverse']
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: false,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // build: {
  //   rollupOptions: {
  //     input: './src/main.jsx',
  //   },
  //   emptyOutDir: false, // Prevent deletion of uploads
  // },
  // publicDir: false, // Vite won't copy public folder automatically

});