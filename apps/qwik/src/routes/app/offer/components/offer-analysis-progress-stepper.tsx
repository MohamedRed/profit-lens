import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import {
  offerAnalysisProgressSteps,
  resolveOfferAnalysisProgressStepState,
  type OfferAnalysisProgressStep,
} from '../offer-analysis-progress';

interface OfferAnalysisProgressStepperProps {
  activeStep: OfferAnalysisProgressStep;
}

const stepTranslation = (
  step: OfferAnalysisProgressStep,
): { key: string; fallback: string } => {
  if (step === 'extracting') {
    return {
      key: 'analysisStepExtracting',
      fallback: 'Extracting offer details',
    };
  }
  if (step === 'verifyingRoute') {
    return {
      key: 'analysisStepVerifyRoute',
      fallback: 'Verifying route',
    };
  }
  return {
    key: 'analysisStepProfitability',
    fallback: 'Calculating profitability',
  };
};

export const OfferAnalysisProgressStepper =
  component$<OfferAnalysisProgressStepperProps>(({ activeStep }) => {
    const i18n = useI18n();

    return (
      <section
        class="ui-offer-analysis-progress"
        aria-live="polite"
        aria-atomic="true"
      >
        <p class="ui-offer-analysis-progress-title">
          {t(i18n, 'analysisProgressTitle', 'Analyzing offer')}
        </p>
        <ol class="ui-offer-analysis-progress-list">
          {offerAnalysisProgressSteps.map((step) => {
            const state = resolveOfferAnalysisProgressStepState(
              activeStep,
              step,
            );
            const copy = stepTranslation(step);
            const label = t(i18n, copy.key, copy.fallback);

            return (
              <li key={step} class={['ui-offer-analysis-progress-step', `is-${state}`]}>
                <span class="ui-offer-analysis-progress-indicator" aria-hidden="true">
                  {state === 'done' ? (
                    <span class="material-icons-outlined">check_circle</span>
                  ) : null}
                  {state === 'active' ? (
                    <span class="ui-offer-analysis-progress-spinner" />
                  ) : null}
                  {state === 'pending' ? (
                    <span class="material-icons-outlined">radio_button_unchecked</span>
                  ) : null}
                </span>
                <span class="ui-offer-analysis-progress-label">{label}</span>
              </li>
            );
          })}
        </ol>
      </section>
    );
  });
