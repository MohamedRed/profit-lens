import { component$ } from '@builder.io/qwik';
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
        <meta name="description" content="Profit Lens admin dashboard" />
        <link rel="icon" type="image/svg+xml" href={`${base}favicon.svg`} />
        <script src={`${base}firebase-web-config.js`} defer></script>
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
