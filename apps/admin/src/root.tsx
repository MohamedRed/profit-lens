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
        <meta name="theme-color" content="#0b1220" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Profit Lens Admin" />
        <meta name="application-name" content="Profit Lens Admin" />
        <meta name="description" content="Profit Lens admin dashboard" />
        <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${base}icons/Icon-192-v2.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${base}apple-touch-icon-v2.png`} />
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
