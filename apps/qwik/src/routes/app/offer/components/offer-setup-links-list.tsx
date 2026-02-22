import { component$ } from "@builder.io/qwik";
import { formatTemplate, t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";

interface OfferSetupLinksListProps {
  backToHref: string;
  minProfitabilityEuro: number;
  selectedVehicle: VehicleProfile | null;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatEuroPerKm = (value: number): string => `${formatCurrency(value)}/km`;

export const OfferSetupLinksList = component$<OfferSetupLinksListProps>((props) => {
  const i18n = useI18n();
  const encodedBackToHref = encodeURIComponent(props.backToHref);
  const vehicleHref = props.selectedVehicle
    ? `/next/app/settings/vehicles/${encodeURIComponent(props.selectedVehicle.id)}?backTo=${encodedBackToHref}`
    : `/next/app/settings/vehicles/new?backTo=${encodedBackToHref}`;
  const targetHref = `/next/app/offer/target?backTo=${encodedBackToHref}`;
  const billingHref = `/next/app/settings/billing?backTo=${encodedBackToHref}`;

  return (
    <div class="ui-offer-settings-panel-body">
      <a href={vehicleHref} class="ui-offer-settings-link">
        <div class="ui-offer-settings-link-copy">
          <p class="ui-offer-settings-link-title">
            {t(i18n, "vehiclesSectionTitle", "Vehicles")}
          </p>
          <p class="ui-offer-settings-link-subtitle">
            {props.selectedVehicle?.name ??
              t(i18n, "noVehiclesMessage", "Add a vehicle to start analyzing offers.")}
          </p>
        </div>
        <span
          class="material-icons-outlined ui-offer-settings-link-chevron"
          aria-hidden="true"
        >
          chevron_right
        </span>
      </a>

      <a href={targetHref} class="ui-offer-settings-link">
        <div class="ui-offer-settings-link-copy">
          <p class="ui-offer-settings-link-title">
            {t(i18n, "minProfitabilityLabel", "Minimum profit per km")}
          </p>
          <p class="ui-offer-settings-link-subtitle">
            {formatTemplate(
              t(i18n, "offerTargetCurrentValue", "Current target: {value}"),
              { value: formatEuroPerKm(props.minProfitabilityEuro) },
            )}
          </p>
        </div>
        <span
          class="material-icons-outlined ui-offer-settings-link-chevron"
          aria-hidden="true"
        >
          chevron_right
        </span>
      </a>

      <a href={billingHref} class="ui-offer-settings-link">
        <div class="ui-offer-settings-link-copy">
          <p class="ui-offer-settings-link-title">
            {t(i18n, "billingManageTitle", "Manage subscription")}
          </p>
          <p class="ui-offer-settings-link-subtitle">
            {t(
              i18n,
              "offerSubscriptionSettingsHint",
              "Open your current plan and billing options.",
            )}
          </p>
        </div>
        <span
          class="material-icons-outlined ui-offer-settings-link-chevron"
          aria-hidden="true"
        >
          chevron_right
        </span>
      </a>
    </div>
  );
});
