import type { Signal } from '@builder.io/qwik';
import { resolveUserFacingErrorMessage } from '../../../lib/errors/user-facing-error';
import type { I18nStore } from '../../../lib/i18n/i18n-context';
import {
  startOfferAnalysisProgressDriver,
  toOfferAnalysisProgressStatus,
} from './offer-analysis-progress';
import {
  isOfferLocationError,
  resolveOfferLocationErrorMessage,
} from './offer-current-location';
import type { OfferAnalysisRecord } from './offer-analysis-result';

interface OfferAnalysisRuntimeSignals {
  analysisRunId: Signal<number>;
  loading: Signal<boolean>;
  status: Signal<string>;
  onStatusUpdated?: () => void;
}

interface SetOfferAnalysisErrorStatusParams {
  analysisRecord: Signal<OfferAnalysisRecord | null>;
  error: unknown;
  i18n: I18nStore;
  status: Signal<string>;
}

export const setOfferAnalysisErrorStatus = ({
  analysisRecord,
  error,
  i18n,
  status,
}: SetOfferAnalysisErrorStatusParams): void => {
  analysisRecord.value = null;
  if (isOfferLocationError(error)) {
    status.value = resolveOfferLocationErrorMessage(i18n, error.code);
    return;
  }
  status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
};

export const startOfferAnalysisProgress = ({
  analysisRunId,
  loading,
  status,
  onStatusUpdated,
}: OfferAnalysisRuntimeSignals) => {
  analysisRunId.value += 1;
  const runId = analysisRunId.value;
  status.value = toOfferAnalysisProgressStatus('extracting');
  onStatusUpdated?.();

  const progressDriver = startOfferAnalysisProgressDriver({
    isActive: () => analysisRunId.value === runId && loading.value,
    onStepChange: (step) => {
      if (analysisRunId.value !== runId) {
        return;
      }
      status.value = toOfferAnalysisProgressStatus(step);
      onStatusUpdated?.();
    },
  });

  return { progressDriver, runId };
};
