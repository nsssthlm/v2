import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
      },
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
      // Add allowedHosts to fix the blocking issue with Replit domain
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      },
      fs: {
        strict: true,
        allow: ['.'],
      },
      // Add the Replit domain to allowed hosts
      origin: '0.0.0.0:5000',
      allowedHosts: ['all', '3eabe322-11fd-420e-9b72-6dc9b22d9093-00-2gpr7cql4w25w.kirk.replit.dev'],
    },
    define: {
      // Expose environment variables to your client-side code
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://0.0.0.0:8000/api'),
    },
    preview: {
      port: 5000,
      strictPort: true,
    }
  };
});
