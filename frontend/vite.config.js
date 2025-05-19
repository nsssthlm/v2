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
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    cors: {
      origin: "*",
    },
    hmr: {
      clientPort: 443,
    },
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8001",
        changeOrigin: true,
        configure: (proxy, options) => {
          // Lägg till förbättrad felhantering för proxy
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Proxy error: kunde inte ansluta till backend');
          });
        },
      },
    },
    allowedHosts: [
      "3eabe322-11fd-420e-9b72-6dc9b22d9093-00-2gpr7cql4w25w.kirk.replit.dev",
      "valvxv1.replit.app",
      ".replit.app",
      ".replit.dev",
    ],
  },
});
