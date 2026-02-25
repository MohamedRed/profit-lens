import { component$ } from '@builder.io/qwik';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { Entitlement, OfferUsage } from '../../../../lib/types/billing';
import { formatDate } from './billing-manager-helpers';
import {
  emphasizeFirstValue,
  isSubscriptionCanceling,
  resolveSubscriptionStatusToneClass,
} from './billing-view-utils';

interface BillingSummaryCardProps {
  entitlement: Entitlement | null;
  usage: OfferUsage | null;
}

export const BillingSummaryCard = component$<BillingSummaryCardProps>((props) => {
  const i18n = useI18n();
  const locale = i18n.locale.value;
  const offerLimit = props.entitlement?.offerLimit ?? null;
  const usedOffers = props.usage?.offerCount ?? 0;
  const remainingOffers = offerLimit == null ? null : Math.max(0, offerLimit - usedOffers);
  const remainingOffersValue = remainingOffers == null ? '' : String(remainingOffers);
  const periodEndValue = props.entitlement ? formatDate(locale, props.entitlement.periodEnd) : '';
  const remainingOffersLabel =
    props.entitlement && remainingOffers != null
      ? formatTemplate(t(i18n, 'offersRemainingValue', '{remaining} offers remaining this month'), {
          remaining: remainingOffersValue,
          count: remainingOffersValue,
        })
      : '';
  const periodEndsOnLabel = props.entitlement
    ? formatTemplate(t(i18n, 'billingPeriodEndsOn', 'Period ends on {date}'), {
        date: periodEndValue,
      })
    : '';
  const canceling = props.entitlement
    ? isSubscriptionCanceling(props.entitlement.status, props.entitlement.cancelAtPeriodEnd)
    : false;
  const statusDisplay = canceling
    ? t(i18n, 'billingSubscriptionCancelingStatus', 'Canceling')
    : props.entitlement?.status ?? '';
  const statusToneClass = resolveSubscriptionStatusToneClass(
    canceling ? 'canceling' : props.entitlement?.status,
  );

  return (
    <section class="ui-settings-card ui-settings-billing-card">
      <h2 class="ui-settings-billing-title">{t(i18n, 'billingManageTitle', 'Manage subscription')}</h2>
      {props.entitlement ? (
        <p class="ui-settings-subtitle">
          {t(i18n, 'subscriptionStatusLabel', 'Subscription status')}:{' '}
          <strong class={`ui-settings-billing-status-value ${statusToneClass}`}>{statusDisplay}</strong>
        </p>
      ) : null}
      {remainingOffersLabel ? (
        <p class="ui-settings-subtitle">
          {emphasizeFirstValue(remainingOffersLabel, remainingOffersValue)}
        </p>
      ) : null}
      {periodEndsOnLabel ? (
        <p class="ui-settings-subtitle">
          {emphasizeFirstValue(periodEndsOnLabel, periodEndValue)}
        </p>
      ) : null}
      {props.entitlement?.cancelAtPeriodEnd ? (
        <p class="ui-settings-billing-alert">
          {formatTemplate(t(i18n, 'subscriptionStatusCanceling', 'Cancels on {date}'), {
            date: formatDate(locale, props.entitlement.periodEnd),
          })}
        </p>
      ) : null}
    </section>
  );
});
