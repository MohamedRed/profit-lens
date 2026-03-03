import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import { firebaseWebConfig } from '../config/firebase-web-config';

interface WindowWithConfig extends Window {
  PROFIT_LENS_FIREBASE_CONFIG?: FirebaseOptions;
}

const readRuntimeConfig = (): FirebaseOptions => {
  if (typeof window === 'undefined') {
    return firebaseWebConfig;
  }

  const runtime = (window as WindowWithConfig).PROFIT_LENS_FIREBASE_CONFIG;
  if (runtime?.apiKey && runtime.projectId && runtime.appId) {
    return runtime;
  }

  return firebaseWebConfig;
};

export const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(readRuntimeConfig());
};
