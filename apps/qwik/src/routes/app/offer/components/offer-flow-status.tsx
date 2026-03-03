import { component$, useSignal, type JSXOutput, type QRL } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { parseOfferAnalysisProgressStep } from '../offer-analysis-progress';
import { OfferAnalysisProgressStepper } from './offer-analysis-progress-stepper';
import { OfferErrorNotice } from './offer-error-notice';
import { OfferPresenceTransition } from './offer-presence-transition';

interface OfferFlowStatusProps {
  status: string;
  onDismiss$: QRL<() => void>;
  onEnableLocation$?: QRL<() => void | Promise<void>>;
}

const isSuccessStatus = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === 'offer analyzed.' ||
    normalized === 'offer analyzed' ||
    normalized === 'screenshot analyzed.' ||
    normalized === 'screenshot analyzed'
  );
};

const isScreenshotFailureStatus = (status: string, screenshotFailureMessage: string): boolean => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === screenshotFailureMessage.toLowerCase()) {
    return true;
  }
  return (
    lowerStatus.includes('screenshot') ||
    lowerStatus.includes('gemini') ||
    lowerStatus.includes('json payload') ||
    lowerStatus.includes('extract offer')
  );
};

export const OfferFlowStatus = component$<OfferFlowStatusProps>(({
  status,
  onDismiss$,
  onEnableLocation$,
}) => {
  const i18n = useI18n();
  const currentStatus = status.trim();
  const activeAnalysisStep = parseOfferAnalysisProgressStep(currentStatus);
  const displayedAnalysisStep = useSignal(activeAnalysisStep);
  if (activeAnalysisStep) {
    displayedAnalysisStep.value = activeAnalysisStep;
  }
  const displayedStep = displayedAnalysisStep.value;
  const shouldShowStepper = displayedStep !== null;
  const shouldShowStatusMessage =
    activeAnalysisStep === null && currentStatus.length > 0 && !isSuccessStatus(currentStatus);

  let statusNode: JSXOutput | null = null;
  if (shouldShowStatusMessage) {
    const selectVehicleMessage = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
    const isSelectVehicleHint = currentStatus.toLowerCase() === selectVehicleMessage.toLowerCase();
    const locationRetryMessages = [
      t(
        i18n,
        'offerLocationPermissionRequired',
        'Location permission is required to analyze an offer.',
      ),
      t(
        i18n,
        'offerLocationUnavailable',
        'Unable to read your current location. Check GPS and try again.',
      ),
      t(
        i18n,
        'offerLocationTimeout',
        'Location took too long to load. Try again in an open area.',
      ),
    ];
    const isLocationRetryHint = locationRetryMessages.some(
      (message) => message.toLowerCase() === currentStatus.toLowerCase(),
    );
    if (isSelectVehicleHint) {
      statusNode = (
        <div class="ui-offer-inline-status">
          <p class={{ 'ui-status': true, 'ui-status-error': true }}>
            {currentStatus}
          </p>
          <button
            type="button"
            class="ui-offer-screenshot-remove"
            aria-label={t(i18n, 'closeLabel', 'Close')}
            onClick$={onDismiss$}
          >
            <span class="material-icons-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      );
    } else {
      const screenshotFailureMessage = t(
        i18n,
        'analysisFailedScreenshotBody',
        "We couldn't read this screenshot. Please upload a valid offer screenshot.",
      );
      const isScreenshotFailure = isScreenshotFailureStatus(currentStatus, screenshotFailureMessage);
      const statusTitle = isScreenshotFailure ? t(i18n, 'analysisFailedTitle', 'Analysis incomplete') : undefined;
      statusNode = (
        <OfferErrorNotice
          title={statusTitle}
          message={currentStatus}
          onDismiss$={onDismiss$}
          actionLabel={isLocationRetryHint ? t(i18n, 'retryButtonLabel', 'Retry') : undefined}
          onAction$={isLocationRetryHint ? onEnableLocation$ : undefined}
        />
      );
    }
  }

  if (!shouldShowStepper && statusNode === null) {
    return null;
  }

  return (
    <>
      {shouldShowStepper ? (
        <OfferPresenceTransition
          class="ui-offer-stepper-transition"
          show={activeAnalysisStep !== null}
        >
          <OfferAnalysisProgressStepper activeStep={displayedStep} />
        </OfferPresenceTransition>
      ) : null}
      {statusNode}
    </>
  );
});
