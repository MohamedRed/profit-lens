import { component$, type QRL } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';

interface SuggestedPlan {
  value: string;
  label: string;
}

interface BillingSuggestionsCardProps {
  disabled: boolean;
  emptyLabel: string;
  plans: SuggestedPlan[];
  title: string;
  onSelect$: QRL<(priceId: string) => void>;
}

export const BillingSuggestionsCard = component$<BillingSuggestionsCardProps>((props) => {
  return (
    <section class="ui-settings-card ui-settings-billing-card">
      <p class="ui-settings-title">{props.title}</p>
      {props.plans.length > 0 ? (
        <div class="ui-settings-billing-suggestions">
          {props.plans.map((plan) => (
            <button
              key={plan.value}
              type="button"
              class="ui-settings-billing-suggestion"
              disabled={props.disabled}
              onClick$={() => props.onSelect$(plan.value)}
            >
              {plan.label}
            </button>
          ))}
        </div>
      ) : (
        <p class="ui-settings-subtitle">{props.emptyLabel}</p>
      )}
    </section>
  );
});

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
