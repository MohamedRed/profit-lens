import { component$ } from '@builder.io/qwik';

interface AppBootBackdropProps {
  status?: string;
}

export const AppBootBackdrop = component$<AppBootBackdropProps>(({ status }) => {
  const resolvedStatus = status ?? 'Preparing Liive Profit...';

  return (
    <div class="ui-boot-backdrop" role="status" aria-live="polite" aria-label={resolvedStatus}>
      <div class="ui-boot-backdrop-noise" aria-hidden="true" />
      <div class="ui-boot-backdrop-glow ui-boot-backdrop-glow-top" aria-hidden="true" />
      <div class="ui-boot-backdrop-glow ui-boot-backdrop-glow-bottom" aria-hidden="true" />
    </div>
  );
});
