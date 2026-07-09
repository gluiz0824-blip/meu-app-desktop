import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: "frontend",
  server: {
    proxy: {
      "/api": "http://127.0.0.1:3333"
    }
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});
