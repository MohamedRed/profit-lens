import { component$ } from '@builder.io/qwik';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { VehicleEditorForm } from './vehicle-editor-form';
import { useVehicleEditorState } from './vehicle-editor-state';
import type { VehicleEditorProps } from './vehicle-editor-types';

export const VehicleEditor = component$<VehicleEditorProps>((props) => {
  const i18n = useI18n();
  const state = useVehicleEditorState(props);

  const title =
    props.mode === 'create'
      ? t(i18n, 'addVehicleTitle', 'Add vehicle')
      : t(i18n, 'editVehicleTitle', 'Edit vehicle');

  const missingTarget = props.mode === 'edit' && !props.vehicleId;
  const notFound = props.mode === 'edit' && !state.loading.value && !state.existingVehicle.value;

  if (missingTarget) {
    return (
      <p class="ui-settings-detail-subtitle">
        {t(i18n, 'vehicleSaveFailedMessage', 'Unable to save vehicle.')}
      </p>
    );
  }

  if (notFound) {
    return (
      <p class="ui-settings-detail-subtitle">
        {t(i18n, 'vehicleDeleteFailedMessage', 'Unable to delete vehicle.')}
      </p>
    );
  }

  if (state.loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsFormSkeleton fieldCount={8} />
      </div>
    );
  }

  return <VehicleEditorForm props={props} state={state} title={title} />;
});
