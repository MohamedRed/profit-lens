import { useAuth } from '../../../../lib/auth/auth-context';
import { component$ } from '@builder.io/qwik';
import { BillingManager } from './billing-manager';

export default component$(() => {
  const auth = useAuth();

  return <BillingManager uid={auth.user.value?.uid ?? null} />;
});
