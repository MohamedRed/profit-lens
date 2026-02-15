export interface BillingPlanSelectOption {
  value: string;
  label: string;
  offerLimit: number | null;
}

const toComparableOfferLimit = (offerLimit: number | null): number => {
  return offerLimit == null ? Number.POSITIVE_INFINITY : offerLimit;
};

const sortByOfferLimitAsc = (
  left: BillingPlanSelectOption,
  right: BillingPlanSelectOption,
): number => {
  return toComparableOfferLimit(left.offerLimit) - toComparableOfferLimit(right.offerLimit);
};

const pickNearestHigherPlan = (
  plans: BillingPlanSelectOption[],
  offerLimit: number | null,
): BillingPlanSelectOption | null => {
  if (offerLimit == null) {
    return null;
  }
  return plans.find((plan) => {
    if (plan.offerLimit == null) {
      return true;
    }
    return plan.offerLimit > offerLimit;
  }) ?? null;
};

const pickNearestLowerPlan = (
  plans: BillingPlanSelectOption[],
  offerLimit: number | null,
): BillingPlanSelectOption | null => {
  if (offerLimit == null) {
    return null;
  }
  const reversed = [...plans].reverse();
  return reversed.find((plan) => plan.offerLimit != null && plan.offerLimit < offerLimit) ?? null;
};

export const buildSuggestedPlans = (
  allPlanOptions: BillingPlanSelectOption[],
  currentPriceId: string,
  usedOffers: number,
  isFreePlan: boolean,
): BillingPlanSelectOption[] => {
  const sortedPlans = [...allPlanOptions].sort(sortByOfferLimitAsc);
  if (sortedPlans.length <= 1) {
    return [];
  }

  const currentPlan = sortedPlans.find((plan) => plan.value === currentPriceId) ?? null;
  const currentIndex = currentPlan == null ? -1 : sortedPlans.findIndex((plan) => plan.value === currentPriceId);
  const suggestions: BillingPlanSelectOption[] = [];

  const addSuggestion = (candidate: BillingPlanSelectOption | null) => {
    if (!candidate) {
      return;
    }
    if (candidate.value === currentPlan?.value) {
      return;
    }
    if (suggestions.some((plan) => plan.value === candidate.value)) {
      return;
    }
    suggestions.push(candidate);
  };

  if (isFreePlan || currentPlan == null) {
    addSuggestion(sortedPlans[0] ?? null);
    addSuggestion(sortedPlans[1] ?? null);
    return suggestions.slice(0, 2);
  }

  if (currentPlan.offerLimit != null && currentPlan.offerLimit > 0) {
    const usageRatio = usedOffers / currentPlan.offerLimit;
    if (usageRatio >= 0.8) {
      addSuggestion(pickNearestHigherPlan(sortedPlans, currentPlan.offerLimit));
    } else if (usageRatio <= 0.35 && usedOffers > 0) {
      addSuggestion(pickNearestLowerPlan(sortedPlans, currentPlan.offerLimit));
    }
  }

  if (currentIndex >= 0 && suggestions.length < 2) {
    addSuggestion(sortedPlans[currentIndex + 1] ?? null);
    addSuggestion(sortedPlans[currentIndex - 1] ?? null);
  }

  if (suggestions.length === 0) {
    addSuggestion(sortedPlans.find((plan) => plan.value !== currentPlan.value) ?? null);
  }

  return suggestions.slice(0, 2);
};
