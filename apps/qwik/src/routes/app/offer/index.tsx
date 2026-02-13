import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { useAuth } from '../../../lib/auth/auth-context';
import { getDeviceId } from '../../../lib/config/device-id';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { OfferFeedback } from './offer-feedback';

type OffersServiceModule = typeof import('../../../lib/features/offers/offers-service');
type VehiclesServiceModule = typeof import('../../../lib/features/vehicles/vehicles-service');

let offersServicePromise: Promise<OffersServiceModule> | null = null;
let vehiclesServicePromise: Promise<VehiclesServiceModule> | null = null;

const loadOffersService = () => {
  if (!offersServicePromise) {
    offersServicePromise = import('../../../lib/features/offers/offers-service');
  }
  return offersServicePromise;
};

const loadVehiclesService = () => {
  if (!vehiclesServicePromise) {
    vehiclesServicePromise = import('../../../lib/features/vehicles/vehicles-service');
  }
  return vehiclesServicePromise;
};

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
  const vehicleSubscriptionRequested = useSignal(false);
  const vehiclesLoading = useSignal(false);
  const vehiclesHydrated = useSignal(false);
  const loading = useSignal(false);
  const status = useSignal('');
  const result = useSignal<Record<string, unknown> | null>(null);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const shouldHydrateVehicles = track(() => vehicleSubscriptionRequested.value);
    if (!user) {
      vehicles.value = [];
      selectedVehicleId.value = '';
      vehiclesLoading.value = false;
      vehiclesHydrated.value = false;
      return;
    }

    if (!shouldHydrateVehicles) {
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    vehiclesLoading.value = true;

    void loadVehiclesService()
      .then(({ watchVehicles }) => {
        if (cancelled) {
          return;
        }

        unsubscribe = watchVehicles(user.uid, (items) => {
          vehicles.value = items;
          vehiclesLoading.value = false;
          vehiclesHydrated.value = true;
          if (!selectedVehicleId.value && items.length > 0) {
            selectedVehicleId.value = items[0].id;
          }
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        vehiclesLoading.value = false;
        status.value = error instanceof Error ? error.message : String(error);
      });

    cleanup(() => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    });
  });

  return (
    <div
      class="ui-stack"
      onPointerDown$={() => {
        vehicleSubscriptionRequested.value = true;
      }}
      onKeyDown$={() => {
        vehicleSubscriptionRequested.value = true;
      }}
    >
      <p class="ui-subtitle">{t(i18n, 'manualEntrySubtitle', 'Or enter the offer details manually.')}</p>

      <div class="ui-row">
        <div class="ui-field" style="flex:1; min-width:210px;">
          <Label for="offer-payout">{t(i18n, 'offerAmountLabel', 'Payout')}</Label>
          <Input id="offer-payout" value={payout.value} onInput$={(_, el) => (payout.value = el.value)} />
        </div>
        <div class="ui-field" style="flex:1; min-width:210px;">
          <Label for="offer-distance">{t(i18n, 'distanceKmLabel', 'Distance')}</Label>
          <Input id="offer-distance" value={distance.value} onInput$={(_, el) => (distance.value = el.value)} />
        </div>
        <div class="ui-field" style="flex:1; min-width:210px;">
          <Label for="offer-duration">{t(i18n, 'durationMinutesLabel', 'Estimated time (minutes)')}</Label>
          <Input id="offer-duration" value={duration.value} onInput$={(_, el) => (duration.value = el.value)} />
        </div>
      </div>

      <div class="ui-row">
        <div class="ui-field" style="flex:1; min-width:260px;">
          <Label for="offer-pickup-name">{t(i18n, 'pickupNameLabel', 'Pickup name')}</Label>
          <Input id="offer-pickup-name" value={pickupName.value} onInput$={(_, el) => (pickupName.value = el.value)} />
        </div>
        <div class="ui-field" style="flex:1; min-width:260px;">
          <Label for="offer-dropoff-name">{t(i18n, 'dropoffNameLabel', 'Drop-off name')}</Label>
          <Input id="offer-dropoff-name" value={dropoffName.value} onInput$={(_, el) => (dropoffName.value = el.value)} />
        </div>
      </div>

      <div class="ui-row">
        <div class="ui-field" style="flex:1; min-width:260px;">
          <Label for="offer-pickup-address">{t(i18n, 'pickupAddressLabel', 'Pickup address')}</Label>
          <Input id="offer-pickup-address" value={pickupAddress.value} onInput$={(_, el) => (pickupAddress.value = el.value)} />
        </div>
        <div class="ui-field" style="flex:1; min-width:260px;">
          <Label for="offer-dropoff-address">{t(i18n, 'dropoffAddressLabel', 'Drop-off address')}</Label>
          <Input id="offer-dropoff-address" value={dropoffAddress.value} onInput$={(_, el) => (dropoffAddress.value = el.value)} />
        </div>
      </div>

      <div class="ui-field">
        <Label for="offer-vehicle">{t(i18n, 'vehicleSelectLabel', 'Select vehicle')}</Label>
        <div class="ui-row">
          <Select
            id="offer-vehicle"
            style="flex:1; min-width:260px;"
            value={selectedVehicleId.value}
            onFocus$={() => {
              vehicleSubscriptionRequested.value = true;
            }}
            onChange$={(_, el) => (selectedVehicleId.value = el.value)}
          >
            <option value="">
              {vehiclesLoading.value
                ? t(i18n, 'loadingLabel', 'Loading...')
                : t(i18n, 'vehicleOptionalPlaceholder', 'No vehicle (optional)')}
            </option>
            {vehicles.value.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </Select>

          {!vehicleSubscriptionRequested.value && (
            <Button
              type="button"
              variant="secondary"
              onClick$={() => {
                vehicleSubscriptionRequested.value = true;
              }}
            >
              {t(i18n, 'loadVehiclesButton', 'Load vehicles')}
            </Button>
          )}
        </div>

        {vehicleSubscriptionRequested.value && !vehiclesHydrated.value && (
          <div class="ui-status">{t(i18n, 'loadingLabel', 'Loading...')}</div>
        )}
      </div>

      <div class="ui-row">
        <Button
          variant="default"
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
              const { analyzeManualOffer } = await loadOffersService();
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
        </Button>

        <Button
          variant="secondary"
          disabled={loading.value || !pickupAddress.value || !dropoffAddress.value}
          onClick$={async () => {
            loading.value = true;
            status.value = '';
            try {
              const { verifyOfferRoute } = await loadOffersService();
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
          {t(i18n, 'verifyRouteButton', 'Verify route')}
        </Button>

        <label
          class="ui-button ui-button-secondary ui-button-md"
          style="display:inline-flex; align-items:center; gap:8px;"
        >
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
                const { analyzeScreenshotOffer } = await loadOffersService();
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

      <OfferFeedback status={status.value} result={result.value} />
    </div>
  );
});
