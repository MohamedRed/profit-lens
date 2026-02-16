import { component$, useSignal } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { useAuth } from '../../../lib/auth/auth-context';
import { signOutCurrentUser } from '../../../lib/firebase/auth';
import { billingPlans } from '../../../lib/config/runtime-config';
import { applyLocale, formatTemplate, t, useI18n } from '../../../lib/i18n/i18n-context';
import { startCheckout } from '../../../lib/features/billing/billing-service';
import { saveUserProfile } from '../../../lib/features/profile/profile-service';
import { Select } from '../../../components/ui/select';
import type { Entitlement, OfferUsage } from '../../../lib/types/billing';
import type { DeviceEntry } from '../../../lib/types/device';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { useSettingsTabSession } from './use-settings-tab-session';

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
  const checkoutLoading = useSignal(false);
  const status = useSignal('');

  useSettingsTabSession({ auth, profile, vehicles, entitlement, usage, devices, selectedLanguage });

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

  const languageOptions = [
    { value: 'fr', label: `${flagForLocale('fr')} ${t(i18n, 'languageFrench', 'French')}` },
    { value: 'en', label: `${flagForLocale('en')} ${t(i18n, 'languageEnglish', 'English')}` },
    { value: 'ar', label: `${flagForLocale('ar')} ${t(i18n, 'languageArabic', 'Arabic')}` },
  ];

  return (
    <div class="ui-settings-root">
      <section class="ui-settings-card">
        <Link class="ui-settings-tile ui-settings-tile-link" href="/next/app/settings/profile">
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
        </Link>
      </section>

      <section class="ui-settings-card ui-settings-language">
        <h2 class="ui-settings-section-title">{t(i18n, 'languageSectionTitle', 'Language')}</h2>
        <Select
          id="settings-language"
          class="ui-select ui-settings-language-select"
          options={languageOptions}
          value={selectedLanguage.value}
          disabled={languageSaving.value || !currentProfile}
          onChange$={async (next) => {
            if (!currentProfile) {
              return;
            }
            const nextLocale = next as 'fr' | 'en' | 'ar';
            if (nextLocale === selectedLanguage.value) {
              return;
            }
            status.value = '';
            languageSaving.value = true;
            const previous = selectedLanguage.value;
            selectedLanguage.value = nextLocale;
            try {
              await applyLocale(i18n, nextLocale);
              await saveUserProfile({ ...currentProfile, preferredLocale: nextLocale });
            } catch (error) {
              selectedLanguage.value = previous;
              status.value = error instanceof Error ? error.message : String(error);
            } finally {
              languageSaving.value = false;
            }
          }}
        />
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
        <Link class="ui-settings-tile" href="/next/app/settings/native-poc">
          <span class="material-icons-outlined ui-settings-leading" aria-hidden="true">
            smartphone
          </span>
          <div class="ui-settings-tile-content">
            <p class="ui-settings-title">Native UI POC</p>
            <p class="ui-settings-subtitle">Framework7 interaction demo inside Qwik</p>
          </div>
          <span class="material-icons-outlined ui-settings-chevron" aria-hidden="true">
            chevron_right
          </span>
        </Link>
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
                {formatTemplate(t(i18n, 'offersRemainingValue', '{remaining} remaining this month'), {
                  remaining:
                    currentEntitlement.offerLimit == null
                      ? t(i18n, 'offersRemainingUnlimited', 'Unlimited')
                      : String(Math.max(0, currentEntitlement.offerLimit - usage.value.offerCount)),
                  count:
                    currentEntitlement.offerLimit == null
                      ? t(i18n, 'offersRemainingUnlimited', 'Unlimited')
                      : String(Math.max(0, currentEntitlement.offerLimit - usage.value.offerCount)),
                })}
              </p>
            ) : null}
          </div>
          {currentEntitlement?.planId.toLowerCase() === 'free' ? (
            <button
              type="button"
              class="ui-settings-pill-button"
              disabled={checkoutLoading.value}
              onClick$={async () => {
                status.value = '';
                checkoutLoading.value = true;
                try {
                  if (!paidPlan?.priceId) {
                    throw new Error('Paid plan is unavailable.');
                  }
                  await startCheckout(paidPlan.priceId);
                } catch (error) {
                  status.value = error instanceof Error ? error.message : String(error);
                  checkoutLoading.value = false;
                }
              }}
            >
              {checkoutLoading.value
                ? t(i18n, 'loadingLabel', 'Loading...')
                : t(i18n, 'upgradePlanButton', 'Upgrade plan')}
            </button>
          ) : (
            <Link class="ui-settings-pill-button ui-settings-pill-link" href="/next/app/settings/billing">
              {t(i18n, 'managePlanButton', 'Manage subscription')}
            </Link>
          )}
        </div>
      </section>

      <section class="ui-settings-card">
        <Link class="ui-settings-tile ui-settings-tile-link" href="/next/app/settings/devices">
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
        </Link>
      </section>

      <section class="ui-settings-card">
        <Link class="ui-settings-vehicles-link ui-settings-tile-link" href="/next/app/settings/vehicles">
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
            <p class="ui-settings-subtitle ui-settings-vehicles-empty">
              {t(i18n, 'noVehiclesMessage', 'No vehicles found.')}
            </p>
          )}
        </Link>
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
