import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { AppSplash } from '../components/ui/app-splash';
import { useAuth } from '../lib/auth/auth-context';
import { useLaunchSplashTransition } from '../lib/ui/launch-splash-transition';

export default component$(() => {
  const auth = useAuth();
  const navigate = useNavigate();
  const splashTransition = useLaunchSplashTransition(auth.ready);

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    const splashReady = track(() => splashTransition.canContinue.value);

    if (!ready || !splashReady) {
      return;
    }

    if (user) {
      navigate('/next/app');
      return;
    }

    navigate('/next/login');
  });

  return (
    <AppSplash
      status={splashTransition.status.value}
      progress={splashTransition.progress.value}
      exiting={auth.ready.value && splashTransition.exiting.value}
    />
  );
});
