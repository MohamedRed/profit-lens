export type OfferAnalysisProgressStep =
  | 'extracting'
  | 'verifyingRoute'
  | 'calculatingProfit';

type OfferAnalysisProgressStatusPrefix = '__offer_analysis_progress__:';

const offerAnalysisProgressStatusPrefix: OfferAnalysisProgressStatusPrefix =
  '__offer_analysis_progress__:';

export const offerAnalysisProgressSteps = [
  'extracting',
  'verifyingRoute',
  'calculatingProfit',
] as const satisfies readonly OfferAnalysisProgressStep[];

export const offerAnalysisProgressStepDurationsMs = [
  900,
  800,
  500,
] as const;

export const offerAnalysisProgressMinDurationMs =
  offerAnalysisProgressStepDurationsMs.reduce(
    (total, duration) => total + duration,
    0,
  );

export const toOfferAnalysisProgressStatus = (
  step: OfferAnalysisProgressStep,
): string => `${offerAnalysisProgressStatusPrefix}${step}`;

export const parseOfferAnalysisProgressStep = (
  status: string,
): OfferAnalysisProgressStep | null => {
  const normalized = status.trim();
  if (!normalized.startsWith(offerAnalysisProgressStatusPrefix)) {
    return null;
  }
  const rawStep = normalized.slice(offerAnalysisProgressStatusPrefix.length);
  if (offerAnalysisProgressSteps.includes(rawStep as OfferAnalysisProgressStep)) {
    return rawStep as OfferAnalysisProgressStep;
  }
  return null;
};

export type OfferAnalysisProgressStepState = 'pending' | 'active' | 'done';

export const resolveOfferAnalysisProgressStepState = (
  activeStep: OfferAnalysisProgressStep,
  step: OfferAnalysisProgressStep,
): OfferAnalysisProgressStepState => {
  const activeStepIndex = offerAnalysisProgressSteps.indexOf(activeStep);
  const stepIndex = offerAnalysisProgressSteps.indexOf(step);
  if (stepIndex < activeStepIndex) {
    return 'done';
  }
  if (stepIndex === activeStepIndex) {
    return 'active';
  }
  return 'pending';
};

export interface OfferAnalysisProgressDriver {
  cancel: () => void;
  waitForMinimumDuration: () => Promise<void>;
}

interface StartOfferAnalysisProgressDriverParams {
  isActive: () => boolean;
  onStepChange: (step: OfferAnalysisProgressStep) => void;
}

export const startOfferAnalysisProgressDriver = ({
  isActive,
  onStepChange,
}: StartOfferAnalysisProgressDriverParams): OfferAnalysisProgressDriver => {
  const startedAt = Date.now();
  const timeoutIds: Array<ReturnType<typeof setTimeout>> = [];

  const scheduleTimeout = (
    callback: () => void,
    delayMs: number,
  ): void => {
    const timeoutId = setTimeout(callback, delayMs);
    timeoutIds.push(timeoutId);
  };

  let accumulatedDelayMs = 0;
  for (let index = 1; index < offerAnalysisProgressSteps.length; index += 1) {
    accumulatedDelayMs += offerAnalysisProgressStepDurationsMs[index - 1];
    const step = offerAnalysisProgressSteps[index];
    scheduleTimeout(() => {
      if (!isActive()) {
        return;
      }
      onStepChange(step);
    }, accumulatedDelayMs);
  }

  return {
    cancel: () => {
      timeoutIds.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutIds.length = 0;
    },
    waitForMinimumDuration: async () => {
      if (!isActive()) {
        return;
      }
      const elapsedMs = Date.now() - startedAt;
      const remainingMs = offerAnalysisProgressMinDurationMs - elapsedMs;
      if (remainingMs <= 0) {
        return;
      }
      await new Promise<void>((resolve) => {
        scheduleTimeout(resolve, remainingMs);
      });
    },
  };
};
