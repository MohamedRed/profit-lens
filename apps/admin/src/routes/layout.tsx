import { Slot, component$ } from '@builder.io/qwik';
import { setupAdminAuthProvider } from '../lib/auth/admin-auth-context';

export default component$(() => {
  setupAdminAuthProvider();
  return <Slot />;
});
