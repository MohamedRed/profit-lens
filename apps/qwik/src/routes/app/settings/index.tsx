import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../../lib/auth/auth-context';
import { signOutCurrentUser } from '../../../lib/firebase/auth';
import { billingPlans } from '../../../lib/config/runtime-config';
import { applyLocale, formatTemplate, t, useI18n } from '../../../lib/i18n/i18n-context';
import { resolveUserFacingErrorMessage } from '../../../lib/errors/user-facing-error';
import { startCheckout } from '../../../lib/features/billing/billing-service';
import { isRunningAsInstalledPwa } from '../../../lib/features/pwa/pwa-install-state';
import { saveUserProfile } from '../../../lib/features/profile/profile-service';
import { VisualOptionPicker } from '../../../components/ui/visual-option-picker';
import type { Entitlement, OfferUsage } from '../../../lib/types/billing';
import type { DeviceEntry } from '../../../lib/types/device';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { buildVehicleEditorHref } from './shared/vehicle-editor-href';
import { writeVehicleEditorTargetId } from './shared/vehicle-editor-target';
import { useSettingsTabSession } from './use-settings-tab-session';

const formatCurrency = (locale: string, value: number): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const navigate = useNavigate();

  const profile = useSignal<UserProfile | null>(null);
  const vehicles = useSignal<VehicleProfile[]>([]);
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const devices = useSignal<DeviceEntry[]>([]);

  const selectedLanguage = useSignal<'fr' | 'en' | 'ar'>('fr');
  const languageSaving = useSignal(false);
  const checkoutLoading = useSignal(false);
  const showInstallTile = useSignal(false);
  const status = useSignal('');

  useSettingsTabSession({ auth, profile, vehicles, entitlement, usage, devices, selectedLanguage });
  useVisibleTask$(() => {
    showInstallTile.value = !isRunningAsInstalledPwa(window);
  });

  const locale = i18n.locale.value;
  const currentProfile = profile.value;
  const currentEntitlement = entitlement.value;
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
    { value: 'fr', label: t(i18n, 'languageFrench', 'French'), mediaText: '🇫🇷' },
    { value: 'en', label: t(i18n, 'languageEnglish', 'English'), mediaText: '🇬🇧' },
    { value: 'ar', label: t(i18n, 'languageArabic', 'Arabic'), mediaText: '🇲🇦' },
  ];

  return (
    <div class="ui-settings-root">
      <section class="ui-settings-card ui-settings-language">
        <h2 class="ui-settings-section-title">{t(i18n, 'languageSectionTitle', 'Language')}</h2>
        <VisualOptionPicker
          ariaLabel={t(i18n, 'languageSectionTitle', 'Language')}
          class="ui-settings-language-select"
          compact
          columns={3}
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
              status.value = resolveUserFacingErrorMessage(i18n, error, 'language');
            } finally {
              languageSaving.value = false;
            }
          }}
        />
      </section>

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

      <section class="ui-settings-card">
        <div class="ui-settings-vehicles-head">
          <p class="ui-settings-title">{t(i18n, 'vehiclesSectionTitle', 'Vehicles')}</p>
          <Link class="ui-settings-link-button" href="/next/app/settings/vehicles/new">
            <span class="material-icons-outlined" aria-hidden="true">
              add
            </span>
            <span>{t(i18n, 'addVehicleTitle', 'Add vehicle')}</span>
          </Link>
        </div>
        {vehicles.value.length === 0 ? (
          <p class="ui-settings-subtitle ui-settings-vehicles-empty">
            {t(i18n, 'noVehiclesMessage', 'No vehicles found.')}
          </p>
        ) : (
          <ul class="ui-settings-vehicles-inline-list">
            {vehicles.value.map((vehicle) => (
              <li key={vehicle.id}>
                <button
                  type="button"
                  class="ui-settings-vehicle-row ui-settings-tile-link"
                  onClick$={() => {
                    writeVehicleEditorTargetId(vehicle.id);
                    void navigate(buildVehicleEditorHref(vehicle.id));
                  }}
                  aria-label={t(i18n, 'editVehicleButton', 'Edit vehicle')}
                >
                  <div>
                    <p class="ui-settings-vehicle-name">{vehicle.name}</p>
                    <p class="ui-settings-vehicle-type">{vehicle.type}</p>
                  </div>
                  <span class="material-icons-outlined ui-settings-chevron" aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
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
                if (!paidPlan?.priceId) {
                  status.value = t(
                    i18n,
                    'errorPlanUnavailable',
                    'No paid plan is available right now. Please try again later.',
                  );
                  return;
                }
                checkoutLoading.value = true;
                try {
                  await startCheckout(paidPlan.priceId);
                } catch (error) {
                  status.value = resolveUserFacingErrorMessage(i18n, error, 'billing');
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

      {showInstallTile.value ? (
        <section class="ui-settings-card">
          <div class="ui-settings-tile">
            <span class="material-icons-outlined ui-settings-leading" aria-hidden="true">
              ios_share
            </span>
            <div class="ui-settings-tile-content">
              <p class="ui-settings-title">{t(i18n, 'installAppTitle', "Install the app")}</p>
              <p class="ui-settings-subtitle">
                {t(i18n, 'installAppSubtitle', 'Add Liive Profit to your home screen')}
              </p>
            </div>
          </div>
        </section>
      ) : null}

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
