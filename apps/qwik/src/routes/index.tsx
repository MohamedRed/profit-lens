import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../lib/auth/auth-context';

export default component$(() => {
  const auth = useAuth();
  const navigate = useNavigate();

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const user = track(() => auth.user.value);

    if (!ready) {
      return;
    }

    if (user) {
      navigate('/next/app/offer');
      return;
    }

    navigate('/next/login');
  });

  return (
    <div class="ui-page">
      <div class="ui-card ui-stack" style="justify-items:center;">
        <div class="ui-spinner" />
        <div class="ui-status">Loading...</div>
      </div>
    </div>
  );
});
