import { component$, type PropFunction } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { OfferRecord } from '../../../lib/types/offer';
import { formatCurrency, formatShortDateTime } from './history-helpers';

interface HistoryListPanelProps {
  offers: OfferRecord[];
  locale: string;
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onHistoryItemClick$: PropFunction<(offerId: string) => void>;
}

export const HistoryListPanel = component$<HistoryListPanelProps>((props) => {
  const i18n = useI18n();

  if (props.isLoadingInitial && props.offers.length === 0) {
    return <p class="ui-history-empty">{t(i18n, 'loadingLabel', 'Loading...')}</p>;
  }

  return (
    <ul class="ui-history-list">
      {props.offers.length === 0 ? (
        <li class="ui-history-empty">{t(i18n, 'noHistoryMessage', 'No offers saved yet.')}</li>
      ) : null}
      {props.offers.map((item) => {
        const profit = item.netProfitEuro ?? 0;
        const distance = item.routeVerifiedDistanceKm ?? item.distanceKm;
        return (
          <li key={item.id} class="ui-history-item">
            <Link
              class="ui-history-item-link"
              href={`/next/app/history/details/?offerId=${encodeURIComponent(item.id)}`}
              onClick$={() => props.onHistoryItemClick$(item.id)}
            >
              <div class="ui-history-item-main">
                <p class="ui-history-item-profit">{formatCurrency(props.locale, profit)}</p>
                <p class="ui-history-item-meta">
                  {distance.toFixed(1)} km • {formatShortDateTime(props.locale, item.createdAt)}
                </p>
              </div>
              <div class="ui-history-item-side">
                <p class="ui-history-item-payout">{formatCurrency(props.locale, item.payoutEuro)}</p>
                <span class="material-icons-outlined ui-history-item-chevron" aria-hidden="true">
                  chevron_right
                </span>
              </div>
            </Link>
          </li>
        );
      })}
      {props.isLoadingMore && props.hasMore ? (
        <li class="ui-history-empty">{t(i18n, 'loadingLabel', 'Loading...')}</li>
      ) : null}
    </ul>
  );
});
