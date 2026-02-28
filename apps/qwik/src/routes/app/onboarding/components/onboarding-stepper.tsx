import { component$ } from '@builder.io/qwik';

interface OnboardingStepperProps {
  currentStep: number;
  stepCountLabel: string;
  steps: string[];
}

const clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const OnboardingStepper = component$<OnboardingStepperProps>(({ currentStep, stepCountLabel, steps }) => {
  const safeIndex = clamp(currentStep, 0, Math.max(steps.length - 1, 0));
  const progress = steps.length > 0 ? ((safeIndex + 1) / steps.length) * 100 : 0;

  return (
    <div class="ui-onboarding-stepper">
      <div class="ui-onboarding-stepper-header">
        <p class="ui-onboarding-step-count">{stepCountLabel}</p>
        <div class="ui-onboarding-progress">
          <span class="ui-onboarding-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <ol class="ui-onboarding-step-list">
        {steps.map((label, index) => (
          <li
            key={`${label}-${index}`}
            class={{
              'ui-onboarding-step': true,
              'is-active': index === safeIndex,
              'is-complete': index < safeIndex,
            }}
            aria-current={index === safeIndex ? 'step' : undefined}
          >
            <span class="ui-onboarding-step-index">{index + 1}</span>
            <span class="ui-onboarding-step-label">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
});
