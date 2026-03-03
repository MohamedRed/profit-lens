import { component$, useSignal, type JSXOutput } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { parseOfferAnalysisProgressStep } from '../offer-analysis-progress';
import { OfferAnalysisProgressStepper } from './offer-analysis-progress-stepper';
import { OfferErrorNotice } from './offer-error-notice';
import { OfferPresenceTransition } from './offer-presence-transition';

interface OfferFlowStatusProps {
  status: string;
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

export const OfferFlowStatus = component$<OfferFlowStatusProps>(({ status }) => {
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
    if (isSelectVehicleHint) {
      statusNode = (
        <p class={{ 'ui-status': true, 'ui-status-error': true }}>
          {currentStatus}
        </p>
      );
    } else {
      const screenshotFailureMessage = t(
        i18n,
        'analysisFailedScreenshotBody',
        "We couldn't read this screenshot. Please upload a valid offer screenshot.",
      );
      const isScreenshotFailure = isScreenshotFailureStatus(currentStatus, screenshotFailureMessage);
      const statusTitle = isScreenshotFailure ? t(i18n, 'analysisFailedTitle', 'Analysis incomplete') : undefined;
      statusNode = <OfferErrorNotice title={statusTitle} message={currentStatus} />;
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
