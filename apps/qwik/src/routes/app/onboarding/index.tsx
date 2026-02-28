import { $, component$, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../components/ui/page-loading-skeleton';
import { useAuth } from '../../../lib/auth/auth-context';
import { franceDefaultSources } from '../../../lib/features/profile/profile-form-utils';
import { vehiclePresetSources } from '../../../lib/features/vehicles/vehicle-form-utils';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import { ProfileMonthlyCostsSection } from '../settings/profile/components/profile-monthly-costs-section';
import { ProfileTaxesSection } from '../settings/profile/components/profile-taxes-section';
import { useProfileFormState } from '../settings/profile/profile-form-state';
import { PresetSourcesSection } from '../settings/shared/preset-sources-section';
import { VehicleCostsSection } from '../settings/vehicles/components/vehicle-costs-section';
import { VehicleDetailsSection } from '../settings/vehicles/components/vehicle-details-section';
import { VehicleEnergySection } from '../settings/vehicles/components/vehicle-energy-section';
import { useVehicleEditorState } from '../settings/vehicles/vehicle-editor-state';

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const navigate = useNavigate();
  const currentStep = useSignal(0);
  const transitionDirection = useSignal<'forward' | 'backward'>('forward');
  const touchStartX = useSignal<number | null>(null);
  const touchStartY = useSignal<number | null>(null);

  const onVehicleSaved$ = $(async () => {});
  const vehicleState = useVehicleEditorState({
    mode: 'create',
    onSaved$: onVehicleSaved$,
  });
  const profileState = useProfileFormState();

  const steps = [
    t(i18n, 'vehicleDetailsSectionTitle', 'Vehicle details'),
    t(i18n, 'vehicleEnergySectionTitle', 'Energy & consumption'),
    t(i18n, 'vehicleCostsSectionTitle', 'Maintenance & depreciation'),
    t(i18n, 'costsSection', 'Taxes & contributions'),
    t(i18n, 'monthlyCostsSectionTitle', 'Monthly costs'),
  ];
  const safeStep = Math.min(Math.max(currentStep.value, 0), steps.length - 1);
  const isLastStep = safeStep === steps.length - 1;
  const isBusy = vehicleState.saving.value || profileState.saving.value;
  const activeStatus = safeStep <= 2 ? vehicleState.status.value : profileState.status.value;

  const goToStep$ = $((targetStep: number) => {
    if (isBusy) {
      return;
    }
    const nextStep = Math.min(Math.max(targetStep, 0), steps.length - 1);
    if (nextStep === currentStep.value) {
      return;
    }
    transitionDirection.value = nextStep > currentStep.value ? 'forward' : 'backward';
    currentStep.value = nextStep;
  });

  const goNext$ = $(() => {
    void goToStep$(currentStep.value + 1);
  });

  const goBack$ = $(() => {
    void goToStep$(currentStep.value - 1);
  });

  const onTouchStart$ = $((event: TouchEvent) => {
    if (event.touches.length !== 1) {
      touchStartX.value = null;
      touchStartY.value = null;
      return;
    }
    touchStartX.value = event.touches[0].clientX;
    touchStartY.value = event.touches[0].clientY;
  });

  const onTouchEnd$ = $((event: TouchEvent) => {
    if (isBusy || touchStartX.value === null || touchStartY.value === null) {
      touchStartX.value = null;
      touchStartY.value = null;
      return;
    }
    if (event.changedTouches.length < 1) {
      touchStartX.value = null;
      touchStartY.value = null;
      return;
    }

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.value;
    const deltaY = endY - touchStartY.value;

    touchStartX.value = null;
    touchStartY.value = null;

    if (Math.abs(deltaX) < 52) {
      return;
    }
    if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.15) {
      return;
    }

    if (deltaX < 0) {
      void goToStep$(currentStep.value + 1);
      return;
    }
    void goToStep$(currentStep.value - 1);
  });

  const finish$ = $(async () => {
    if (isBusy) {
      return;
    }
    if (!auth.user.value) {
      return;
    }

    await vehicleState.save$();
    if (vehicleState.status.value) {
      return;
    }

    if (profileState.profile.value) {
      profileState.profile.value = {
        ...profileState.profile.value,
        defaultVehicleId: vehicleState.draft.value.id,
      };
    }

    await profileState.save$();
    if (profileState.status.value) {
      return;
    }

    await navigate('/next/app/offer');
  });

  if (profileState.loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsFormSkeleton fieldCount={8} />
      </div>
    );
  }

  return (
    <div class="ui-onboarding-root">
      <section class="ui-onboarding-screen">
        <div class="ui-onboarding-slide-frame" onTouchStart$={onTouchStart$} onTouchEnd$={onTouchEnd$}>
          <div
            key={`onboarding-slide-${safeStep}`}
            class={{
              'ui-onboarding-slide': true,
              'is-forward': transitionDirection.value === 'forward',
              'is-backward': transitionDirection.value === 'backward',
            }}
          >
            <div class="ui-settings-form-grid ui-onboarding-step-content">
              <h3 class="ui-onboarding-step-title">{steps[safeStep]}</h3>

              {safeStep === 0 ? (
                <VehicleDetailsSection state={vehicleState} showHeading={false} />
              ) : null}
              {safeStep === 1 ? (
                <VehicleEnergySection state={vehicleState} showHeading={false} />
              ) : null}
              {safeStep === 2 ? (
                <VehicleCostsSection state={vehicleState} showHeading={false} />
              ) : null}
              {safeStep === 3 ? (
                <ProfileTaxesSection state={profileState} showHeading={false} />
              ) : null}
              {safeStep === 4 ? (
                <ProfileMonthlyCostsSection state={profileState} showHeading={false} />
              ) : null}
            </div>
          </div>
        </div>

        {activeStatus ? <p class="ui-status ui-status-error">{activeStatus}</p> : null}

        <div class="ui-onboarding-actions">
          {safeStep > 0 ? (
            <button
              type="button"
              class="ui-settings-action-button"
              disabled={isBusy}
              onClick$={goBack$}
            >
              {t(i18n, 'backButtonLabel', 'Back')}
            </button>
          ) : null}
          <button
            type="button"
            class="ui-settings-action-button"
            disabled={isBusy}
            onClick$={isLastStep ? finish$ : goNext$}
          >
            {isBusy
              ? t(i18n, 'loadingLabel', 'Loading...')
              : isLastStep
                ? t(i18n, 'onboardingFinishButton', 'Finish setup')
                : t(i18n, 'nextButtonLabel', 'Next')}
          </button>
        </div>
      </section>

      <div class="ui-onboarding-sources">
        <PresetSourcesSection sources={[...vehiclePresetSources, ...franceDefaultSources]} />
      </div>
    </div>
  );
});
