import { component$, type QRL } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';

interface BillingCancellationCardProps {
  cancelAtPeriodEnd: boolean;
  disabled: boolean;
  onToggle$: QRL<() => void>;
}

export const BillingCancellationCard = component$<BillingCancellationCardProps>((props) => {
  const i18n = useI18n();
  return (
    <section class="ui-settings-card ui-settings-billing-card">
      <p class="ui-settings-title">{t(i18n, 'billingCancellationTitle', 'Cancellation')}</p>
      <p class="ui-settings-subtitle">
        {t(
          i18n,
          'billingCancellationSubtitle',
          'Choose whether to keep renewing or stop at the end of this billing period.',
        )}
      </p>
      <Button
        variant={props.cancelAtPeriodEnd ? 'secondary' : 'destructive'}
        class="ui-settings-billing-action"
        disabled={props.disabled}
        onClick$={props.onToggle$}
      >
        {props.cancelAtPeriodEnd
          ? t(i18n, 'billingResumeSubscriptionButton', 'Resume subscription')
          : t(i18n, 'billingCancelAtPeriodEndButton', 'Cancel at period end')}
      </Button>
    </section>
  );
});
