import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import type { Entitlement, OfferUsage } from '../../../lib/types/billing';
import type { DeviceEntry } from '../../../lib/types/device';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { getDeviceId } from '../../../lib/config/device-id';
import { billingPlans } from '../../../lib/config/runtime-config';
import {
  openCustomerPortal,
  startCheckout,
  watchEntitlement,
  watchUsage,
} from '../../../lib/features/billing/billing-service';
import {
  registerDevice,
  revokeDevice,
  watchDevices,
} from '../../../lib/features/devices/devices-service';
import { saveUserProfile, watchUserProfile } from '../../../lib/features/profile/profile-service';
import {
  deleteVehicle,
  lookupVehicleByPlate,
  lookupVehicleModel,
  saveVehicle,
  watchVehicles,
} from '../../../lib/features/vehicles/vehicles-service';
import { useAuth } from '../../../lib/auth/auth-context';
import { applyLocale, t, useI18n } from '../../../lib/i18n/i18n-context';
import {
  asNumber,
  createId,
  defaultVehicleDraft,
  formatDate,
} from '../../../lib/features/settings/settings-utils';

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const profile = useSignal<UserProfile | null>(null);
  const profileStatus = useSignal('');
  const profileSaving = useSignal(false);
  const vehicles = useSignal<VehicleProfile[]>([]);
  const vehicleDraft = useSignal<VehicleProfile>(defaultVehicleDraft());
  const vehicleStatus = useSignal('');
  const vehicleSaving = useSignal(false);
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const billingStatus = useSignal('');
  const devices = useSignal<DeviceEntry[]>([]);
  const devicesStatus = useSignal('');

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

    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile: UserProfile) => {
      profile.value = nextProfile;
    });
    const unsubscribeVehicles = watchVehicles(user.uid, (nextVehicles: VehicleProfile[]) => {
      vehicles.value = nextVehicles;
    });
    const unsubscribeEntitlement = watchEntitlement(user.uid, (nextEntitlement: Entitlement | null) => {
      entitlement.value = nextEntitlement;
      usage.value = null;
      if (unsubscribeUsage) {
        unsubscribeUsage();
        unsubscribeUsage = null;
      }
      if (nextEntitlement?.periodKey) {
        unsubscribeUsage = watchUsage(user.uid, nextEntitlement.periodKey, (nextUsage: OfferUsage | null) => {
          usage.value = nextUsage;
        });
      }
    });
    const unsubscribeDevices = watchDevices(user.uid, (nextDevices: DeviceEntry[]) => {
      devices.value = nextDevices;
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

  return (
    <div class="pl-stack">
      <section class="pl-list-item pl-stack">
        <h2 style="margin:0;">{t(i18n, 'profileSectionTitle', 'Business profile')}</h2>
        <div class="pl-row">
          <div class="pl-field" style="flex:1; min-width:220px;">
            <label>{t(i18n, 'countryLabel', 'Country')}</label>
            <input class="pl-input" value={profile.value?.countryCode ?? ''} onInput$={(_, el) => profile.value && (profile.value = { ...profile.value, countryCode: el.value.toUpperCase() })} />
          </div>
          <div class="pl-field" style="flex:1; min-width:220px;">
            <label>{t(i18n, 'currencyLabel', 'Currency')}</label>
            <input class="pl-input" value={profile.value?.currencyCode ?? ''} onInput$={(_, el) => profile.value && (profile.value = { ...profile.value, currencyCode: el.value.toUpperCase() })} />
          </div>
          <div class="pl-field" style="flex:1; min-width:220px;">
            <label>{t(i18n, 'languageLabel', 'Language')}</label>
            <select class="pl-select" value={profile.value?.preferredLocale ?? i18n.locale.value} onChange$={(_, el) => profile.value && (profile.value = { ...profile.value, preferredLocale: el.value })}>
              <option value="fr">FR</option>
              <option value="en">EN</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </div>
        <div class="pl-row">
          <div class="pl-field" style="flex:1; min-width:220px;">
            <label>{t(i18n, 'minProfitabilityLabel', 'Minimum profitability')}</label>
            <input class="pl-input" value={String(profile.value?.minProfitabilityEuro ?? 0)} onInput$={(_, el) => profile.value && (profile.value = { ...profile.value, minProfitabilityEuro: asNumber(el.value) })} />
          </div>
          <div class="pl-field" style="flex:1; min-width:220px;">
            <label>{t(i18n, 'socialContributionRateLabel', 'Social contribution rate')}</label>
            <input class="pl-input" value={String(profile.value?.socialContributionRate ?? 0)} onInput$={(_, el) => profile.value && (profile.value = { ...profile.value, socialContributionRate: asNumber(el.value) })} />
          </div>
        </div>
        <button
          class="pl-button pl-button-primary"
          disabled={profileSaving.value || !profile.value}
          onClick$={async () => {
            if (!profile.value) {
              return;
            }
            profileSaving.value = true;
            profileStatus.value = '';
            try {
              await saveUserProfile(profile.value);
              await applyLocale(i18n, profile.value.preferredLocale as 'fr' | 'en' | 'ar');
              profileStatus.value = t(i18n, 'profileSavedMessage', 'Profile saved.');
            } catch (error) {
              profileStatus.value = error instanceof Error ? error.message : String(error);
            } finally {
              profileSaving.value = false;
            }
          }}
        >
          {profileSaving.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'saveProfileButton', 'Save profile')}
        </button>
        <div class={{ 'pl-status': true, 'pl-status-error': Boolean(profileStatus.value) && !profileStatus.value.toLowerCase().includes('saved'), 'pl-status-success': profileStatus.value.toLowerCase().includes('saved') }}>{profileStatus.value}</div>
      </section>

      <section class="pl-list-item pl-stack">
        <h2 style="margin:0;">{t(i18n, 'vehiclesSectionTitle', 'Vehicles')}</h2>
        <div class="pl-row">
          <select class="pl-select" value={vehicleDraft.value.id} onChange$={(_, el) => {
            const selected = vehicles.value.find((vehicle) => vehicle.id === el.value);
            vehicleDraft.value = selected ? { ...selected } : defaultVehicleDraft();
          }}>
            <option value="">{t(i18n, 'addVehicleTitle', 'Add vehicle')}</option>
            {vehicles.value.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicle.name || vehicle.id}</option>
            ))}
          </select>
          <button class="pl-button pl-button-ghost" onClick$={() => (vehicleDraft.value = defaultVehicleDraft())}>{t(i18n, 'addVehicleTitle', 'Add vehicle')}</button>
        </div>
        <div class="pl-row">
          <div class="pl-field" style="flex:1; min-width:240px;"><label>{t(i18n, 'vehicleNameLabel', 'Vehicle name')}</label><input class="pl-input" value={vehicleDraft.value.name} onInput$={(_, el) => (vehicleDraft.value = { ...vehicleDraft.value, name: el.value })} /></div>
          <div class="pl-field" style="flex:1; min-width:240px;"><label>{t(i18n, 'vehicleLicensePlateLabel', 'License plate')}</label><input class="pl-input" value={vehicleDraft.value.licensePlate ?? ''} onInput$={(_, el) => (vehicleDraft.value = { ...vehicleDraft.value, licensePlate: el.value })} /></div>
        </div>
        <div class="pl-row">
          <div class="pl-field" style="flex:1; min-width:180px;"><label>{t(i18n, 'vehicleBrandLabel', 'Brand')}</label><input class="pl-input" value={vehicleDraft.value.brand ?? ''} onInput$={(_, el) => (vehicleDraft.value = { ...vehicleDraft.value, brand: el.value })} /></div>
          <div class="pl-field" style="flex:1; min-width:180px;"><label>{t(i18n, 'vehicleModelLabel', 'Model')}</label><input class="pl-input" value={vehicleDraft.value.model ?? ''} onInput$={(_, el) => (vehicleDraft.value = { ...vehicleDraft.value, model: el.value })} /></div>
          <div class="pl-field" style="flex:1; min-width:180px;"><label>{t(i18n, 'vehicleTypeLabel', 'Vehicle type')}</label><input class="pl-input" value={vehicleDraft.value.type} onInput$={(_, el) => (vehicleDraft.value = { ...vehicleDraft.value, type: el.value })} /></div>
          <div class="pl-field" style="flex:1; min-width:180px;"><label>{t(i18n, 'energyTypeLabel', 'Energy type')}</label><input class="pl-input" value={vehicleDraft.value.energyType} onInput$={(_, el) => (vehicleDraft.value = { ...vehicleDraft.value, energyType: el.value })} /></div>
        </div>
        <div class="pl-row">
          <button class="pl-button pl-button-ghost" disabled={!vehicleDraft.value.licensePlate} onClick$={async () => {
            try {
              const payload = await lookupVehicleByPlate(vehicleDraft.value.licensePlate ?? '');
              vehicleDraft.value = { ...vehicleDraft.value, brand: (payload.brand as string | undefined) ?? vehicleDraft.value.brand, model: (payload.model as string | undefined) ?? vehicleDraft.value.model, registrationYear: payload.registrationYear == null ? vehicleDraft.value.registrationYear : Number(payload.registrationYear), energyType: (payload.energyType as string | undefined) ?? vehicleDraft.value.energyType };
            } catch (error) {
              vehicleStatus.value = error instanceof Error ? error.message : String(error);
            }
          }}>Lookup plate</button>
          <button class="pl-button pl-button-ghost" disabled={!vehicleDraft.value.brand || !vehicleDraft.value.model} onClick$={async () => {
            try {
              const payload = await lookupVehicleModel({ brand: vehicleDraft.value.brand ?? '', model: vehicleDraft.value.model ?? '', energyType: vehicleDraft.value.energyType });
              if (payload.consumptionPer100Km != null) {
                vehicleDraft.value = { ...vehicleDraft.value, energyConsumptionPer100Km: Number(payload.consumptionPer100Km) };
              }
            } catch (error) {
              vehicleStatus.value = error instanceof Error ? error.message : String(error);
            }
          }}>Lookup model</button>
          <button class="pl-button pl-button-primary" disabled={vehicleSaving.value} onClick$={async () => {
            const user = auth.user.value;
            if (!user) return;
            vehicleSaving.value = true;
            vehicleStatus.value = '';
            try {
              const id = vehicleDraft.value.id || createId();
              await saveVehicle(user.uid, { ...vehicleDraft.value, id, name: vehicleDraft.value.name || 'Vehicle' });
              vehicleStatus.value = t(i18n, 'vehicleSavedMessage', 'Vehicle saved.');
              vehicleDraft.value = defaultVehicleDraft();
            } catch (error) {
              vehicleStatus.value = error instanceof Error ? error.message : String(error);
            } finally {
              vehicleSaving.value = false;
            }
          }}>{t(i18n, 'saveVehicleButton', 'Save vehicle')}</button>
          <button class="pl-button pl-button-danger" disabled={!vehicleDraft.value.id || vehicleSaving.value} onClick$={async () => {
            const user = auth.user.value;
            if (!user || !vehicleDraft.value.id) return;
            try {
              await deleteVehicle(user.uid, vehicleDraft.value);
              vehicleStatus.value = t(i18n, 'vehicleDeletedMessage', 'Vehicle deleted.');
              vehicleDraft.value = defaultVehicleDraft();
            } catch (error) {
              vehicleStatus.value = error instanceof Error ? error.message : String(error);
            }
          }}>{t(i18n, 'deleteVehicleAction', 'Delete vehicle')}</button>
        </div>
        <div class={{ 'pl-status': true, 'pl-status-error': Boolean(vehicleStatus.value) && !vehicleStatus.value.toLowerCase().includes('saved') && !vehicleStatus.value.toLowerCase().includes('deleted'), 'pl-status-success': vehicleStatus.value.toLowerCase().includes('saved') || vehicleStatus.value.toLowerCase().includes('deleted') }}>{vehicleStatus.value}</div>
      </section>

      <section class="pl-list-item pl-stack">
        <h2 style="margin:0;">Subscription</h2>
        <div>{entitlement.value ? `${entitlement.value.status} (${entitlement.value.planId})` : 'No active subscription data.'}</div>
        <div>{usage.value ? `Offers this period: ${usage.value.offerCount}` : 'Usage unavailable.'}</div>
        <div class="pl-row">
          {billingPlans.map((plan) => (
            <button key={plan.id} class="pl-button pl-button-ghost" disabled={!plan.priceId} onClick$={async () => {
              billingStatus.value = '';
              try {
                await startCheckout(plan.priceId);
              } catch (error) {
                billingStatus.value = error instanceof Error ? error.message : String(error);
              }
            }}>{plan.id} ({plan.priceLabel})</button>
          ))}
          <button class="pl-button pl-button-primary" onClick$={async () => {
            billingStatus.value = '';
            try {
              await openCustomerPortal();
            } catch (error) {
              billingStatus.value = error instanceof Error ? error.message : String(error);
            }
          }}>Portal</button>
        </div>
        <div class={{ 'pl-status': true, 'pl-status-error': Boolean(billingStatus.value) }}>{billingStatus.value}</div>
      </section>

      <section class="pl-list-item pl-stack">
        <h2 style="margin:0;">{t(i18n, 'devicesSectionTitle', 'Devices')}</h2>
        <p class="pl-subtitle" style="margin:0;">{t(i18n, 'devicesSectionSubtitle', 'Manage the device linked to your plan')}</p>
        <div class="pl-row">
          <button class="pl-button pl-button-primary" onClick$={async () => {
            devicesStatus.value = '';
            try {
              await registerDevice({
                deviceId: getDeviceId(),
                platform: navigator.platform || 'web',
                userAgent: navigator.userAgent,
              });
              devicesStatus.value = 'Device registered.';
            } catch (error) {
              devicesStatus.value = error instanceof Error ? error.message : String(error);
            }
          }}>Register current device</button>
        </div>
        <ul class="pl-list">
          {devices.value.length === 0 && <li class="pl-list-item">No devices found.</li>}
          {devices.value.map((device) => (
            <li key={device.id} class="pl-list-item">
              <div><strong>{device.deviceLabel || device.platform || t(i18n, 'deviceUnknownLabel', 'Unknown device')}</strong> {device.isCurrent ? `(${t(i18n, 'deviceCurrentLabel', 'Current')})` : ''}</div>
              <div>{device.userAgent || ''}</div>
              <div>{t(i18n, 'deviceLastSeenPrefix', 'Last seen')} {formatDate(device.lastSeenAt)}</div>
              <button class="pl-button pl-button-danger" onClick$={async () => {
                devicesStatus.value = '';
                try {
                  await revokeDevice({ deviceId: device.id });
                  devicesStatus.value = 'Device revoked.';
                } catch (error) {
                  devicesStatus.value = error instanceof Error ? error.message : String(error);
                }
              }}>{t(i18n, 'deviceRevokeAction', 'Revoke')}</button>
            </li>
          ))}
        </ul>
        <div class={{ 'pl-status': true, 'pl-status-error': Boolean(devicesStatus.value) && !devicesStatus.value.toLowerCase().includes('registered') && !devicesStatus.value.toLowerCase().includes('revoked'), 'pl-status-success': devicesStatus.value.toLowerCase().includes('registered') || devicesStatus.value.toLowerCase().includes('revoked') }}>{devicesStatus.value}</div>
      </section>
    </div>
  );
});
