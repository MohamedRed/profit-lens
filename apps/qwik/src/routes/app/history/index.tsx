import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../lib/auth/auth-context';
import { watchOffers, watchOfferStats } from '../../../lib/features/offers/offers-service';
import type { OfferRecord, OfferStatsDay } from '../../../lib/types/offer';
import { t, useI18n } from '../../../lib/i18n/i18n-context';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDate = (value: Date | null) => {
  if (!value) {
    return 'n/a';
  }
  return value.toLocaleDateString();
};

export default component$(() => {
  const i18n = useI18n();
  const auth = useAuth();
  const offers = useSignal<OfferRecord[]>([]);
  const stats = useSignal<OfferStatsDay[]>([]);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      offers.value = [];
      stats.value = [];
      return;
    }

    const unsubscribeOffers = watchOffers(user.uid, (items) => {
      offers.value = items;
    });
    const unsubscribeStats = watchOfferStats(user.uid, (items) => {
      stats.value = items;
    });

    cleanup(() => {
      unsubscribeOffers();
      unsubscribeStats();
    });
  });

  const totalNetProfit = offers.value.reduce((sum, item) => sum + (item.netProfitEuro ?? 0), 0);

  return (
    <div class="pl-stack">
      <div class="pl-row">
        <div class="pl-list-item" style="min-width:220px; flex:1;">
          <strong>{t(i18n, 'historyTabLabel', 'History')}</strong>
          <div>{offers.value.length} offers</div>
        </div>
        <div class="pl-list-item" style="min-width:220px; flex:1;">
          <strong>{t(i18n, 'netProfitLabel', 'Net profit')}</strong>
          <div>{formatCurrency(totalNetProfit)}</div>
        </div>
      </div>

      <h2 style="margin:0;">Daily stats</h2>
      <ul class="pl-list">
        {stats.value.length === 0 && <li class="pl-list-item">No stats yet.</li>}
        {stats.value.map((item) => (
          <li key={item.dayStart.toISOString()} class="pl-list-item">
            <strong>{formatDate(item.dayStart)}</strong>
            <div>Offers: {item.offerCount}</div>
            <div>Net: {formatCurrency(item.netProfitEuro)}</div>
          </li>
        ))}
      </ul>

      <h2 style="margin:0;">Offers</h2>
      <ul class="pl-list">
        {offers.value.length === 0 && <li class="pl-list-item">No offers saved yet.</li>}
        {offers.value.map((item) => (
          <li key={item.id} class="pl-list-item">
            <div>
              <strong>{formatCurrency(item.payoutEuro)}</strong> · {item.distanceKm.toFixed(1)} km
            </div>
            <div>{item.pickupName ?? 'Pickup'} → {item.dropoffName ?? 'Drop-off'}</div>
            <div>Created: {formatDate(item.createdAt)}</div>
            <div>Net: {formatCurrency(item.netProfitEuro ?? 0)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
});
