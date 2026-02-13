import { Slot, component$ } from '@builder.io/qwik';
import { setupAuthProvider } from '../lib/auth/auth-context';
import { setupI18nProvider } from '../lib/i18n/i18n-context';

export default component$(() => {
  setupAuthProvider();
  setupI18nProvider();
  return <Slot />;
});
