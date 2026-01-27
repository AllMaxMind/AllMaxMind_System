import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Increase chunk size limit to accommodate large dependencies
        chunkSizeWarningLimit: 1500,
        // Optimize for production
        minify: 'terser',
        sourcemap: false, // Disable sourcemap in production to avoid Sentry issues
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor': [
                'react',
                'react-dom',
                '@sentry/react',
              ],
              'supabase': [
                '@supabase/supabase-js',
              ],
              'gemini': [
                '@google/genai',
              ]
            }
          }
        }
      }
    };
});
