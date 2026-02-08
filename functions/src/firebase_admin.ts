import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const app = initializeApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);
