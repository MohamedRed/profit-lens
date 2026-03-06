import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from './client';
import { firebaseFunctionsRegion } from '../config/runtime-config';

const getFn = () => getFunctions(getFirebaseApp(), firebaseFunctionsRegion);

export const callAnalyzeOffer = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'analyzeOffer');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callVerifyOfferRoute = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'verifyOfferRoute');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callLookupVehicleByPlate = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'lookupVehicleByPlate');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callLookupVehicleModel = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'lookupVehicleModel');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callCreateCheckoutSession = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'createCheckoutSession');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callCreateCustomerPortalSession = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'createCustomerPortalSession');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callChangeSubscriptionPlan = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'changeSubscriptionPlan');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callSetSubscriptionCancellation = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'setSubscriptionCancellation');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callGetManagedSubscriptionState = async (payload: Record<string, unknown> = {}) => {
  const callable = httpsCallable(getFn(), 'getManagedSubscriptionState');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callCheckSubscriptionEligibility = async (payload: Record<string, unknown> = {}) => {
  const callable = httpsCallable(getFn(), 'checkSubscriptionEligibility');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callRegisterDevice = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'registerDevice');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callRevokeDevice = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'revokeDevice');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callTranscribeHelpDraftAudio = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'transcribeHelpDraftAudio');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callParseBulkOffersScreenshot = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'parseBulkOffersScreenshot');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};

export const callCommitBulkOffersImport = async (payload: Record<string, unknown>) => {
  const callable = httpsCallable(getFn(), 'commitBulkOffersImport');
  const result = await callable(payload);
  return result.data as Record<string, unknown>;
};
