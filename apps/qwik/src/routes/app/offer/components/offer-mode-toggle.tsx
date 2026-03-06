import { component$, type QRL } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { OfferMode } from './offer-mode-state';

interface OfferModeToggleProps {
  mode: OfferMode;
  onSelectMode$: QRL<(mode: OfferMode) => void>;
}

export const OfferModeToggle = component$<OfferModeToggleProps>(({ mode, onSelectMode$ }) => {
  const i18n = useI18n();
  const isSingle = mode === 'single';
  const isBulk = mode === 'bulk';

  return (
    <nav class="ui-offer-mode-segmented" aria-label={t(i18n, 'offerModeToggleLabel', 'Offer mode')}>
      <button
        type="button"
        class={{ 'ui-offer-mode-segment-btn': true, 'is-active': isSingle }}
        aria-current={isSingle ? 'page' : undefined}
        onClick$={() => onSelectMode$('single')}
      >
        <span class="material-icons-outlined ui-offer-mode-segment-icon" aria-hidden="true">
          looks_one
        </span>
        <span>{t(i18n, 'offerModeSingleLabel', 'Single')}</span>
      </button>
      <button
        type="button"
        class={{ 'ui-offer-mode-segment-btn': true, 'is-active': isBulk }}
        aria-current={isBulk ? 'page' : undefined}
        onClick$={() => onSelectMode$('bulk')}
      >
        <span class="material-icons-outlined ui-offer-mode-segment-icon" aria-hidden="true">
          library_add_check
        </span>
        <span>{t(i18n, 'offerModeBulkLabel', 'Bulk')}</span>
      </button>
    </nav>
  );
});
