import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  initializeAuth,
  indexedDBLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirebaseApp } from './client';
import type { AuthUser } from '../types/auth';

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

const mapUser = (user: User | null): AuthUser | null => {
  if (!user) {
    return null;
  }
  return {
    uid: user.uid,
    email: user.email,
  };
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
