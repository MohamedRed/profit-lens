import {
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  type CollectionReference,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';
import { getFirebaseApp } from './client';

export const getDb = (): Firestore => {
  return getFirestore(getFirebaseApp());
};

export const userDoc = (uid: string): DocumentReference => doc(getDb(), 'users', uid);

export const userCollection = (
  uid: string,
  path: string,
): CollectionReference => collection(getDb(), 'users', uid, path);

export const nowServer = () => serverTimestamp();
