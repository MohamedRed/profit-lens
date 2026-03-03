import { component$, type PropFunction } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import {
  HistoryListSkeleton,
  LoadingSkeletonAnnouncer,
  SkeletonBlock,
} from '../../../components/ui/page-loading-skeleton';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import { saveExplicitBackTarget } from '../../../lib/navigation/explicit-back-target';
import type { OfferRecord } from '../../../lib/types/offer';
import { formatCurrency, formatDistanceKm, formatShortDateTime } from './history-helpers';

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
  const loadingLabel = t(i18n, 'loadingLabel', 'Loading...');

  if (props.isLoadingInitial && props.offers.length === 0) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={loadingLabel} />
        <HistoryListSkeleton itemCount={5} />
      </div>
    );
  }

  return (
    <ul class="ui-history-list">
      {props.offers.length === 0 ? (
        <li class="ui-history-empty">{t(i18n, 'noHistoryMessage', 'No offers saved yet.')}</li>
      ) : null}
      {props.offers.map((item) => {
        const profit = item.netProfitEuro ?? 0;
        const distance = item.routeVerifiedDistanceKm ?? item.distanceKm;
        const distanceLabel = formatDistanceKm(
          props.locale,
          distance,
          t(i18n, 'distanceUnitKm', 'km'),
        );
        return (
          <li key={item.id} class="ui-history-item">
            <Link
              class="ui-history-item-link"
              href={`/next/app/history/details?offerId=${encodeURIComponent(item.id)}&backTo=${encodeURIComponent('/next/app/history')}`}
              onClick$={() => {
                saveExplicitBackTarget('history/details', '/next/app/history');
                props.onHistoryItemClick$(item.id);
              }}
            >
              <div class="ui-history-item-main">
                <p
                  class={{
                    'ui-history-item-profit': true,
                    'is-positive': profit >= 0,
                    'is-negative': profit < 0,
                  }}
                >
                  {formatCurrency(props.locale, profit)}
                </p>
                <p class="ui-history-item-meta">
                  {distanceLabel} • {formatShortDateTime(props.locale, item.createdAt)}
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
        <li class="ui-history-item ui-skeleton-shell" aria-hidden="true">
          <div class="ui-history-item-link">
            <div class="ui-history-item-main ui-skeleton-stack-sm">
              <SkeletonBlock height="34px" width="122px" />
              <SkeletonBlock height="14px" width="168px" />
            </div>
            <div class="ui-history-item-side ui-skeleton-stack-sm">
              <SkeletonBlock height="20px" width="72px" />
              <SkeletonBlock height="18px" width="20px" />
            </div>
          </div>
        </li>
      ) : null}
    </ul>
  );
});
