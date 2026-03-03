import { component$, type QRL } from "@builder.io/qwik";
import { Button } from "../../../../components/ui/button";
import { t, useI18n } from "../../../../lib/i18n/i18n-context";
import { formatCurrencyPerUnit } from "../../../../lib/i18n/number-format";
import type { VehicleProfile } from "../../../../lib/types/vehicle";

interface OfferSetupSummaryProps {
  minProfitabilityEuro: number;
  onEdit$: QRL<() => void>;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
}

export const OfferSetupSummary = component$<OfferSetupSummaryProps>((props) => {
  const i18n = useI18n();
  const locale = i18n.locale.value;
  const distanceUnitKm = t(i18n, "distanceUnitKm", "km");

  const selectedVehicleName =
    props.vehicles.find((vehicle) => vehicle.id === props.selectedVehicleId)?.name ??
    t(i18n, "loadingLabel", "Loading...");

  return (
    <section class="ui-offer-setup-summary" aria-label={t(i18n, "editOfferDetailsButton", "Edit details")}>
      <div class="ui-offer-setup-summary-chips">
        <span class="ui-offer-setup-chip">{selectedVehicleName}</span>
        <span class="ui-offer-setup-chip">
          {formatCurrencyPerUnit(locale, props.minProfitabilityEuro, distanceUnitKm)}
        </span>
      </div>
      <Button variant="ghost" type="button" class="ui-offer-setup-summary-edit" onClick$={props.onEdit$}>
        {t(i18n, "editOfferDetailsButton", "Edit details")}
      </Button>
    </section>
  );
});
