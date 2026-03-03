import {
  browserLocalPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirebaseApp } from './client';

let authClient: Auth | null = null;

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

export const readCurrentFirebaseUser = (): User | null => {
  return getAuthClient().currentUser;
};

export const authStateListener = (
  callback: (user: User | null) => void,
  onError?: (error: unknown) => void,
) => {
  return onAuthStateChanged(
    getAuthClient(),
    (user) => {
      callback(user);
    },
    (error) => {
      onError?.(error);
    },
  );
};

export const readAdminClaim = async (user: User): Promise<boolean> => {
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.admin === true;
};

export const signInWithEmail = async (email: string, password: string) => {
  await signInWithEmailAndPassword(getAuthClient(), email, password);
};

export const signOutCurrentUser = async () => {
  await signOut(getAuthClient());
};
