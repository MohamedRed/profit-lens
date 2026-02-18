import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import {
  LoadingSkeletonAnnouncer,
  SettingsListSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { useAuth } from '../../../../lib/auth/auth-context';
import { watchUserProfile } from '../../../../lib/features/profile/profile-service';
import { watchVehicles } from '../../../../lib/features/vehicles/vehicles-service';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../lib/types/vehicle';

const vehicleTypeLabel = (
  i18n: ReturnType<typeof useI18n>,
  type: string,
): string => {
  if (type === 'bike') {
    return t(i18n, 'vehicleTypeBike', 'Bike');
  }
  if (type === 'ebike') {
    return t(i18n, 'vehicleTypeEBike', 'E-bike');
  }
  if (type === 'scooter') {
    return t(i18n, 'vehicleTypeScooter', 'Scooter');
  }
  return t(i18n, 'vehicleTypeCar', 'Car');
};

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();

  const vehicles = useSignal<VehicleProfile[]>([]);
  const profile = useSignal<UserProfile | null>(null);
  const loading = useSignal(true);
  const loadError = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      loading.value = false;
      vehicles.value = [];
      profile.value = null;
      loadError.value = '';
      return;
    }

    loading.value = true;
    loadError.value = '';
    const unsubscribeVehicles = watchVehicles(user.uid, (items) => {
      vehicles.value = items;
      loading.value = false;
    }, (error) => {
      loadError.value = error instanceof Error ? error.message : t(i18n, 'vehicleLoadFailedMessage', 'Unable to load vehicles.');
      loading.value = false;
    });
    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
    });

    cleanup(() => {
      unsubscribeVehicles();
      unsubscribeProfile();
    });
  });

  if (loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsListSkeleton itemCount={3} showHeaderAction={true} />
      </div>
    );
  }

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        {loadError.value ? <p class="ui-status ui-status-error">{loadError.value}</p> : null}
        <div class="ui-settings-row">
          <h2 class="ui-settings-detail-title">{t(i18n, 'vehiclesSectionTitle', 'Vehicles')}</h2>
          <Link class="ui-settings-link-button" href="/next/app/settings/vehicles/new">
            <span class="material-icons-outlined" aria-hidden="true">
              add
            </span>
            <span>{t(i18n, 'addVehicleTitle', 'Add vehicle')}</span>
          </Link>
        </div>

        {vehicles.value.length === 0 ? (
          <p class="ui-settings-detail-subtitle">{t(i18n, 'noVehiclesMessage', 'No vehicles found.')}</p>
        ) : (
          <ul class="ui-settings-vehicle-list">
            {vehicles.value.map((vehicle) => {
              const isDefault = profile.value?.defaultVehicleId === vehicle.id;
              return (
                <li key={vehicle.id} class="ui-settings-vehicle-item">
                  <div class="ui-settings-row">
                    <p class="ui-settings-row-title">{vehicle.name}</p>
                    {isDefault ? (
                      <span class="ui-settings-row-subtitle">{t(i18n, 'vehicleSelectLabel', 'Select vehicle')}</span>
                    ) : null}
                  </div>
                  <p class="ui-settings-row-subtitle">{vehicleTypeLabel(i18n, vehicle.type)}</p>
                  <Link
                    class="ui-settings-link-button"
                    href={`/next/app/settings/vehicles/edit?vehicleId=${encodeURIComponent(vehicle.id)}`}
                  >
                    {t(i18n, 'editVehicleButton', 'Edit vehicle')}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
});
