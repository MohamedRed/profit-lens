import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { AppSplash } from '../components/ui/app-splash';
import { useAuth } from '../lib/auth/auth-context';
import { useLaunchSplashWindow } from '../lib/ui/launch-splash-window';

export default component$(() => {
  const auth = useAuth();
  const navigate = useNavigate();
  const splashWindowElapsed = useLaunchSplashWindow();

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    const splashReady = track(() => splashWindowElapsed.value);

    if (!ready || !splashReady) {
      return;
    }

    if (user) {
      navigate('/next/app/offer');
      return;
    }

    navigate('/next/login');
  });

  return (
    <AppSplash status="Launching Liive Profit..." />
  );
});
