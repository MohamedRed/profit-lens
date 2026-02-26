import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import {
  consumeSplashLaunchEffects,
  playSplashSting,
  shouldReduceSplashMotion,
  triggerSplashHaptic,
} from '../../lib/ui/launch-splash-effects';

interface AppSplashProps {
  exiting?: boolean;
  progress?: number;
  status?: string;
  subline?: string;
}

export const AppSplash = component$<AppSplashProps>(({ exiting, progress, status, subline }) => {
  const resolvedStatus = status ?? 'Preparing your workspace...';
  const resolvedSubline = subline ?? 'Offer intelligence for professional drivers';
  const hasPlayedExitHaptic = useSignal(false);
  const normalizedProgress = Math.min(1, Math.max(0, progress ?? 0));
  const progressLabel = `${Math.round(normalizedProgress * 100)}%`;

  useVisibleTask$(({ cleanup }) => {
    if (shouldReduceSplashMotion() || !consumeSplashLaunchEffects()) {
      return;
    }

    const timerId = window.setTimeout(() => {
      triggerSplashHaptic([8, 22, 12]);
      void playSplashSting();
    }, 220);

    cleanup(() => {
      window.clearTimeout(timerId);
    });
  });

  useVisibleTask$(({ track }) => {
    const isExiting = track(() => Boolean(exiting));
    if (!isExiting || hasPlayedExitHaptic.value || shouldReduceSplashMotion()) {
      return;
    }
    hasPlayedExitHaptic.value = true;
    triggerSplashHaptic(8);
  });

  return (
    <div
      class={{ 'ui-splash-viewport': true, 'is-exiting': Boolean(exiting) }}
      role="status"
      aria-live="polite"
      aria-label={resolvedStatus}
    >
      <div class="ui-splash-backdrop-noise" aria-hidden="true" />
      <div class="ui-splash-cinema-beam" aria-hidden="true" />
      <div class="ui-splash-cinema-glow ui-splash-cinema-glow-top" aria-hidden="true" />
      <div class="ui-splash-cinema-glow ui-splash-cinema-glow-bottom" aria-hidden="true" />

      <div class="ui-splash-shell">
        <div class="ui-splash-brand-row">
          <div class="ui-splash-logo-wrap" aria-hidden="true">
            <svg class="ui-splash-logo" viewBox="0 0 1024 1024" focusable="false">
              <rect width="1024" height="1024" fill="#ff1f2d" />
              <ellipse cx="512" cy="820" rx="324" ry="90" fill="none" stroke="#ffffff" stroke-width="48" />
              <path
                d="M512 196c-130 0-236 106-236 236 0 78 32 134 89 210 42 56 95 116 147 173 52-57 105-117 147-173 57-76 89-132 89-210 0-130-106-236-236-236z"
                fill="#ffffff"
              />
              <circle cx="512" cy="392" r="88" fill="#ff1f2d" />
              <circle cx="512" cy="392" r="40" fill="#ffffff" />
            </svg>
            <span class="ui-splash-logo-bloom" />
            <span class="ui-splash-logo-sheen" />
          </div>
          <div class="ui-splash-brand-copy">
            <p class="ui-splash-brand-title">Liive Profit</p>
            <p class="ui-splash-brand-subline">{resolvedSubline}</p>
          </div>
        </div>

        <div class="ui-splash-progress-track" aria-hidden="true">
          <span
            class="ui-splash-progress-indicator"
            style={{ '--ui-splash-progress': normalizedProgress.toFixed(4) }}
          />
        </div>
        <div class="ui-splash-progress-meta" aria-hidden="true">
          <span class="ui-splash-progress-tag">Boot sequence</span>
          <span class="ui-splash-progress-value">{progressLabel}</span>
        </div>
        <p class="ui-splash-status">{resolvedStatus}</p>
      </div>
    </div>
  );
});
