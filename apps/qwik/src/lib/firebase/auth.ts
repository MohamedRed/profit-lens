import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirebaseApp } from './client';
import type { AuthUser } from '../types/auth';

const mapUser = (user: User | null): AuthUser | null => {
  if (!user) {
    return null;
  }
  return {
    uid: user.uid,
    email: user.email,
  };
};

export const authStateListener = (callback: (user: AuthUser | null) => void) => {
  const auth = getAuth(getFirebaseApp());
  return onAuthStateChanged(auth, (user) => {
    callback(mapUser(user));
  });
};

export const signInWithEmail = async (email: string, password: string) => {
  const auth = getAuth(getFirebaseApp());
  await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  const auth = getAuth(getFirebaseApp());
  await createUserWithEmailAndPassword(auth, email, password);
};

export const signOutCurrentUser = async () => {
  const auth = getAuth(getFirebaseApp());
  await signOut(auth);
};
