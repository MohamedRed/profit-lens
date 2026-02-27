import { $, type QRL, type Signal } from '@builder.io/qwik';
import {
  applyVehiclePresetValues,
  isValidFrenchLicensePlate,
  formatFrenchLicensePlate,
  normalizeFrenchLicensePlate,
  resolveEnergyPriceDefault,
  sanitizeLookupValue,
  type VehicleDraft,
} from '../../../../lib/features/vehicles/vehicle-form-utils';
import { lookupVehicleByPlate, lookupVehicleModel, saveVehicle, deleteVehicle } from '../../../../lib/features/vehicles/vehicles-service';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import { t, type I18nStore } from '../../../../lib/i18n/i18n-context';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import { asEnergyType, asFuelType, parseVehicleNumber } from './vehicle-editor-types';

interface VehicleLookupActionsParams {
  i18n: I18nStore;
  profile: Signal<{ useFranceDefaults: boolean } | null>;
  draft: Signal<VehicleDraft>;
  status: Signal<string>;
  useVehiclePresets: Signal<boolean>;
  isApplyingPreset: Signal<boolean>;
  isLookingUpPlate: Signal<boolean>;
  isLookingUpModel: Signal<boolean>;
}

export const createVehicleLookupActions = (
  params: VehicleLookupActionsParams,
): { lookupByPlate$: QRL<() => Promise<void>>; lookupModel$: QRL<() => Promise<void>> } => {
  const lookupByPlate$ = $(async () => {
    if (params.isLookingUpPlate.value) return;
    const rawPlate = params.draft.value.licensePlate.trim();
    if (!rawPlate) return;
    if (!isValidFrenchLicensePlate(rawPlate)) {
      params.status.value = t(params.i18n, 'vehicleLicensePlateInvalid', 'Enter a valid French plate.');
      return;
    }

    const normalized = normalizeFrenchLicensePlate(rawPlate);
    params.draft.value = { ...params.draft.value, licensePlate: formatFrenchLicensePlate(normalized) };
    params.status.value = '';
    params.isLookingUpPlate.value = true;
    try {
      const payload = await lookupVehicleByPlate({ licensePlate: normalized, countryCode: 'FR' });
      if (payload.match !== true) {
        params.status.value = t(params.i18n, 'plateLookupNotFoundMessage', 'No vehicle found for this plate.');
        return;
      }

      let next = { ...params.draft.value };
      let applied = false;
      const brand = sanitizeLookupValue(payload.brand);
      const model = sanitizeLookupValue(payload.model);
      if (brand) {
        next.brand = brand;
        applied = true;
      }
      if (model) {
        next.model = model;
        applied = true;
      }
      const year = typeof payload.registrationYear === 'number' ? payload.registrationYear : null;
      if (year && year > 0) {
        next.registrationYear = String(year);
        applied = true;
      }

      const energy = asEnergyType(payload.energyType);
      const fuel = asFuelType(payload.fuelType);
      if (energy || fuel) {
        applied = true;
      }
      if (energy) {
        next.energyType = energy;
      } else if (fuel) {
        next.energyType = 'fuel';
      }
      next.fuelType = next.energyType === 'fuel' ? fuel ?? (next.fuelType || 'e10') : '';
      if (next.energyType !== 'fuel' || fuel) {
        next.energyPricePerUnit = resolveEnergyPriceDefault(
          next.energyType,
          next.fuelType,
          params.profile.value?.useFranceDefaults ?? true,
        );
      }
      if (next.energyType === 'none') {
        next.energyConsumptionPer100Km = '0';
      }

      if (params.useVehiclePresets.value && applied) {
        params.isApplyingPreset.value = true;
        next = applyVehiclePresetValues(next, params.profile.value?.useFranceDefaults ?? true, {
          setEnergyType: false,
        });
        params.isApplyingPreset.value = false;
      }

      params.draft.value = next;
      params.status.value = applied
        ? t(params.i18n, 'plateLookupAppliedMessage', 'Vehicle details applied.')
        : t(params.i18n, 'plateLookupNotFoundMessage', 'No vehicle found for this plate.');
    } catch {
      params.status.value = t(params.i18n, 'plateLookupFailedMessage', 'Unable to fetch plate data.');
    } finally {
      params.isLookingUpPlate.value = false;
    }
  });

  const lookupModel$ = $(async () => {
    if (params.isLookingUpModel.value) return;
    const brand = params.draft.value.brand.trim();
    const model = params.draft.value.model.trim();
    if (!brand || !model || params.draft.value.energyType === 'none') return;

    params.isLookingUpModel.value = true;
    try {
      const payload = await lookupVehicleModel({
        brand,
        model,
        energyType: params.draft.value.energyType,
      });
      if (payload.match !== true || typeof payload.consumptionPer100Km !== 'number') {
        params.status.value = t(params.i18n, 'modelLookupNotFoundMessage', 'No match found for this brand/model.');
        return;
      }
      params.draft.value = {
        ...params.draft.value,
        energyConsumptionPer100Km: payload.consumptionPer100Km.toFixed(2),
      };
      params.status.value = t(params.i18n, 'modelLookupAppliedMessage', 'Model consumption applied.');
    } catch {
      params.status.value = t(params.i18n, 'modelLookupFailedMessage', 'Unable to fetch model data.');
    } finally {
      params.isLookingUpModel.value = false;
    }
  });

  return { lookupByPlate$, lookupModel$ };
};

interface VehicleSubmitActionsParams {
  i18n: I18nStore;
  user: Signal<{ uid: string } | null>;
  navigateTo: QRL<(path: string) => Promise<void>>;
  draft: Signal<VehicleDraft>;
  status: Signal<string>;
  saving: Signal<boolean>;
  deleting: Signal<boolean>;
  existingVehicle: Signal<VehicleProfile | null>;
  onSaved$?: QRL<() => void | Promise<void>>;
}

export const createVehicleSubmitActions = (
  params: VehicleSubmitActionsParams,
): { save$: QRL<() => Promise<void>>; delete$: QRL<() => Promise<void>> } => {
  const save$ = $(async () => {
    const user = params.user.value;
    if (!user) return;

    const brand = params.draft.value.brand.trim();
    const model = params.draft.value.model.trim();
    if (!brand || !model) {
      params.status.value = t(params.i18n, 'requiredFieldError', 'This field is required.');
      return;
    }

    const yearRaw = params.draft.value.registrationYear.trim();
    if (yearRaw) {
      const year = Number(yearRaw);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1980 || year > currentYear) {
        params.status.value = t(params.i18n, 'vehicleRegistrationYearInvalid', 'Enter a valid year.');
        return;
      }
    }
    if (
      (params.draft.value.type === 'car' || params.draft.value.type === 'scooter') &&
      params.draft.value.licensePlate.trim() &&
      !isValidFrenchLicensePlate(params.draft.value.licensePlate)
    ) {
      params.status.value = t(params.i18n, 'vehicleLicensePlateInvalid', 'Enter a valid French plate.');
      return;
    }

    const energyConsumptionPer100Km = parseVehicleNumber(params.draft.value.energyConsumptionPer100Km);
    const energyPricePerUnit = parseVehicleNumber(params.draft.value.energyPricePerUnit);
    const maintenancePerKm = parseVehicleNumber(params.draft.value.maintenancePerKm);
    const depreciationPerKm = parseVehicleNumber(params.draft.value.depreciationPerKm);
    if (
      energyConsumptionPer100Km == null ||
      energyPricePerUnit == null ||
      maintenancePerKm == null ||
      depreciationPerKm == null
    ) {
      params.status.value = t(params.i18n, 'requiredFieldError', 'This field is required.');
      return;
    }

    params.saving.value = true;
    params.status.value = '';
    try {
      await saveVehicle(user.uid, {
        id: params.draft.value.id,
        name: `${brand} ${model}`,
        licensePlate: params.draft.value.licensePlate.trim()
          ? normalizeFrenchLicensePlate(params.draft.value.licensePlate)
          : null,
        brand,
        model,
        registrationYear: yearRaw ? Number(yearRaw) : null,
        type: params.draft.value.type,
        energyType: params.draft.value.energyType,
        fuelType: params.draft.value.energyType === 'fuel' ? params.draft.value.fuelType || 'e10' : null,
        energyConsumptionPer100Km,
        energyPricePerUnit,
        maintenancePerKm,
        depreciationPerKm,
      });
      if (params.onSaved$) {
        await params.onSaved$();
      } else {
        await params.navigateTo('/next/app/settings');
      }
    } catch (error) {
      params.status.value = resolveUserFacingErrorMessage(params.i18n, error, 'vehicle');
    } finally {
      params.saving.value = false;
    }
  });

  const delete$ = $(async () => {
    const user = params.user.value;
    if (!user || !params.existingVehicle.value) return;
    const confirmed = window.confirm(
      t(params.i18n, 'deleteVehicleMessage', 'This will remove the vehicle and its saved settings.'),
    );
    if (!confirmed) return;

    params.deleting.value = true;
    params.status.value = '';
    try {
      await deleteVehicle(user.uid, params.existingVehicle.value);
      await params.navigateTo('/next/app/settings');
    } catch (error) {
      params.status.value = resolveUserFacingErrorMessage(params.i18n, error, 'vehicle');
    } finally {
      params.deleting.value = false;
    }
  });

  return { save$, delete$ };
};
