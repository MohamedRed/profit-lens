import { $, useSignal, useVisibleTask$, type QRL, type Signal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../../../lib/auth/auth-context';
import { watchUserProfile } from '../../../../lib/features/profile/profile-service';
import { fetchVehicleById } from '../../../../lib/features/vehicles/vehicles-service';
import {
  applyVehiclePresetValues,
  defaultEnergyTypeForVehicle,
  defaultFuelTypeForVehicle,
  resolveEnergyPriceDefault,
  type VehicleDraft,
} from '../../../../lib/features/vehicles/vehicle-form-utils';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import {
  asEnergyType,
  asFuelType,
  asVehicleType,
  createVehicleDraft,
  vehicleToDraft,
  type VehicleEditorProps,
} from './vehicle-editor-types';
import { createVehicleLookupActions, createVehicleSubmitActions } from './vehicle-editor-actions';

export interface VehicleEditorState {
  loading: Signal<boolean>;
  saving: Signal<boolean>;
  deleting: Signal<boolean>;
  status: Signal<string>;
  isLookingUpPlate: Signal<boolean>;
  isLookingUpModel: Signal<boolean>;
  isApplyingPreset: Signal<boolean>;
  draft: Signal<VehicleDraft>;
  existingVehicle: Signal<VehicleProfile | null>;
  profile: Signal<UserProfile | null>;
  useVehiclePresets: Signal<boolean>;
  applyVehicleType$: QRL<(nextTypeRaw: string) => void>;
  applyEnergyType$: QRL<(nextEnergyRaw: string) => void>;
  applyFuelType$: QRL<(nextFuelRaw: string) => void>;
  togglePresets$: QRL<(enabled: boolean) => void>;
  lookupByPlate$: QRL<() => Promise<void>>;
  lookupModel$: QRL<() => Promise<void>>;
  save$: QRL<() => Promise<void>>;
  delete$: QRL<() => Promise<void>>;
}

export const useVehicleEditorState = (props: VehicleEditorProps): VehicleEditorState => {
  const auth = useAuth();
  const i18n = useI18n();
  const navigate = useNavigate();

  const loading = useSignal(props.mode === 'edit');
  const saving = useSignal(false);
  const deleting = useSignal(false);
  const status = useSignal('');
  const isLookingUpPlate = useSignal(false);
  const isLookingUpModel = useSignal(false);
  const isApplyingPreset = useSignal(false);

  const draft = useSignal<VehicleDraft>(createVehicleDraft());
  const existingVehicle = useSignal<VehicleProfile | null>(null);
  const profile = useSignal<UserProfile | null>(null);
  const useVehiclePresets = useSignal(false);
  const createDraftInitialized = useSignal(false);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const vehicleId = track(() => props.vehicleId);
    if (!user) {
      loading.value = false;
      profile.value = null;
      existingVehicle.value = null;
      return;
    }

    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      if (props.mode !== 'create' || createDraftInitialized.value) {
        return;
      }
      useVehiclePresets.value = nextProfile.useFranceDefaults;
      draft.value = useVehiclePresets.value
        ? applyVehiclePresetValues(createVehicleDraft(), nextProfile.useFranceDefaults, {
            setEnergyType: true,
          })
        : {
            ...createVehicleDraft(),
            energyPricePerUnit: resolveEnergyPriceDefault('fuel', 'e10', nextProfile.useFranceDefaults),
          };
      createDraftInitialized.value = true;
      loading.value = false;
    });

    let cancelled = false;
    if (props.mode === 'edit' && vehicleId) {
      loading.value = true;
      void (async () => {
        try {
          const found = await fetchVehicleById(user.uid, vehicleId);
          if (cancelled) {
            return;
          }
          existingVehicle.value = found;
          if (found) {
            draft.value = vehicleToDraft(found);
            useVehiclePresets.value = false;
          } else {
            status.value = t(i18n, 'vehicleLoadFailedMessage', 'Unable to load vehicle.');
          }
        } catch (error) {
          if (!cancelled) {
            status.value = error instanceof Error
              ? error.message
              : t(i18n, 'vehicleLoadFailedMessage', 'Unable to load vehicle.');
          }
        } finally {
          if (!cancelled) {
            loading.value = false;
          }
        }
      })();
    } else if (props.mode === 'edit') {
      loading.value = false;
      existingVehicle.value = null;
    }

    cleanup(() => {
      unsubscribeProfile();
      cancelled = true;
    });
  });

  const applyVehicleType$ = $((nextTypeRaw: string) => {
    const useFranceDefaults = profile.value?.useFranceDefaults ?? true;
    const next = { ...draft.value, type: asVehicleType(nextTypeRaw) };
    if (useVehiclePresets.value) {
      isApplyingPreset.value = true;
      draft.value = applyVehiclePresetValues(next, useFranceDefaults, { setEnergyType: true });
      isApplyingPreset.value = false;
      return;
    }
    const defaultEnergyType = defaultEnergyTypeForVehicle(next.type);
    if (next.type === 'bike' || next.type === 'ebike' || next.energyType === 'none') {
      next.energyType = defaultEnergyType;
      next.fuelType = defaultFuelTypeForVehicle(next.type, next.energyType);
      next.energyPricePerUnit = resolveEnergyPriceDefault(next.energyType, next.fuelType, useFranceDefaults);
      if (next.energyType === 'none') {
        next.energyConsumptionPer100Km = '0';
        next.energyPricePerUnit = '0';
      }
    } else if (next.energyType === 'fuel' && !next.fuelType) {
      next.fuelType = defaultFuelTypeForVehicle(next.type, next.energyType);
      next.energyPricePerUnit = resolveEnergyPriceDefault(next.energyType, next.fuelType, useFranceDefaults);
    }
    draft.value = next;
  });

  const applyEnergyType$ = $((nextEnergyRaw: string) => {
    const useFranceDefaults = profile.value?.useFranceDefaults ?? true;
    let next: VehicleDraft = { ...draft.value, energyType: asEnergyType(nextEnergyRaw) ?? 'fuel' };
    next.fuelType = next.energyType === 'fuel' ? next.fuelType || 'e10' : '';
    next.energyPricePerUnit = resolveEnergyPriceDefault(next.energyType, next.fuelType, useFranceDefaults);
    if (next.energyType === 'none') {
      next.energyConsumptionPer100Km = '0';
      next.energyPricePerUnit = '0';
    }
    if (useVehiclePresets.value) {
      isApplyingPreset.value = true;
      next = applyVehiclePresetValues(next, useFranceDefaults, { setEnergyType: false });
      isApplyingPreset.value = false;
    }
    draft.value = next;
  });

  const applyFuelType$ = $((nextFuelRaw: string) => {
    const useFranceDefaults = profile.value?.useFranceDefaults ?? true;
    let next: VehicleDraft = { ...draft.value, fuelType: asFuelType(nextFuelRaw) ?? '' };
    next.energyPricePerUnit = resolveEnergyPriceDefault(next.energyType, next.fuelType, useFranceDefaults);
    if (useVehiclePresets.value) {
      isApplyingPreset.value = true;
      next = applyVehiclePresetValues(next, useFranceDefaults, { setEnergyType: false });
      isApplyingPreset.value = false;
    }
    draft.value = next;
  });

  const togglePresets$ = $((enabled: boolean) => {
    const useFranceDefaults = profile.value?.useFranceDefaults ?? true;
    useVehiclePresets.value = enabled;
    if (!enabled) {
      return;
    }
    isApplyingPreset.value = true;
    draft.value = applyVehiclePresetValues(draft.value, useFranceDefaults, { setEnergyType: true });
    isApplyingPreset.value = false;
  });

  const { lookupByPlate$, lookupModel$ } = createVehicleLookupActions({
    i18n,
    profile,
    draft,
    status,
    useVehiclePresets,
    isApplyingPreset,
    isLookingUpPlate,
    isLookingUpModel,
  });

  const { save$, delete$ } = createVehicleSubmitActions({
    i18n,
    user: auth.user,
    navigateTo: navigate,
    draft,
    status,
    saving,
    deleting,
    existingVehicle,
  });

  return {
    loading,
    saving,
    deleting,
    status,
    isLookingUpPlate,
    isLookingUpModel,
    isApplyingPreset,
    draft,
    existingVehicle,
    profile,
    useVehiclePresets,
    applyVehicleType$,
    applyEnergyType$,
    applyFuelType$,
    togglePresets$,
    lookupByPlate$,
    lookupModel$,
    save$,
    delete$,
  };
};
