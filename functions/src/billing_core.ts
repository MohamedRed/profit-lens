import { defineSecret } from "firebase-functions/params";
import { HttpsError } from "firebase-functions/v2/https";
import { Timestamp } from "firebase-admin/firestore";
import Stripe from "stripe";
import { entitlementDocRef } from "./entitlements";

export const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

export function getStripe() {
  const key = stripeSecretKey.value();
  if (!key) {
    throw new HttpsError("failed-precondition", "STRIPE_SECRET_KEY is not set.");
  }
  return new Stripe(key, { apiVersion: "2024-06-20" });
}

export async function getOrCreateCustomerId(uid: string, stripe: Stripe) {
  const docRef = entitlementDocRef(uid);
  const snapshot = await docRef.get();
  const existing = snapshot.data()?.stripeCustomerId as string | undefined;
  if (existing) {
    return existing;
  }
  const customer = await stripe.customers.create({
    metadata: { uid },
  });
  await docRef.set(
    {
      stripeCustomerId: customer.id,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
  return customer.id;
}
