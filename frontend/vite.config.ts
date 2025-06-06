
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// For Replit, we need to determine the backend URL dynamically
const getBackendUrl = () => {
  if (process.env.REPL_SLUG) {
    // We're in Replit - use hostname-based detection
    // Replace 00- with 01- to target the backend service in the same Replit 
    return process.env.REPL_SLUG 
      ? `https://${process.env.REPL_ID.replace('00-', '01-')}.${process.env.REPL_OWNER}.repl.co` 
      : 'http://localhost:8001';
  }
  
  // Local development
  return 'http://localhost:8001';
};

const backendUrl = getBackendUrl();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@context': path.resolve(__dirname, './src/context'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    cors: true,
    hmr: {
      host: '0.0.0.0',
    },
    watch: {
      usePolling: true,
    },
    fs: {
      strict: false,
      allow: ['..'],
    },
    allowedHosts: ['3eabe322-11fd-420e-9b72-6dc9b22d9093-00-2gpr7cql4w25w.kirk.replit.dev']
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    cors: true
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(`${backendUrl}/api`),
  }
});
