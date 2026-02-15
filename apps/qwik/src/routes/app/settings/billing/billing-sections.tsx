import { component$, type QRL } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';

interface BillingStripePortalCardProps {
  buttonLabel: string;
  disabled: boolean;
  subtitle: string;
  title: string;
  onOpen$: QRL<() => void>;
}

export const BillingStripePortalCard = component$<BillingStripePortalCardProps>((props) => {
  return (
    <section class="ui-settings-card ui-settings-billing-card">
      <p class="ui-settings-title">{props.title}</p>
      <p class="ui-settings-subtitle">{props.subtitle}</p>
      <Button
        variant="secondary"
        class="ui-settings-billing-action"
        disabled={props.disabled}
        onClick$={props.onOpen$}
      >
        {props.buttonLabel}
      </Button>
    </section>
  );
});
