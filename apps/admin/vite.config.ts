import { defineConfig, type UserConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig((): UserConfig => {
  return {
    base: '/',
    plugins: [
      qwikCity({
        basePathname: '/',
      } as never),
      qwikVite(),
      tsconfigPaths({ root: '.' }),
    ],
    optimizeDeps: {
      exclude: ['@firebase/firestore'],
    },
  };
});
