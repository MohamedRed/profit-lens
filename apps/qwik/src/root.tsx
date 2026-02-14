import { component$ } from '@builder.io/qwik';
import { isDev } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head';

import './global.css';

export default component$(() => {
  const base = import.meta.env.BASE_URL;
  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ProfitLens" />
        <meta name="format-detection" content="telephone=no" />
        <meta
          name="description"
          content="ProfitLens Qwik app with parallel /next deployment and Firebase parity."
        />
        <meta name="profit-lens-next-entry" content="qwik-next" />
        <link rel="preconnect" href="https://profit-lens-prod-2e417.firebaseapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googleapis.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
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
