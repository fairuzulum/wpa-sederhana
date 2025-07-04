import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Cache static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        // Add runtime caching for API responses
        runtimeCaching: [
          {
            // Cache products API
            urlPattern: ({ url }) => url.pathname.startsWith('/api/products'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'products-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200], // Cache successful responses and opaque responses
              },
            },
          },
          {
            // Cache categories API
            urlPattern: ({ url }) => url.pathname.startsWith('/api/categories'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'categories-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache hero banners API
            urlPattern: ({ url }) => url.pathname.startsWith('/api/hero-banner-kategoris'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'hero-banners-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Katalog Produk Digital',
        short_name: 'Katalog',
        description: 'Katalog produk interaktif untuk tim marketing',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})