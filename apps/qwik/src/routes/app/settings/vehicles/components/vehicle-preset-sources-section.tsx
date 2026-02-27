import { component$ } from '@builder.io/qwik';
import { vehiclePresetSources } from '../../../../../lib/features/vehicles/vehicle-form-utils';
import { PresetSourcesSection } from '../../shared/preset-sources-section';

export const VehiclePresetSourcesSection = component$(() => {
  return <PresetSourcesSection sources={vehiclePresetSources} />;
});
