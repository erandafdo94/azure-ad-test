// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://localhost:7289",
        changeOrigin: true,
        secure: false, // If you're using self-signed certificate
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
