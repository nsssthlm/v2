import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
  server: {
    host: true,
    port: 5000,
    strictPort: true,
    cors: {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204
    },
    hmr: {
      clientPort: 443,
    },
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8001",
        changeOrigin: true,
      },
    },
    fs: {
      strict: false,
    },
    watch: {
      usePolling: true,
      interval: 1000
    },
    allowedHosts: ["fbe63b48-eab5-47bd-acbc-11b3091c8b79-00-37gww3ixj0zyl.janeway.replit.dev"]
  },
});
