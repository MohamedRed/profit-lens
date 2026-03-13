import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  initializeAuth,
  indexedDBLocalPersistence,
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirebaseApp } from './client';
import type { AuthUser } from '../types/auth';

let authClient: Auth | null = null;
const androidTokenHashKey = 'pl_firebase_token';

interface AndroidBridgeWindow extends Window {
  ProfitLensAndroidBridge?: {
    onAuthStateChanged?: (state: 'signed_in' | 'signed_out') => void;
  };
}

const getAuthClient = (): Auth => {
  if (authClient) {
    return authClient;
  }

  authClient = initializeAuth(getFirebaseApp(), {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: undefined,
  });

  return authClient;
};

const mapUser = (user: User | null): AuthUser | null => {
  if (!user) {
    return null;
  }
  return {
    uid: user.uid,
    email: user.email,
  };
};

export const readCurrentAuthUser = (): AuthUser | null => {
  const auth = getAuthClient();
  return mapUser(auth.currentUser);
};

export const authStateListener = (
  callback: (user: AuthUser | null) => void,
  onError?: (error: unknown) => void,
) => {
  const auth = getAuthClient();
  return onAuthStateChanged(
    auth,
    (user) => {
      callback(mapUser(user));
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const signInWithEmail = async (email: string, password: string) => {
  const auth = getAuthClient();
  await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  const auth = getAuthClient();
  await createUserWithEmailAndPassword(auth, email, password);
};

export const signOutCurrentUser = async () => {
  const auth = getAuthClient();
  await signOut(auth);
};

export const hasEmbeddedAndroidCustomToken = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return readEmbeddedAndroidCustomToken(window) !== null;
};

export const consumeEmbeddedAndroidCustomToken = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false;
  }
  const token = readEmbeddedAndroidCustomToken(window);
  if (!token) {
    return false;
  }

  clearEmbeddedAndroidCustomToken(window);
  const auth = getAuthClient();
  await signInWithCustomToken(auth, token);
  return true;
};

export const notifyEmbeddedAndroidAuthState = (user: AuthUser | null) => {
  if (typeof window === 'undefined') {
    return;
  }
  const bridge = (window as AndroidBridgeWindow).ProfitLensAndroidBridge;
  bridge?.onAuthStateChanged?.(user ? 'signed_in' : 'signed_out');
};

const readEmbeddedAndroidCustomToken = (currentWindow: Window): string | null => {
  const hash = currentWindow.location.hash.replace(/^#/, '');
  if (!hash) {
    return null;
  }
  const params = new URLSearchParams(hash);
  const token = params.get(androidTokenHashKey)?.trim();
  return token || null;
};

const clearEmbeddedAndroidCustomToken = (currentWindow: Window) => {
  const currentUrl = new URL(currentWindow.location.href);
  const params = new URLSearchParams(currentUrl.hash.replace(/^#/, ''));
  params.delete(androidTokenHashKey);
  const nextHash = params.toString();
  currentUrl.hash = nextHash ? nextHash : '';
  currentWindow.history.replaceState({}, '', currentUrl.toString());
};
