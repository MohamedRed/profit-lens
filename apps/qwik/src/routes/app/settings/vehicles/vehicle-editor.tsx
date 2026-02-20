import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { isValidBackToHref } from '../shared/vehicle-editor-href';
import { VehicleEditorForm } from './vehicle-editor-form';
import { useVehicleEditorState } from './vehicle-editor-state';
import type { VehicleEditorProps } from './vehicle-editor-types';

const defaultReturnHref = '/next/app/settings';

export const VehicleEditor = component$<VehicleEditorProps>((props) => {
  const i18n = useI18n();
  const navigate = useNavigate();
  const state = useVehicleEditorState(props);

  const title =
    props.mode === 'create'
      ? t(i18n, 'addVehicleTitle', 'Add vehicle')
      : t(i18n, 'editVehicleTitle', 'Edit vehicle');
  const returnHref = isValidBackToHref(props.returnToHref) ? props.returnToHref : defaultReturnHref;

  const missingTarget = props.mode === 'edit' && !props.vehicleId;
  const notFound = props.mode === 'edit' && !state.loading.value && !state.existingVehicle.value;

  useVisibleTask$(({ track }) => {
    const shouldRedirect = track(() => missingTarget || notFound);
    if (!shouldRedirect) {
      return;
    }
    void navigate(returnHref);
  });

  if (missingTarget || notFound) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsFormSkeleton fieldCount={3} />
      </div>
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
