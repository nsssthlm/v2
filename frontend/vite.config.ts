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
      cors: true,
      hmr: {
        host: 'localhost',
      },
      allowedHosts: [
        'localhost',
        'fbe63b48-eab5-47bd-acbc-11b3091c8b79-00-37gww31xj0zy1.janeway.replit.dev'
      ],
    },
    define: {
      // Expose environment variables to your client-side code
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:8000/api'),
    },
  };
});
