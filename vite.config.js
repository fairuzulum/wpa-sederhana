// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
// tailwindcss
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), // Tambahkan plugin Tailwind CSS
    vue(),
    VitePWA({
      // Aktifkan dan konfigurasikan plugin
      registerType: 'autoUpdate', // Otomatis update service worker
      injectRegister: 'auto',
      workbox: {
        // Aturan untuk caching file
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
      },
      // Konfigurasi manifest untuk "Install to Home Screen"
      manifest: {
        name: 'Katalog Produk Digital',
        short_name: 'Katalog',
        description: 'Katalog produk interaktif untuk tim marketing',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})