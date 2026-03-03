import { billingPlans } from '../../../../lib/config/runtime-config';
import { formatBillingPlanLabel } from '../../../../lib/features/billing/billing-plan-format';
import {
  resolveDefaultPlanPriceId,
  resolveSelectedPriceId,
} from '../../../../lib/features/billing/plan-resolution';
import type { ManagedSubscriptionSnapshot } from '../../../../lib/types/billing';
import { resolveFormattingLocale } from '../../../../lib/i18n/number-format';

export const formatDate = (locale: string, date: Date): string => {
  return new Intl.DateTimeFormat(resolveFormattingLocale(locale), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export { resolveDefaultPlanPriceId, resolveSelectedPriceId };

export const resolvePlanLabelFromSubscription = (
  subscription: ManagedSubscriptionSnapshot,
  locale: string,
): string => {
  const byPriceId = billingPlans.find((plan) => plan.priceId === subscription.currentPriceId);
  if (byPriceId) {
    return formatBillingPlanLabel(locale, byPriceId);
  }
  const byPlanId = billingPlans.find((plan) => plan.id === subscription.currentPlanId);
  if (byPlanId) {
    return formatBillingPlanLabel(locale, byPlanId);
  }
  const normalizedPlanId = subscription.currentPlanId.replace(/_/g, ' ').trim();
  return normalizedPlanId.length > 0 ? normalizedPlanId : subscription.currentPriceId;
};
