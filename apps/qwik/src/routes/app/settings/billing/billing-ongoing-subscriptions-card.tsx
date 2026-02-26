import { component$, type QRL } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { ManagedSubscriptionSnapshot } from '../../../../lib/types/billing';
import { formatDate, resolvePlanLabelFromSubscription } from './billing-manager-helpers';
import { isSubscriptionCanceling, resolveSubscriptionStatusToneClass } from './billing-view-utils';

interface BillingOngoingSubscriptionsCardProps {
  disabled: boolean;
  onManageInStripe$: QRL<() => void>;
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
    <section class="ui-settings-card ui-settings-billing-card ui-settings-billing-ongoing-card">
      <p class="ui-settings-title">
        {t(i18n, 'billingOngoingSubscriptionsTitle', 'Ongoing subscriptions')}
      </p>
      <p class="ui-settings-subtitle">
        {formatTemplate(
          t(i18n, 'billingOngoingSubscriptionsCount', '{count} subscriptions are currently managed.'),
          {
            count: String(props.subscriptions.length),
          },
        )}
      </p>
      <ul class="ui-settings-billing-subscriptions-list">
        {props.subscriptions.map((subscription) => {
          const canceling = isSubscriptionCanceling(
            subscription.status,
            subscription.cancelAtPeriodEnd,
          );
          const statusToneClass = resolveSubscriptionStatusToneClass(
            canceling ? 'canceling' : subscription.status,
          );
          const statusDisplay = canceling
            ? t(i18n, 'billingSubscriptionCancelingStatus', 'Canceling')
            : subscription.status;
          const periodLabel = canceling
            ? t(i18n, 'subscriptionStatusCanceling', 'Cancels on {date}')
            : t(i18n, 'billingPeriodEndsOn', 'Period ends on {date}');
          return (
            <li key={subscription.subscriptionId} class="ui-settings-billing-subscription-item">
              <p class="ui-settings-billing-subscription-row">
                <strong class="ui-settings-billing-emphasis-value">
                  {resolvePlanLabelFromSubscription(subscription)}
                </strong>
                <span class={`ui-settings-billing-status-value ${statusToneClass}`}>{statusDisplay}</span>
              </p>
              <p class="ui-settings-subtitle">
                {formatTemplate(periodLabel, {
                  date: formatDate(locale, new Date(subscription.currentPeriodEndSec * 1000)),
                })}
              </p>
              {subscription.subscriptionId === props.primarySubscriptionId ? (
                <p class="ui-settings-billing-primary-subscription">
                  {t(i18n, 'billingPrimarySubscriptionLabel', 'Primary')}
                </p>
              ) : (
                <div class="ui-settings-billing-subscription-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    class="ui-settings-billing-subscription-action"
                    disabled={props.disabled}
                    onClick$={props.onManageInStripe$}
                  >
                    {t(i18n, 'billingManageInStripeButton', 'Manage in Stripe')}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
});
