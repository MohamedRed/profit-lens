import { component$, type QRL } from '@builder.io/qwik';

interface OnboardingPagerProps {
  currentStep: number;
  stepCountLabel: string;
  steps: string[];
  onSelectStep$: QRL<(stepIndex: number) => void>;
}

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const OnboardingPager = component$<OnboardingPagerProps>(
  ({ currentStep, stepCountLabel, steps, onSelectStep$ }) => {
    const safeIndex = clamp(currentStep, 0, Math.max(steps.length - 1, 0));
    const progress = steps.length > 0 ? ((safeIndex + 1) / steps.length) * 100 : 0;

    return (
      <div class="ui-onboarding-pager">
        <div class="ui-onboarding-pager-header">
          <p class="ui-onboarding-step-count">{stepCountLabel}</p>
          <p class="ui-onboarding-step-label-current">{steps[safeIndex]}</p>
        </div>
        <div class="ui-onboarding-progress" aria-hidden="true">
          <span class="ui-onboarding-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <ol class="ui-onboarding-dots" role="tablist" aria-label={stepCountLabel}>
          {steps.map((label, index) => {
            const isActive = index === safeIndex;
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
      </div>
    );
  },
);
