import { component$, type QRL } from '@builder.io/qwik';

interface OnboardingPagerProps {
  currentStep: number;
  steps: string[];
  onSelectStep$: QRL<(stepIndex: number) => void>;
}

export const OnboardingPager = component$<OnboardingPagerProps>(
  ({ currentStep, steps, onSelectStep$ }) => {
    return (
      <ol class="ui-onboarding-dots" role="tablist" aria-label="Onboarding steps">
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          return (
            <li key={`${label}-${index}`} class="ui-onboarding-dot-item">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={label}
                class={{
                  'ui-onboarding-dot': true,
                  'is-active': isActive,
                }}
                onClick$={() => onSelectStep$(index)}
              />
            </li>
          );
        })}
      </ol>
    );
  },
);
