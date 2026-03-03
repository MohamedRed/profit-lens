import type { Signal } from '@builder.io/qwik';
import { resolveUserFacingErrorMessage } from '../../../lib/errors/user-facing-error';
import { saveUserProfile } from '../../../lib/features/profile/profile-service';
import {
  revokeOfferScreenshotModalUrl,
} from '../../../lib/features/offers/offer-screenshot-modal-url';
import { t, type I18nStore } from '../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../lib/types/profile';
import {
  isOfferLocationError,
  readRequiredCurrentLocation,
  resolveOfferLocationErrorMessage,
} from './offer-current-location';
import { primeOfferDetailsNavigation } from './offer-analysis-navigation';
import type { OfferAnalysisRecord } from './offer-analysis-result';

interface OfferStatusContext {
  i18n: I18nStore;
  status: Signal<string>;
}

interface PersistedStatusContext {
  status: Signal<string>;
  persistState: () => void;
}

interface SaveProfitabilityTargetContext extends OfferStatusContext {
  profile: Signal<UserProfile | null>;
  minProfitabilityEuro: Signal<number>;
  savingProfitTarget: Signal<boolean>;
}

interface OfferScreenshotPreviewContext {
  loading: Signal<boolean>;
  screenshotModalUrl: Signal<string | null>;
  screenshotPreviewUrl: Signal<string | null>;
}

interface ViewDetailsContext extends OfferStatusContext {
  analysisRecord: Signal<OfferAnalysisRecord | null>;
}

export const saveProfitabilityTargetAction = async (
  context: SaveProfitabilityTargetContext,
  rawValue: string,
): Promise<void> => {
  const userProfile = context.profile.value;
  const normalizedValue = rawValue.trim().replace(',', '.');
  const parsed = Number(normalizedValue);
  if (!userProfile || !Number.isFinite(parsed) || parsed <= 0) {
    return;
  }
  if (parsed === userProfile.minProfitabilityEuro) {
    return;
  }
  const nextProfile = { ...userProfile, minProfitabilityEuro: parsed };
  context.minProfitabilityEuro.value = parsed;
  context.profile.value = nextProfile;
  context.savingProfitTarget.value = true;
  try {
    await saveUserProfile(nextProfile);
  } catch (error) {
    context.status.value = resolveUserFacingErrorMessage(context.i18n, error, 'profile');
  } finally {
    context.savingProfitTarget.value = false;
  }
};

export const clearScreenshotPreviewAction = (
  context: OfferScreenshotPreviewContext,
): void => {
  if (context.loading.value) {
    return;
  }
  revokeOfferScreenshotModalUrl(context.screenshotModalUrl.value);
  context.screenshotModalUrl.value = null;
  context.screenshotPreviewUrl.value = null;
};

export const enableLocationAction = async (
  context: PersistedStatusContext & { i18n: I18nStore },
  loading: Signal<boolean>,
): Promise<void> => {
  if (loading.value) {
    return;
  }
  context.status.value = t(context.i18n, 'offerLocationRequesting', 'Requesting location permission...');
  context.persistState();
  try {
    await readRequiredCurrentLocation({
      preferCachedWithinMs: -1,
    });
    context.status.value = '';
  } catch (error) {
    if (isOfferLocationError(error)) {
      context.status.value = resolveOfferLocationErrorMessage(context.i18n, error.code);
    } else {
      context.status.value = resolveUserFacingErrorMessage(context.i18n, error, 'offer');
    }
  } finally {
    context.persistState();
  }
};

export const dismissStatusAction = (context: PersistedStatusContext): void => {
  context.status.value = '';
  context.persistState();
};

export const viewDetailsAction = (context: ViewDetailsContext): void => {
  const record = context.analysisRecord.value;
  if (!record?.id) {
    context.analysisRecord.value = null;
    context.status.value = t(
      context.i18n,
      'offerDetailsUnavailableMessage',
      'Unable to open details for this analysis. Please run the analysis again.',
    );
    return;
  }
  const scrollY = typeof window !== 'undefined' ? window.scrollY : null;
  primeOfferDetailsNavigation(record, scrollY);
};
