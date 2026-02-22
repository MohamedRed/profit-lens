import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useAuth } from "../../../../lib/auth/auth-context";
import { watchUserProfile } from "../../../../lib/features/profile/profile-service";
import { watchVehicles } from "../../../../lib/features/vehicles/vehicles-service";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { UserProfile } from "../../../../lib/types/profile";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { OfferSetupLinksList } from "../components/offer-setup-links-list";

const resolveSelectedVehicle = (
  vehicles: VehicleProfile[],
  defaultVehicleId: string | null,
): VehicleProfile | null => {
  if (defaultVehicleId) {
    const defaultVehicle = vehicles.find((vehicle) => vehicle.id === defaultVehicleId);
    if (defaultVehicle) {
      return defaultVehicle;
    }
  }
  return vehicles[0] ?? null;
};

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();

  const loading = useSignal(true);
  const profile = useSignal<UserProfile | null>(null);
  const vehicles = useSignal<VehicleProfile[]>([]);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      loading.value = false;
      profile.value = null;
      vehicles.value = [];
      return;
    }

    loading.value = true;
    let profileReady = false;
    let vehiclesReady = false;
    const markReady = () => {
      if (profileReady && vehiclesReady) {
        loading.value = false;
      }
    };

    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      profileReady = true;
      markReady();
    });

    const unsubscribeVehicles = watchVehicles(user.uid, (nextVehicles) => {
      vehicles.value = nextVehicles;
      vehiclesReady = true;
      markReady();
    }, () => {
      vehicles.value = [];
      vehiclesReady = true;
      markReady();
    });

    cleanup(() => {
      unsubscribeProfile();
      unsubscribeVehicles();
    });
  });

  if (loading.value) {
    return (
      <div class="ui-settings-detail-root">
        <section class="ui-settings-detail-card">
          <p class="ui-settings-detail-subtitle">{t(i18n, "loadingLabel", "Loading...")}</p>
        </section>
      </div>
    );
  }

  const selectedVehicle = resolveSelectedVehicle(
    vehicles.value,
    profile.value?.defaultVehicleId ?? null,
  );
  const minProfitabilityEuro = profile.value?.minProfitabilityEuro ?? 2;

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">
          {t(i18n, "offerSetupTitle", "Offer settings")}
        </h2>
        <p class="ui-settings-detail-subtitle">
          {t(
            i18n,
            "offerSetupSubtitle",
            "Manage your vehicle, minimum target, and subscription options.",
          )}
        </p>

        <OfferSetupLinksList
          backToHref="/next/app/offer/setup"
          minProfitabilityEuro={minProfitabilityEuro}
          selectedVehicle={selectedVehicle}
        />
      </section>
    </div>
  );
});
