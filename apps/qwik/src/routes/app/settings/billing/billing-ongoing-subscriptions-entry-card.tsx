import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';

interface BillingOngoingSubscriptionsEntryCardProps {
  href: string;
  managedSubscriptionCount: number;
}

export const BillingOngoingSubscriptionsEntryCard = component$<
  BillingOngoingSubscriptionsEntryCardProps
>((props) => {
  const i18n = useI18n();

  if (props.managedSubscriptionCount <= 1) {
    return null;
  }

  return (
    <section class="ui-settings-card ui-settings-billing-card">
      <p class="ui-settings-title">
        {t(i18n, 'billingOngoingSubscriptionsTitle', 'Ongoing subscriptions')}
      </p>
      <p class="ui-settings-subtitle">
        {formatTemplate(
          t(
            i18n,
            'billingOngoingSubscriptionsPreviewSubtitle',
            '{count} subscriptions are currently active. Open details to manage each subscription.',
          ),
          {
            count: String(props.managedSubscriptionCount),
          },
        )}
      </p>
      <Link
        class="ui-button ui-button-secondary ui-button-md ui-settings-billing-action"
        href={props.href}
      >
        {t(i18n, 'billingOngoingSubscriptionsViewButton', 'View ongoing subscriptions')}
      </Link>
    </section>
  );
});
