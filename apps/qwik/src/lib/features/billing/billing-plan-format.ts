import { formatCurrencyAmount } from '../../i18n/number-format';
import type { BillingPlan } from '../../types/billing';

export const formatBillingPlanLabel = (locale: string, plan: BillingPlan): string => {
  return formatCurrencyAmount(locale, plan.monthlyPriceEuro);
};
