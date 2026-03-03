import { component$ } from '@builder.io/qwik';
import { AppSplash } from '../../components/ui/app-splash';

export default component$(() => {
  return <AppSplash status="Preparing your workspace..." progress={0.98} />;
});
