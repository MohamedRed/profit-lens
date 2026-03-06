import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';

type OfferMode = 'single' | 'bulk';

interface OfferModeToggleProps {
  mode: OfferMode;
}

export const OfferModeToggle = component$<OfferModeToggleProps>(({ mode }) => {
  const i18n = useI18n();
  const isSingle = mode === 'single';
  const isBulk = mode === 'bulk';

  return (
    <nav class="ui-offer-mode-segmented" aria-label={t(i18n, 'offerModeToggleLabel', 'Offer mode')}>
      <Link
        href="/next/app/offer"
        class={{ 'ui-offer-mode-segment-btn': true, 'is-active': isSingle }}
        aria-current={isSingle ? 'page' : undefined}
      >
        <span class="material-icons-outlined ui-offer-mode-segment-icon" aria-hidden="true">
          local_shipping
        </span>
        <span>{t(i18n, 'offerModeSingleLabel', 'Single')}</span>
      </Link>
      <Link
        href="/next/app/offer/bulk"
        class={{ 'ui-offer-mode-segment-btn': true, 'is-active': isBulk }}
        aria-current={isBulk ? 'page' : undefined}
      >
        <span class="material-icons-outlined ui-offer-mode-segment-icon" aria-hidden="true">
          calendar_view_day
        </span>
        <span>{t(i18n, 'offerModeBulkLabel', 'Bulk')}</span>
      </Link>
    </nav>
  );
});
