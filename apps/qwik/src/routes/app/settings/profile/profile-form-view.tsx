import { component$ } from '@builder.io/qwik';
import { franceDefaultSources } from '../../../../lib/features/profile/profile-form-utils';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { PresetSourcesSection } from '../shared/preset-sources-section';
import type { ProfileFormState } from './profile-form-state';
import { ProfileMonthlyCostsSection } from './components/profile-monthly-costs-section';
import { ProfileTaxesSection } from './components/profile-taxes-section';

interface ProfileFormViewProps {
  state: ProfileFormState;
}

export const ProfileFormView = component$<ProfileFormViewProps>(({ state }) => {
  const i18n = useI18n();

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">{t(i18n, 'profileEditTitle', 'Edit profile')}</h2>
        <div class="ui-settings-form-grid">
          <ProfileTaxesSection state={state} />
          <ProfileMonthlyCostsSection state={state} />

          <PresetSourcesSection sources={franceDefaultSources} />

          <button
            type="button"
            class="ui-settings-action-button"
            disabled={state.saving.value}
            onClick$={state.save$}
          >
            {state.saving.value
              ? t(i18n, 'loadingLabel', 'Loading...')
              : t(i18n, 'saveProfileButton', 'Save profile')}
          </button>
        </div>
      </section>

      {state.status.value ? <p class="ui-status ui-status-error">{state.status.value}</p> : null}
    </div>
  );
});
