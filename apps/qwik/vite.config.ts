import { defineConfig, type UserConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }): UserConfig => {
  return {
    base: '/next/',
    plugins: [
      qwikCity({
        basePathname: '/next/',
      } as never),
      qwikVite(),
      tsconfigPaths({ root: '.' }),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: null,
          globPatterns: ['**/*.{js,css,json,webmanifest,png,svg,ico,woff2,ttf}'],
          navigateFallbackDenylist: [/^\/$/, /^\/index\.html$/],
        },
        manifest: {
          name: 'Liive Profit',
          short_name: 'Liive Profit',
          start_url: '/next/',
          scope: '/next/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'icons/Icon-192-v2.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/Icon-512-v2.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'icons/Icon-maskable-512-v2.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    optimizeDeps: {
      exclude: ['@firebase/firestore'],
    },
    server: {
      headers: {
        'Cache-Control': 'public, max-age=0',
      },
    },
    preview: {
      headers: {
        'Cache-Control': mode === 'production' ? 'public, max-age=600' : 'public, max-age=0',
      },
    },
  };
});
