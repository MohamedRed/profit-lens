import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../lib/auth/auth-context';
import { signOutCurrentUser } from '../../../lib/firebase/auth';
import { billingPlans } from '../../../lib/config/runtime-config';
import { applyLocale, t, useI18n } from '../../../lib/i18n/i18n-context';
import { openCustomerPortal, startCheckout, watchEntitlement, watchUsage } from '../../../lib/features/billing/billing-service';
import { saveUserProfile, watchUserProfile } from '../../../lib/features/profile/profile-service';
import { watchDevices } from '../../../lib/features/devices/devices-service';
import { watchVehicles } from '../../../lib/features/vehicles/vehicles-service';
import type { Entitlement, OfferUsage } from '../../../lib/types/billing';
import type { DeviceEntry } from '../../../lib/types/device';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';

const formatCurrency = (locale: string, value: number): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const flagForLocale = (code: string): string => {
  if (code === 'fr') return '🇫🇷';
  if (code === 'en') return '🇬🇧';
  if (code === 'ar') return '🇲🇦';
  return '🏳️';
};

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();

  const profile = useSignal<UserProfile | null>(null);
  const vehicles = useSignal<VehicleProfile[]>([]);
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const devices = useSignal<DeviceEntry[]>([]);

  const selectedLanguage = useSignal<'fr' | 'en' | 'ar'>('fr');
  const languageSaving = useSignal(false);
  const openingPortal = useSignal(false);
  const status = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      profile.value = null;
      vehicles.value = [];
      entitlement.value = null;
      usage.value = null;
      devices.value = [];
      return;
    }

    let unsubscribeUsage: (() => void) | null = null;
    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      selectedLanguage.value = (nextProfile.preferredLocale || 'fr') as 'fr' | 'en' | 'ar';
    });
    const unsubscribeVehicles = watchVehicles(user.uid, (items) => {
      vehicles.value = items;
    });
    const unsubscribeEntitlement = watchEntitlement(user.uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
      usage.value = null;
      if (unsubscribeUsage) {
        unsubscribeUsage();
        unsubscribeUsage = null;
      }
      if (nextEntitlement?.periodKey) {
        unsubscribeUsage = watchUsage(user.uid, nextEntitlement.periodKey, (nextUsage) => {
          usage.value = nextUsage;
        });
      }
    });
    const unsubscribeDevices = watchDevices(user.uid, (items) => {
      devices.value = items;
    });

    cleanup(() => {
      unsubscribeProfile();
      unsubscribeVehicles();
      unsubscribeEntitlement();
      unsubscribeDevices();
      if (unsubscribeUsage) {
        unsubscribeUsage();
      }
    });
  });

  const locale = i18n.locale.value;
  const currentProfile = profile.value;
  const currentEntitlement = entitlement.value;
  const firstVehicle = vehicles.value[0];
  const currentDevice = devices.value.find((entry) => entry.isCurrent);
  const paidPlan = billingPlans.find((plan) => plan.offerLimit !== null && Boolean(plan.priceId));
  const subscriptionTitle = currentEntitlement?.planId.toLowerCase() === 'free'
    ? t(i18n, 'subscriptionFreeTitle', 'Free plan')
    : t(i18n, 'subscriptionActiveTitle', 'Subscription active');
  const subscriptionSubtitle = currentEntitlement?.planId.toLowerCase() === 'free'
    ? t(i18n, 'subscriptionFreeSubtitle', '10 offers per month')
    : t(i18n, 'subscriptionActivePlan', 'Current plan: {price}').replace(
        '{price}',
        paidPlan?.priceLabel ?? '',
      );

  return (
    <div class="ui-settings-root">
      <section class="ui-settings-card">
        <div class="ui-settings-tile">
          <div class="ui-settings-tile-content">
            <p class="ui-settings-title">{t(i18n, 'profileSectionTitle', 'Business profile')}</p>
            <p class="ui-settings-subtitle">
              {t(i18n, 'socialRateLabel', 'Social contribution rate')}:{' '}
              {currentProfile ? `${(currentProfile.socialContributionRate * 100).toFixed(1)}%` : '—'}
            </p>
            <p class="ui-settings-subtitle">
              {t(i18n, 'monthlyFixedCostsLabel', 'Monthly fixed costs')}:{' '}
              {currentProfile ? formatCurrency(locale, currentProfile.monthlyFixedCosts) : '—'}
            </p>
          </div>
          <span class="material-icons-outlined ui-settings-chevron" aria-hidden="true">
            chevron_right
          </span>
        </div>
      </section>

      <section class="ui-settings-card ui-settings-language">
        <h2 class="ui-settings-section-title">{t(i18n, 'languageSectionTitle', 'Language')}</h2>
        <select
          class="ui-select ui-settings-language-select"
          value={selectedLanguage.value}
          disabled={languageSaving.value || !currentProfile}
          onChange$={async (_, el) => {
            if (!currentProfile) {
              return;
            }
            const next = el.value as 'fr' | 'en' | 'ar';
            if (next === selectedLanguage.value) {
              return;
            }
            status.value = '';
            languageSaving.value = true;
            const previous = selectedLanguage.value;
            selectedLanguage.value = next;
            try {
              await applyLocale(i18n, next);
              await saveUserProfile({ ...currentProfile, preferredLocale: next });
            } catch (error) {
              selectedLanguage.value = previous;
              status.value = error instanceof Error ? error.message : String(error);
            } finally {
              languageSaving.value = false;
            }
          }}
        >
          <option value="fr">{`${flagForLocale('fr')} ${t(i18n, 'languageFrench', 'French')}`}</option>
          <option value="en">{`${flagForLocale('en')} ${t(i18n, 'languageEnglish', 'English')}`}</option>
          <option value="ar">{`${flagForLocale('ar')} ${t(i18n, 'languageArabic', 'Arabic')}`}</option>
        </select>
      </section>

      <section class="ui-settings-card">
        <div class="ui-settings-tile">
          <span class="material-icons-outlined ui-settings-leading" aria-hidden="true">
            ios_share
          </span>
          <div class="ui-settings-tile-content">
            <p class="ui-settings-title">{t(i18n, 'installAppTitle', "Install the app")}</p>
            <p class="ui-settings-subtitle">
              {t(i18n, 'installAppSubtitle', 'Add ProfitLens to your home screen')}
            </p>
          </div>
        </div>
      </section>

      <section class="ui-settings-card">
        <div class="ui-settings-tile">
          <span class="material-icons-outlined ui-settings-leading" aria-hidden="true">
            payment
          </span>
          <div class="ui-settings-tile-content">
            <p class="ui-settings-title">{subscriptionTitle}</p>
            <p class="ui-settings-subtitle">{subscriptionSubtitle}</p>
            {currentEntitlement && usage.value ? (
              <p class="ui-settings-subtitle">
                {t(i18n, 'offersRemainingValue', '{remaining} remaining this month').replace(
                  '{remaining}',
                  String(
                    currentEntitlement.offerLimit == null
                      ? t(i18n, 'offersRemainingUnlimited', 'Unlimited')
                      : Math.max(0, currentEntitlement.offerLimit - usage.value.offerCount),
                  ),
                )}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            class="ui-settings-pill-button"
            disabled={openingPortal.value}
            onClick$={async () => {
              if (openingPortal.value) {
                return;
              }
              status.value = '';
              openingPortal.value = true;
              try {
                if (currentEntitlement?.planId.toLowerCase() === 'free') {
                  if (paidPlan?.priceId) {
                    await startCheckout(paidPlan.priceId);
                  }
                } else {
                  await openCustomerPortal();
                }
              } catch (error) {
                status.value = error instanceof Error ? error.message : String(error);
              } finally {
                openingPortal.value = false;
              }
            }}
          >
            {currentEntitlement?.planId.toLowerCase() === 'free'
              ? t(i18n, 'upgradePlanButton', 'Upgrade plan')
              : t(i18n, 'managePlanButton', 'Manage subscription')}
          </button>
        </div>
      </section>

      <section class="ui-settings-card">
        <div class="ui-settings-tile">
          <span class="material-icons-outlined ui-settings-leading" aria-hidden="true">
            devices
          </span>
          <div class="ui-settings-tile-content">
            <p class="ui-settings-title">{t(i18n, 'devicesSectionTitle', 'Devices')}</p>
            <p class="ui-settings-subtitle">
              {t(i18n, 'devicesSectionSubtitle', 'Manage the device linked to your plan')}
            </p>
            <p class="ui-settings-subtitle">
              {currentDevice?.deviceLabel ||
                currentDevice?.platform ||
                t(i18n, 'deviceUnknownLabel', 'Unknown device')}
            </p>
          </div>
          <span class="material-icons-outlined ui-settings-chevron" aria-hidden="true">
            chevron_right
          </span>
        </div>
      </section>

      <section class="ui-settings-card">
        <div class="ui-settings-vehicles-head">
          <p class="ui-settings-title">{t(i18n, 'vehiclesSectionTitle', 'Vehicles')}</p>
          <span class="material-icons-outlined ui-settings-plus" aria-hidden="true">
            add
          </span>
        </div>
        {firstVehicle ? (
          <div class="ui-settings-vehicle-row">
            <div>
              <p class="ui-settings-vehicle-name">{firstVehicle.name}</p>
              <p class="ui-settings-vehicle-type">{firstVehicle.type}</p>
            </div>
            <span class="material-icons-outlined ui-settings-chevron" aria-hidden="true">
              chevron_right
            </span>
          </div>
        ) : (
          <p class="ui-settings-subtitle">{t(i18n, 'noVehiclesMessage', 'No vehicles found.')}</p>
        )}
      </section>

      <section class="ui-settings-card">
        <button
          type="button"
          class="ui-settings-signout"
          onClick$={async () => {
            await signOutCurrentUser();
          }}
        >
          <span class="material-icons-outlined ui-settings-leading" aria-hidden="true">
            logout
          </span>
          <span>{t(i18n, 'signOutButton', 'Sign out')}</span>
        </button>
      </section>

      {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
    </div>
  );
});
