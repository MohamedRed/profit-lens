import Stripe from "stripe";
import { syncStripeEntitlementForUid } from "./entitlements";
import { readCustomerId, readPrimarySubscriptionItem } from "./billing_subscription_ops";

export const syncEntitlementFromSubscription = async (
  uid: string,
  subscription: Stripe.Subscription
) => {
  const item = readPrimarySubscriptionItem(subscription);
  await syncStripeEntitlementForUid({
    uid,
    customerId: readCustomerId(subscription.customer),
    subscriptionId: subscription.id,
    priceId: item.price.id,
    status: subscription.status,
    periodStartSec: subscription.current_period_start,
    periodEndSec: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAtSec: subscription.canceled_at,
  });
};
