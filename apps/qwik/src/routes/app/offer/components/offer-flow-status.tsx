import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { OfferErrorNotice } from './offer-error-notice';

interface OfferFlowStatusProps {
  status: string;
}

const isSuccessStatus = (value: string): boolean => {
  const lower = value.toLowerCase();
  return lower.includes('import') || lower.includes('analy');
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
  if (!currentStatus || isSuccessStatus(currentStatus)) {
    return null;
  }

  const selectVehicleMessage = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
  const isSelectVehicleHint = currentStatus.toLowerCase() === selectVehicleMessage.toLowerCase();
  if (isSelectVehicleHint) {
    return (
      <p class={{ 'ui-status': true, 'ui-status-error': true }}>
        {currentStatus}
      </p>
    );
  }

  const screenshotFailureMessage = t(
    i18n,
    'analysisFailedScreenshotBody',
    "We couldn't read this screenshot. Please upload a valid offer screenshot.",
  );
  const statusTitle = isScreenshotFailureStatus(currentStatus, screenshotFailureMessage)
    ? t(i18n, 'analysisFailedTitle', 'Analysis incomplete')
    : t(i18n, 'offerErrorTitle', 'Action required');
  return <OfferErrorNotice title={statusTitle} message={currentStatus} />;
});
