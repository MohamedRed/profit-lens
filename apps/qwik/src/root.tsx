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
        <meta
          name="description"
          content="ProfitLens Qwik app with parallel /next deployment and Firebase parity."
        />
        <meta name="profit-lens-next-entry" content="qwik-next" />
        <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
        <script src={`${base}firebase-web-config.js`} defer></script>
        {!isDev && <link rel="manifest" href={`${base}manifest.webmanifest`} />}
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
