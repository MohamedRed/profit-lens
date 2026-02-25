import { component$ } from '@builder.io/qwik';

interface AppSplashProps {
  status?: string;
  subline?: string;
}

export const AppSplash = component$<AppSplashProps>(({ status, subline }) => {
  const resolvedStatus = status ?? 'Preparing your workspace...';
  const resolvedSubline = subline ?? 'Offer intelligence for professional drivers';

  return (
    <div class="ui-splash-viewport" role="status" aria-live="polite" aria-label={resolvedStatus}>
      <div class="ui-splash-shape ui-splash-shape-top" aria-hidden="true" />
      <div class="ui-splash-shape ui-splash-shape-bottom" aria-hidden="true" />

      <div class="ui-splash-shell">
        <div class="ui-splash-brand-row">
          <span class="ui-splash-brand-glyph" aria-hidden="true" />
          <div class="ui-splash-brand-copy">
            <p class="ui-splash-brand-title">Liive Profit</p>
            <p class="ui-splash-brand-subline">{resolvedSubline}</p>
          </div>
        </div>

        <div class="ui-splash-progress-track" aria-hidden="true">
          <span class="ui-splash-progress-indicator" />
        </div>
        <p class="ui-splash-status">{resolvedStatus}</p>
      </div>
    </div>
  );
});
