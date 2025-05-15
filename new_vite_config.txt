import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Aktiverar alla nätverksinterface
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443 // Use 443 for HTTPS or 80 for HTTP
    },
    cors: true,
    watch: {
      usePolling: true,
    },
    // Tillåt alla domäner för enklare hantering i Replit
    allowedHosts: ['all', '.replit.dev', '.repl.co', 'localhost', '3eabe322-11fd-420e-9b72-6dc9b22d9093-00-2gpr7cql4w25w.kirk.replit.dev'],
    proxy: {
      // Ställ in proxy för API-anrop för att undvika CORS-problem
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    },
    fs: {
      strict: true,
      allow: ['.'],
    },
    origin: '0.0.0.0:5000'
  }
});