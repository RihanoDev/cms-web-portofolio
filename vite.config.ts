import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify((globalThis as any).process?.env?.VITE_API_BASE || ''),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true,
    port: 2003,
    strictPort: true,
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Teruskan semua response headers termasuk X-Encoded-Response
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Pastikan X-Encoded-Response diteruskan ke browser
            if (proxyRes.headers['x-encoded-response']) {
              proxyRes.headers['access-control-expose-headers'] =
                (proxyRes.headers['access-control-expose-headers'] || '') +
                ', X-Encoded-Response';
            }
          });
        },
      }
    }
  }
})
