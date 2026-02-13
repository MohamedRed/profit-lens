import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../lib/auth/auth-context';
import { getDeviceId } from '../../../lib/config/device-id';
import {
  analyzeManualOffer,
  analyzeScreenshotOffer,
  verifyOfferRoute,
} from '../../../lib/features/offers/offers-service';
import { watchVehicles } from '../../../lib/features/vehicles/vehicles-service';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { t, useI18n } from '../../../lib/i18n/i18n-context';

export default component$(() => {
  const i18n = useI18n();
  const auth = useAuth();

  const payout = useSignal('');
  const distance = useSignal('');
  const duration = useSignal('');
  const pickupName = useSignal('');
  const pickupAddress = useSignal('');
  const dropoffName = useSignal('');
  const dropoffAddress = useSignal('');

  const selectedVehicleId = useSignal('');
  const vehicles = useSignal<VehicleProfile[]>([]);
  const loading = useSignal(false);
  const status = useSignal('');
  const result = useSignal<Record<string, unknown> | null>(null);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      vehicles.value = [];
      return;
    }

    const unsubscribe = watchVehicles(user.uid, (items) => {
      vehicles.value = items;
      if (!selectedVehicleId.value && items.length > 0) {
        selectedVehicleId.value = items[0].id;
      }
    });

    cleanup(() => {
      unsubscribe();
    });
  });

  return (
    <div class="pl-stack">
      <p class="pl-subtitle">{t(i18n, 'manualEntrySubtitle', 'Or enter the offer details manually.')}</p>

      <div class="pl-row">
        <div class="pl-field" style="flex:1; min-width:210px;">
          <label>{t(i18n, 'offerAmountLabel', 'Payout')}</label>
          <input class="pl-input" value={payout.value} onInput$={(_, el) => (payout.value = el.value)} />
        </div>
        <div class="pl-field" style="flex:1; min-width:210px;">
          <label>{t(i18n, 'distanceKmLabel', 'Distance')}</label>
          <input class="pl-input" value={distance.value} onInput$={(_, el) => (distance.value = el.value)} />
        </div>
        <div class="pl-field" style="flex:1; min-width:210px;">
          <label>{t(i18n, 'durationMinutesLabel', 'Estimated time (minutes)')}</label>
          <input class="pl-input" value={duration.value} onInput$={(_, el) => (duration.value = el.value)} />
        </div>
      </div>

      <div class="pl-row">
        <div class="pl-field" style="flex:1; min-width:260px;">
          <label>{t(i18n, 'pickupNameLabel', 'Pickup name')}</label>
          <input class="pl-input" value={pickupName.value} onInput$={(_, el) => (pickupName.value = el.value)} />
        </div>
        <div class="pl-field" style="flex:1; min-width:260px;">
          <label>{t(i18n, 'dropoffNameLabel', 'Drop-off name')}</label>
          <input class="pl-input" value={dropoffName.value} onInput$={(_, el) => (dropoffName.value = el.value)} />
        </div>
      </div>

      <div class="pl-row">
        <div class="pl-field" style="flex:1; min-width:260px;">
          <label>{t(i18n, 'pickupAddressLabel', 'Pickup address')}</label>
          <input class="pl-input" value={pickupAddress.value} onInput$={(_, el) => (pickupAddress.value = el.value)} />
        </div>
        <div class="pl-field" style="flex:1; min-width:260px;">
          <label>{t(i18n, 'dropoffAddressLabel', 'Drop-off address')}</label>
          <input class="pl-input" value={dropoffAddress.value} onInput$={(_, el) => (dropoffAddress.value = el.value)} />
        </div>
      </div>

      <div class="pl-field">
        <label>{t(i18n, 'vehicleSelectLabel', 'Select vehicle')}</label>
        <select
          class="pl-select"
          value={selectedVehicleId.value}
          onChange$={(_, el) => (selectedVehicleId.value = el.value)}
        >
          <option value="">--</option>
          {vehicles.value.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.name}
            </option>
          ))}
        </select>
      </div>

      <div class="pl-row">
        <button
          class="pl-button pl-button-primary"
          disabled={loading.value}
          onClick$={async () => {
            const user = auth.user.value;
            if (!user) {
              status.value = 'Missing authenticated user.';
              return;
            }
            loading.value = true;
            status.value = '';
            try {
              const payload = await analyzeManualOffer({
                deviceId: getDeviceId(),
                vehicleId: selectedVehicleId.value || undefined,
                source: 'manual',
                offer: {
                  payoutEuro: Number(payout.value || 0),
                  distanceKm: Number(distance.value || 0),
                  durationMinutes: Number(duration.value || 0),
                  pickupName: pickupName.value,
                  pickupAddress: pickupAddress.value,
                  dropoffName: dropoffName.value,
                  dropoffAddress: dropoffAddress.value,
                },
              });
              result.value = payload;
              status.value = 'Offer analyzed successfully.';
            } catch (error) {
              status.value = error instanceof Error ? error.message : String(error);
            } finally {
              loading.value = false;
            }
          }}
        >
          {t(i18n, 'analyzeOfferButton', 'Analyze offer')}
        </button>

        <button
          class="pl-button pl-button-ghost"
          disabled={loading.value || !pickupAddress.value || !dropoffAddress.value}
          onClick$={async () => {
            loading.value = true;
            status.value = '';
            try {
              const response = await verifyOfferRoute({
                pickupAddress: pickupAddress.value,
                dropoffAddress: dropoffAddress.value,
              });
              result.value = response;
              status.value = 'Route verified.';
            } catch (error) {
              status.value = error instanceof Error ? error.message : String(error);
            } finally {
              loading.value = false;
            }
          }}
        >
          Verify route
        </button>

        <label class="pl-button pl-button-ghost" style="display:inline-flex; align-items:center; gap:8px;">
          {t(i18n, 'importScreenshotButton', 'Import screenshot')}
          <input
            type="file"
            accept="image/*"
            style="display:none"
            onChange$={async (_, element) => {
              const file = element.files?.[0];
              if (!file) {
                return;
              }

              loading.value = true;
              status.value = '';
              try {
                const payload = await analyzeScreenshotOffer({
                  deviceId: getDeviceId(),
                  file,
                  vehicleId: selectedVehicleId.value || undefined,
                });
                result.value = payload;
                status.value = 'Screenshot analyzed.';
              } catch (error) {
                status.value = error instanceof Error ? error.message : String(error);
              } finally {
                element.value = '';
                loading.value = false;
              }
            }}
          />
        </label>
      </div>

      <div class={{ 'pl-status': true, 'pl-status-success': status.value.includes('successfully'), 'pl-status-error': !status.value.includes('successfully') && Boolean(status.value) }}>
        {status.value}
      </div>

      {result.value && (
        <pre class="pl-list-item" style="white-space:pre-wrap; overflow:auto;">
          {JSON.stringify(result.value, null, 2)}
        </pre>
      )}
    </div>
  );
});
