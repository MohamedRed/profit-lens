import { component$ } from '@builder.io/qwik';
import { isDev } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

import './global.css';

const buildRefreshGuard = (basePath: string): string => `
(() => {
  try {
    if (!('serviceWorker' in navigator) || !('caches' in window)) return;
    const basePath = ${JSON.stringify(basePath)};
    const hash = document.documentElement.getAttribute('q:manifest-hash');
    const clearNextRuntime = () =>
      Promise.all([
        navigator.serviceWorker.getRegistrations().then((regs) =>
          Promise.all(
            regs
              .filter((reg) => new URL(reg.scope).pathname.startsWith(basePath))
              .map((reg) => reg.unregister()),
          ),
        ),
        caches.keys().then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.includes('workbox') || key.includes('/next/'))
              .map((key) => caches.delete(key)),
          ),
        ),
      ]);
    const chunkReloadSessionKeyPrefix = 'pl-next-chunk-load-reload';
    const shouldRecoverFromChunkFailure = (reason) => {
      const message =
        typeof reason === 'string'
          ? reason
          : reason && typeof reason === 'object' && typeof reason.message === 'string'
            ? reason.message
            : String(reason || '');
      if (!message) return false;
      const normalized = message.toLowerCase();
      return (
        normalized.includes('failed to fetch dynamically imported module') ||
        normalized.includes('expected a javascript-or-wasm module script but the server responded with a mime type of "text/html"') ||
        normalized.includes('/next/build/')
      );
    };
    const attemptChunkFailureRecovery = (reason) => {
      if (!shouldRecoverFromChunkFailure(reason)) return;
      const chunkReloadSessionKey = \`\${chunkReloadSessionKeyPrefix}:\${hash || 'no-hash'}\`;
      if (sessionStorage.getItem(chunkReloadSessionKey) === '1') return;
      sessionStorage.setItem(chunkReloadSessionKey, '1');
      clearNextRuntime().finally(() => {
        window.location.reload();
      });
    };

    window.addEventListener(
      'error',
      (event) => {
        const target = event && event.target;
        if (target && typeof target === 'object' && 'tagName' in target && target.tagName === 'SCRIPT') {
          const scriptSource = typeof target.src === 'string' ? target.src : '';
          if (scriptSource.includes('/next/build/')) {
            attemptChunkFailureRecovery(scriptSource);
            return;
          }
        }
        attemptChunkFailureRecovery(event.error || event.message);
      },
      true,
    );
    window.addEventListener('unhandledrejection', (event) => {
      attemptChunkFailureRecovery(event.reason);
    });

    if (!hash) return;
    const hashKey = 'pl-next-manifest-hash';
    const reloadKey = 'pl-next-manifest-reload-hash';
    const lastHash = localStorage.getItem(hashKey);

    if (!lastHash) {
      localStorage.setItem(hashKey, hash);
      return;
    }
    if (lastHash === hash) {
      localStorage.removeItem(reloadKey);
      return;
    }
    if (localStorage.getItem(reloadKey) === hash) return;

    localStorage.setItem(hashKey, hash);
    localStorage.setItem(reloadKey, hash);

    clearNextRuntime().finally(() => {
      window.location.reload();
    });
  } catch (_) {}
})();
`;

export default component$(() => {
  const base = import.meta.env.BASE_URL;
  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Liive Profit" />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="description"
          content="Liive Profit Qwik app with parallel /next deployment and Firebase parity."
        />
        <meta name="profit-lens-next-entry" content="qwik-next" />
        <link rel="preconnect" href="https://profit-lens-prod-2e417.firebaseapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://billing.stripe.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
        {!isDev && <script dangerouslySetInnerHTML={buildRefreshGuard(base)}></script>}
        <script src={`${base}firebase-web-config.js`} defer></script>
        {!isDev && <link rel="manifest" href={`${base}manifest.webmanifest`} />}
        {!isDev && <script src={`${base}registerSW.js`} defer></script>}
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
