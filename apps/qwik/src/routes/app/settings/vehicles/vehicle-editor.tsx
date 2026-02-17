import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { Select } from '../../../../components/ui/select';
import { useAuth } from '../../../../lib/auth/auth-context';
import { deleteVehicle, saveVehicle, watchVehicles } from '../../../../lib/features/vehicles/vehicles-service';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { VehicleProfile } from '../../../../lib/types/vehicle';

type EditorMode = 'create' | 'edit';

interface VehicleEditorProps {
  mode: EditorMode;
  vehicleId?: string | null;
}

interface VehicleDraft {
  id: string;
  name: string;
  licensePlate: string;
  brand: string;
  model: string;
  registrationYear: string;
  type: string;
  energyType: string;
  fuelType: string;
  energyConsumptionPer100Km: string;
  energyPricePerUnit: string;
  maintenancePerKm: string;
  depreciationPerKm: string;
}

const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const createVehicleDraft = (): VehicleDraft => {
  return {
    id: createId(),
    name: '',
    licensePlate: '',
    brand: '',
    model: '',
    registrationYear: '',
    type: 'car',
    energyType: 'fuel',
    fuelType: 'gazole',
    energyConsumptionPer100Km: '0',
    energyPricePerUnit: '0',
    maintenancePerKm: '0',
    depreciationPerKm: '0',
  };
};

const vehicleToDraft = (vehicle: VehicleProfile): VehicleDraft => {
  return {
    id: vehicle.id,
    name: vehicle.name,
    licensePlate: vehicle.licensePlate ?? '',
    brand: vehicle.brand ?? '',
    model: vehicle.model ?? '',
    registrationYear: vehicle.registrationYear == null ? '' : String(vehicle.registrationYear),
    type: vehicle.type,
    energyType: vehicle.energyType,
    fuelType: vehicle.fuelType ?? '',
    energyConsumptionPer100Km: String(vehicle.energyConsumptionPer100Km),
    energyPricePerUnit: String(vehicle.energyPricePerUnit),
    maintenancePerKm: String(vehicle.maintenancePerKm),
    depreciationPerKm: String(vehicle.depreciationPerKm),
  };
};

const parseNumber = (raw: string): number | null => {
  const parsed = Number(raw.trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const draftToVehicle = (draft: VehicleDraft): VehicleProfile | null => {
  if (!draft.name.trim()) {
    return null;
  }
  const energyConsumptionPer100Km = parseNumber(draft.energyConsumptionPer100Km);
  const energyPricePerUnit = parseNumber(draft.energyPricePerUnit);
  const maintenancePerKm = parseNumber(draft.maintenancePerKm);
  const depreciationPerKm = parseNumber(draft.depreciationPerKm);
  if (
    energyConsumptionPer100Km == null ||
    energyPricePerUnit == null ||
    maintenancePerKm == null ||
    depreciationPerKm == null
  ) {
    return null;
  }

  const registrationYear = draft.registrationYear.trim() ? parseNumber(draft.registrationYear) : null;
  if (draft.registrationYear.trim() && registrationYear == null) {
    return null;
  }

  return {
    id: draft.id,
    name: draft.name.trim(),
    licensePlate: draft.licensePlate.trim() || null,
    brand: draft.brand.trim() || null,
    model: draft.model.trim() || null,
    registrationYear: registrationYear == null ? null : Math.round(registrationYear),
    type: draft.type,
    energyType: draft.energyType,
    fuelType: draft.energyType === 'fuel' ? draft.fuelType || null : null,
    energyConsumptionPer100Km,
    energyPricePerUnit,
    maintenancePerKm,
    depreciationPerKm,
  };
};

export const VehicleEditor = component$<VehicleEditorProps>((props) => {
  const auth = useAuth();
  const i18n = useI18n();
  const navigate = useNavigate();

  const loading = useSignal(true);
  const saving = useSignal(false);
  const deleting = useSignal(false);
  const status = useSignal('');

  const draft = useSignal<VehicleDraft>(createVehicleDraft());
  const existingVehicle = useSignal<VehicleProfile | null>(null);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const vehicleId = track(() => props.vehicleId);

    if (!user) {
      loading.value = false;
      existingVehicle.value = null;
      return;
    }

    if (props.mode === 'create') {
      loading.value = false;
      existingVehicle.value = null;
      return;
    }

    if (!vehicleId) {
      loading.value = false;
      existingVehicle.value = null;
      return;
    }

    loading.value = true;
    const unsubscribe = watchVehicles(user.uid, (items) => {
      const found = items.find((item) => item.id === vehicleId) ?? null;
      existingVehicle.value = found;
      if (found) {
        draft.value = vehicleToDraft(found);
      }
      loading.value = false;
    });
    cleanup(() => {
      unsubscribe();
    });
  });

  const save$ = $(async () => {
    const user = auth.user.value;
    if (!user) {
      return;
    }
    const nextVehicle = draftToVehicle(draft.value);
    if (!nextVehicle) {
      status.value = t(i18n, 'vehicleSaveFailedMessage', 'Unable to save vehicle.');
      return;
    }

    saving.value = true;
    status.value = '';
    try {
      await saveVehicle(user.uid, nextVehicle);
      await navigate('/next/app/settings/vehicles');
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'vehicle');
    } finally {
      saving.value = false;
    }
  });

  const delete$ = $(async () => {
    const user = auth.user.value;
    const currentVehicle = existingVehicle.value;
    if (!user || !currentVehicle) {
      return;
    }
    const confirmed = window.confirm(
      t(i18n, 'deleteVehicleMessage', 'This will remove the vehicle and its saved settings. You can add it again later.'),
    );
    if (!confirmed) {
      return;
    }

    deleting.value = true;
    status.value = '';
    try {
      await deleteVehicle(user.uid, currentVehicle);
      await navigate('/next/app/settings/vehicles');
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'vehicle');
    } finally {
      deleting.value = false;
    }
  });

  const typeOptions = [
    { value: 'bike', label: t(i18n, 'vehicleTypeBike', 'Bike') },
    { value: 'ebike', label: t(i18n, 'vehicleTypeEBike', 'E-bike') },
    { value: 'scooter', label: t(i18n, 'vehicleTypeScooter', 'Scooter') },
    { value: 'car', label: t(i18n, 'vehicleTypeCar', 'Car') },
  ];

  const energyOptions = [
    { value: 'none', label: t(i18n, 'energyTypeNone', 'None') },
    { value: 'electric', label: t(i18n, 'energyTypeElectric', 'Electric') },
    { value: 'fuel', label: t(i18n, 'energyTypeFuel', 'Fuel') },
  ];

  const fuelOptions = [
    { value: 'e10', label: t(i18n, 'fuelTypeE10', 'E10') },
    { value: 'sp95', label: t(i18n, 'fuelTypeSP95', 'SP95') },
    { value: 'sp98', label: t(i18n, 'fuelTypeSP98', 'SP98') },
    { value: 'gazole', label: t(i18n, 'fuelTypeGazole', 'Diesel') },
    { value: 'e85', label: t(i18n, 'fuelTypeE85', 'E85') },
    { value: 'gplc', label: t(i18n, 'fuelTypeGPLc', 'LPG') },
  ];

  const title =
    props.mode === 'create'
      ? t(i18n, 'addVehicleTitle', 'Add vehicle')
      : t(i18n, 'editVehicleTitle', 'Edit vehicle');

  const missingTarget = props.mode === 'edit' && !props.vehicleId;
  const notFound = props.mode === 'edit' && !loading.value && !existingVehicle.value;

  if (missingTarget) {
    return <p class="ui-settings-detail-subtitle">{t(i18n, 'vehicleSaveFailedMessage', 'Unable to save vehicle.')}</p>;
  }

  if (loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsFormSkeleton fieldCount={8} />
      </div>
    );
  }

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">{title}</h2>
        {notFound ? (
          <p class="ui-settings-detail-subtitle">{t(i18n, 'vehicleDeleteFailedMessage', 'Unable to delete vehicle.')}</p>
        ) : null}

        {!notFound ? (
          <div class="ui-settings-form-grid">
            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-name">
                Name
              </label>
              <input
                id="vehicle-name"
                class="ui-input"
                value={draft.value.name}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, name: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-type">
                {t(i18n, 'vehicleTypeLabel', 'Vehicle type')}
              </label>
              <Select
                id="vehicle-type"
                value={draft.value.type}
                options={typeOptions}
                onChange$={(value) => {
                  draft.value = { ...draft.value, type: value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-energy">
                {t(i18n, 'energyTypeLabel', 'Energy type')}
              </label>
              <Select
                id="vehicle-energy"
                value={draft.value.energyType}
                options={energyOptions}
                onChange$={(value) => {
                  draft.value = { ...draft.value, energyType: value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-fuel">
                {t(i18n, 'fuelTypeLabel', 'Fuel type')}
              </label>
              <Select
                id="vehicle-fuel"
                disabled={draft.value.energyType !== 'fuel'}
                value={draft.value.fuelType || 'gazole'}
                options={fuelOptions}
                onChange$={(value) => {
                  draft.value = { ...draft.value, fuelType: value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-brand">
                {t(i18n, 'vehicleBrandLabel', 'Brand')}
              </label>
              <input
                id="vehicle-brand"
                class="ui-input"
                value={draft.value.brand}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, brand: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-model">
                {t(i18n, 'vehicleModelLabel', 'Model')}
              </label>
              <input
                id="vehicle-model"
                class="ui-input"
                value={draft.value.model}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, model: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-plate">
                {t(i18n, 'vehicleLicensePlateLabel', 'License plate')}
              </label>
              <input
                id="vehicle-plate"
                class="ui-input"
                value={draft.value.licensePlate}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, licensePlate: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-year">
                {t(i18n, 'vehicleRegistrationYearLabel', 'Registration year')}
              </label>
              <input
                id="vehicle-year"
                class="ui-input"
                type="number"
                step="1"
                value={draft.value.registrationYear}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, registrationYear: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-consumption">
                {t(i18n, 'consumptionLabel', 'Consumption per 100 km')}
              </label>
              <input
                id="vehicle-consumption"
                class="ui-input"
                type="number"
                step="0.01"
                value={draft.value.energyConsumptionPer100Km}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, energyConsumptionPer100Km: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-energy-price">
                {t(i18n, 'energyPriceLabel', 'Energy price per unit')}
              </label>
              <input
                id="vehicle-energy-price"
                class="ui-input"
                type="number"
                step="0.01"
                value={draft.value.energyPricePerUnit}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, energyPricePerUnit: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-maintenance">
                {t(i18n, 'maintenanceLabel', 'Maintenance per km')}
              </label>
              <input
                id="vehicle-maintenance"
                class="ui-input"
                type="number"
                step="0.0001"
                value={draft.value.maintenancePerKm}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, maintenancePerKm: element.value };
                }}
              />
            </div>

            <div class="ui-settings-field">
              <label class="ui-label" for="vehicle-depreciation">
                {t(i18n, 'depreciationLabel', 'Depreciation per km')}
              </label>
              <input
                id="vehicle-depreciation"
                class="ui-input"
                type="number"
                step="0.0001"
                value={draft.value.depreciationPerKm}
                onInput$={(_, element) => {
                  draft.value = { ...draft.value, depreciationPerKm: element.value };
                }}
              />
            </div>

            <div class="ui-settings-actions">
              <button type="button" class="ui-settings-action-button" disabled={saving.value} onClick$={save$}>
                {saving.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'saveVehicleButton', 'Save vehicle')}
              </button>
              {props.mode === 'edit' ? (
                <button
                  type="button"
                  class="ui-settings-action-button"
                  disabled={deleting.value}
                  onClick$={delete$}
                >
                  {deleting.value
                    ? t(i18n, 'loadingLabel', 'Loading...')
                    : t(i18n, 'deleteVehicleAction', 'Delete vehicle')}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
    </div>
  );
});
