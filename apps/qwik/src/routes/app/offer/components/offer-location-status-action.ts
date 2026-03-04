import { t, type I18nStore } from '../../../../lib/i18n/i18n-context';

type OfferLocationStatusActionKind = 'permission' | 'retry';

export interface OfferLocationStatusAction {
  actionLabel: string;
  kind: OfferLocationStatusActionKind;
}

const equalsStatusMessage = (status: string, message: string): boolean => {
  return status.trim().toLowerCase() === message.trim().toLowerCase();
};

export const resolveOfferLocationStatusAction = (
  i18n: I18nStore,
  status: string,
): OfferLocationStatusAction | null => {
  const normalizedStatus = status.trim();
  if (!normalizedStatus) {
    return null;
  }

  const permissionMessage = t(
    i18n,
    'offerLocationPermissionRequired',
    'Location permission is required to analyze an offer.',
  );
  if (equalsStatusMessage(normalizedStatus, permissionMessage)) {
    return {
      kind: 'permission',
      actionLabel: t(i18n, 'offerLocationEnableActionLabel', 'Enable location'),
    };
  }

  const unavailableMessage = t(
    i18n,
    'offerLocationUnavailable',
    'Unable to read your current location. Check GPS and try again.',
  );
  if (equalsStatusMessage(normalizedStatus, unavailableMessage)) {
    return {
      kind: 'retry',
      actionLabel: t(i18n, 'offerLocationTryAgainActionLabel', 'Try again'),
    };
  }

  const timeoutMessage = t(
    i18n,
    'offerLocationTimeout',
    'Location took too long to load. Try again in an open area.',
  );
  if (equalsStatusMessage(normalizedStatus, timeoutMessage)) {
    return {
      kind: 'retry',
      actionLabel: t(i18n, 'offerLocationTryAgainActionLabel', 'Try again'),
    };
  }

  const unsupportedMessage = t(
    i18n,
    'offerLocationUnsupported',
    'This device does not support location for offer analysis.',
  );
  if (equalsStatusMessage(normalizedStatus, unsupportedMessage)) {
    return null;
  }

  return null;
};
