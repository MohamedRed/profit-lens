import { component$ } from '@builder.io/qwik';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { ManagedSubscriptionSnapshot } from '../../../../lib/types/billing';
import { formatDate, resolvePlanLabelFromSubscription } from './billing-manager-helpers';
import { resolveSubscriptionStatusToneClass } from './billing-view-utils';

interface BillingOngoingSubscriptionsCardProps {
  primarySubscriptionId: string | null;
  subscriptions: ManagedSubscriptionSnapshot[];
}

export const BillingOngoingSubscriptionsCard = component$<BillingOngoingSubscriptionsCardProps>((props) => {
  const i18n = useI18n();
  const locale = i18n.locale.value;
  if (props.subscriptions.length <= 1) {
    return null;
  }

  return (
    <section class="ui-settings-card ui-settings-billing-card">
      <p class="ui-settings-title">
        {t(i18n, 'billingOngoingSubscriptionsTitle', 'Ongoing subscriptions')}
      </p>
      <p class="ui-settings-subtitle">
        {formatTemplate(
          t(i18n, 'billingOngoingSubscriptionsCount', '{count} subscriptions are currently active.'),
          {
            count: String(props.subscriptions.length),
          },
        )}
      </p>
      <ul class="ui-settings-billing-subscriptions-list">
        {props.subscriptions.map((subscription) => (
          <li key={subscription.subscriptionId} class="ui-settings-billing-subscription-item">
            <p class="ui-settings-billing-subscription-row">
              <strong class="ui-settings-billing-emphasis-value">
                {resolvePlanLabelFromSubscription(subscription)}
              </strong>
              <span
                class={`ui-settings-billing-status-value ${resolveSubscriptionStatusToneClass(subscription.status)}`}
              >
                {subscription.status}
              </span>
            </p>
            <p class="ui-settings-subtitle">
              {formatTemplate(t(i18n, 'billingPeriodEndsOn', 'Period ends on {date}'), {
                date: formatDate(locale, new Date(subscription.currentPeriodEndSec * 1000)),
              })}
            </p>
            {subscription.subscriptionId === props.primarySubscriptionId ? (
              <p class="ui-settings-billing-primary-subscription">
                {t(i18n, 'billingPrimarySubscriptionLabel', 'Primary')}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
});
