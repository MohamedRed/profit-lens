import { component$ } from '@builder.io/qwik';
import { AppBootBackdrop } from '../../components/ui/app-boot-backdrop';

export default component$(() => {
  return <AppBootBackdrop status="Preparing your workspace..." />;
});
