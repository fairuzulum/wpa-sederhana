// vite.config.js
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
        // Cache semua file statis
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        
        // Runtime caching untuk API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/strapi\.fairuzulum\.me\/api\/.*/i,
            handler: 'CacheFirst', // Gunakan cache dulu, fallback ke network
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache untuk gambar dari Strapi
            urlPattern: /^https:\/\/strapi\.fairuzulum\.me\/uploads\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        
        // Tambahkan file yang akan di-precache
        additionalManifestEntries: [
          { url: '/offline.html', revision: '1' }
        ],
      },
      
      // Konfigurasi manifest
      manifest: {
        name: 'Katalog Produk Digital',
        short_name: 'Katalog',
        description: 'Katalog produk interaktif untuk tim marketing - Offline Ready',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'catalog-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'catalog-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      
      // Development options
      devOptions: {
        enabled: true // Enable PWA in development
      }
    })
  ]
})