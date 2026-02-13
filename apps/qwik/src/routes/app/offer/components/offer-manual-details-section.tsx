import { component$, type QRL, type Signal } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { OfferSectionCard } from './offer-section-card';

interface OfferManualDetailsSectionProps {
  distance: Signal<string>;
  dropoffAddress: Signal<string>;
  dropoffName: Signal<string>;
  duration: Signal<string>;
  onAnalyze$: QRL<() => Promise<void> | void>;
  payout: Signal<string>;
  pickupAddress: Signal<string>;
  pickupName: Signal<string>;
  showAnalyzeAction: boolean;
}

export const OfferManualDetailsSection = component$<OfferManualDetailsSectionProps>((props) => {
  const i18n = useI18n();

  return (
    <OfferSectionCard title={t(i18n, 'offerDetailsSection', 'Offer details')}>
      <div class="ui-offer-grid ui-offer-grid-3">
        <div class="ui-field">
          <Label for="offer-payout">{t(i18n, 'offerAmountLabel', 'Payout')}</Label>
          <Input id="offer-payout" value={props.payout.value} onInput$={(_, el) => (props.payout.value = el.value)} />
        </div>
        <div class="ui-field">
          <Label for="offer-distance">{t(i18n, 'distanceKmLabel', 'Distance')}</Label>
          <Input
            id="offer-distance"
            value={props.distance.value}
            onInput$={(_, el) => (props.distance.value = el.value)}
          />
        </div>
        <div class="ui-field">
          <Label for="offer-duration">{t(i18n, 'durationMinutesLabel', 'Estimated time (minutes)')}</Label>
          <Input
            id="offer-duration"
            value={props.duration.value}
            onInput$={(_, el) => (props.duration.value = el.value)}
          />
        </div>
      </div>

      <div class="ui-offer-grid ui-offer-grid-2">
        <div class="ui-field">
          <Label for="offer-pickup-name">{t(i18n, 'pickupNameLabel', 'Pickup name')}</Label>
          <Input
            id="offer-pickup-name"
            value={props.pickupName.value}
            onInput$={(_, el) => (props.pickupName.value = el.value)}
          />
        </div>
        <div class="ui-field">
          <Label for="offer-dropoff-name">{t(i18n, 'dropoffNameLabel', 'Drop-off name')}</Label>
          <Input
            id="offer-dropoff-name"
            value={props.dropoffName.value}
            onInput$={(_, el) => (props.dropoffName.value = el.value)}
          />
        </div>
      </div>

      <div class="ui-offer-grid ui-offer-grid-2">
        <div class="ui-field">
          <Label for="offer-pickup-address">{t(i18n, 'pickupAddressLabel', 'Pickup address')}</Label>
          <Input
            id="offer-pickup-address"
            value={props.pickupAddress.value}
            onInput$={(_, el) => (props.pickupAddress.value = el.value)}
          />
        </div>
        <div class="ui-field">
          <Label for="offer-dropoff-address">{t(i18n, 'dropoffAddressLabel', 'Drop-off address')}</Label>
          <Input
            id="offer-dropoff-address"
            value={props.dropoffAddress.value}
            onInput$={(_, el) => (props.dropoffAddress.value = el.value)}
          />
        </div>
      </div>

      {props.showAnalyzeAction ? (
        <Button variant="default" onClick$={props.onAnalyze$}>
          {t(i18n, 'analyzeOfferButton', 'Analyze offer')}
        </Button>
      ) : null}
    </OfferSectionCard>
  );
});
