import { Slot, component$ } from '@builder.io/qwik';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface OfferSectionCardProps {
  className?: string;
  showBorder?: boolean;
  title: string;
  subtitle?: string;
}

export const OfferSectionCard = component$<OfferSectionCardProps>(
  ({ title, subtitle, showBorder = false, className }) => {
    return (
      <Card class={['ui-offer-section', { 'is-bordered': showBorder }, className]}>
        <CardHeader class="ui-offer-section-header">
          <CardTitle class="ui-offer-section-title">{title}</CardTitle>
          {subtitle ? <p class="ui-offer-section-subtitle">{subtitle}</p> : null}
        </CardHeader>
        <CardContent class="ui-offer-section-body">
          <Slot />
        </CardContent>
      </Card>
    );
  },
);
