import { component$ } from '@builder.io/qwik';
import { AppSplash } from '../../components/ui/app-splash';
import { t, useI18n } from '../../lib/i18n/i18n-context';

export default component$(() => {
  const i18n = useI18n();
  return <AppSplash status={t(i18n, 'loadingLabel', 'Loading...')} progress={1} exiting={false} />;
});
