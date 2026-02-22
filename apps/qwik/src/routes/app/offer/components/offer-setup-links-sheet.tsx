import { component$ } from "@builder.io/qwik";
import { formatTemplate, t, useI18n } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";

interface OfferSetupLinksSheetProps {
  minProfitabilityEuro: number;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
};

const formatEuroPerKm = (value: number): string => `${formatCurrency(value)}/km`;

const encodeBackTarget = (href: string): string => encodeURIComponent(href);

export const OfferSetupLinksSheet = component$<OfferSetupLinksSheetProps>(
  (props) => {
    const i18n = useI18n();
    const backTo = encodeBackTarget("/next/app/offer/");
    const selectedVehicle =
      props.vehicles.find((vehicle) => vehicle.id === props.selectedVehicleId) ??
      null;
    const vehicleHref = selectedVehicle
      ? `/next/app/settings/vehicles/${encodeURIComponent(selectedVehicle.id)}?backTo=${backTo}`
      : `/next/app/settings/vehicles/new?backTo=${backTo}`;

    return (
      <div id="offer-setup-sheet" class="ui-offer-settings-sheet-root">
        <a
          href="#"
          class="ui-offer-settings-sheet-backdrop"
          aria-label={t(i18n, "closeLabel", "Close")}
        />

        <section
          class="ui-offer-settings-panel"
          role="dialog"
          aria-modal="true"
          aria-label={t(i18n, "offerSetupTitle", "Offer settings")}
        >
          <header class="ui-offer-settings-panel-header">
            <h3 class="ui-offer-settings-panel-title">
              {t(i18n, "offerSetupTitle", "Offer settings")}
            </h3>
            <a
              href="#"
              class="ui-offer-settings-panel-close"
              aria-label={t(i18n, "closeLabel", "Close")}
            >
              <span class="material-icons-outlined" aria-hidden="true">
                close
              </span>
            </a>
          </header>

          <div class="ui-offer-settings-panel-body">
            <a href={vehicleHref} class="ui-offer-settings-link">
              <div class="ui-offer-settings-link-copy">
                <p class="ui-offer-settings-link-title">
                  {t(i18n, "vehiclesSectionTitle", "Vehicles")}
                </p>
                <p class="ui-offer-settings-link-subtitle">
                  {selectedVehicle?.name ??
                    t(
                      i18n,
                      "noVehiclesMessage",
                      "Add a vehicle to start analyzing offers.",
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

            <a href="/next/app/offer/target" class="ui-offer-settings-link">
              <div class="ui-offer-settings-link-copy">
                <p class="ui-offer-settings-link-title">
                  {t(i18n, "minProfitabilityLabel", "Minimum profit per km")}
                </p>
                <p class="ui-offer-settings-link-subtitle">
                  {formatTemplate(
                    t(
                      i18n,
                      "offerTargetCurrentValue",
                      "Current target: {value}",
                    ),
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

            <a href="/next/app/settings/billing" class="ui-offer-settings-link">
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
        </section>
      </div>
    );
  },
);
