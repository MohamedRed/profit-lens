import { component$ } from '@builder.io/qwik';
import {
  LoadingSkeletonAnnouncer,
  SettingsFormSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { ProfileFormView } from './profile-form-view';
import { useProfileFormState } from './profile-form-state';

export default component$(() => {
  const i18n = useI18n();
  const state = useProfileFormState();

  if (state.loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsFormSkeleton fieldCount={10} />
      </div>
    );
  }

  if (!state.profile.value) {
    return (
      <p class="ui-settings-detail-subtitle">
        {t(i18n, 'profileSaveFailedMessage', 'Unable to save profile.')}
      </p>
    );
  }

  return <ProfileFormView state={state} />;
});
