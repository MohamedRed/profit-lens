import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { BulkOfferFlow } from '../bulk/bulk-offer-flow';
import { OfferPresenceTransition } from './offer-presence-transition';
import { OfferModeToggle } from './offer-mode-toggle';
import { resolveOfferMode, resolveOfferModeHref, type OfferMode } from './offer-mode-state';
import { SingleOfferFlow } from './single-offer-flow';

interface OfferModeShellProps {
  initialMode?: OfferMode;
}

export const OfferModeShell = component$<OfferModeShellProps>(({ initialMode = 'single' }) => {
  const location = useLocation();
  const mode = useSignal<OfferMode>(
    resolveOfferMode({
      initialMode,
      pathname: location.url.pathname,
      search: location.url.search,
    }),
  );

  useVisibleTask$(({ track }) => {
    const pathname = track(() => location.url.pathname);
    const search = track(() => location.url.search);
    const nextMode = resolveOfferMode({
      initialMode,
      pathname,
      search,
    });
    if (mode.value !== nextMode) {
      mode.value = nextMode;
    }
    const canonicalHref = resolveOfferModeHref(nextMode);
    if (window.location.pathname + window.location.search !== canonicalHref) {
      window.history.replaceState(window.history.state, '', canonicalHref);
    }
  });

  const selectMode$ = $((nextMode: OfferMode) => {
    if (mode.value === nextMode) {
      return;
    }
    mode.value = nextMode;
    window.history.replaceState(window.history.state, '', resolveOfferModeHref(nextMode));
  });

  return (
    <div class="ui-stack ui-offer-screen">
      <OfferModeToggle mode={mode.value} onSelectMode$={selectMode$} />
      <OfferPresenceTransition class="ui-offer-mode-panel" show={mode.value === 'single'}>
        <SingleOfferFlow />
      </OfferPresenceTransition>
      <OfferPresenceTransition class="ui-offer-mode-panel" show={mode.value === 'bulk'}>
        <BulkOfferFlow />
      </OfferPresenceTransition>
    </div>
  );
});
