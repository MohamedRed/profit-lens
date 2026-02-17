import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import {
  LoadingSkeletonAnnouncer,
  SettingsListSkeleton,
} from '../../../../components/ui/page-loading-skeleton';
import { useAuth } from '../../../../lib/auth/auth-context';
import { getDeviceId } from '../../../../lib/config/device-id';
import { revokeDevice, watchDevices } from '../../../../lib/features/devices/devices-service';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { DeviceEntry } from '../../../../lib/types/device';

const formatLastSeen = (locale: string, date: Date | null | undefined): string | null => {
  if (!date) {
    return null;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();

  const devices = useSignal<DeviceEntry[]>([]);
  const loading = useSignal(true);
  const revokingId = useSignal('');
  const status = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      loading.value = false;
      devices.value = [];
      return;
    }

    loading.value = true;
    const unsubscribe = watchDevices(user.uid, (items) => {
      devices.value = items;
      loading.value = false;
    }, getDeviceId());
    cleanup(() => {
      unsubscribe();
    });
  });

  const revoke$ = $(
    async (deviceId: string) => {
      revokingId.value = deviceId;
      status.value = '';
      try {
        await revokeDevice({ deviceId });
      } catch (error) {
        status.value = error instanceof Error ? error.message : String(error);
      } finally {
        revokingId.value = '';
      }
    },
  );

  const locale = i18n.locale.value;

  if (loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <SettingsListSkeleton itemCount={3} />
      </div>
    );
  }

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">{t(i18n, 'deviceManagementTitle', 'Device access')}</h2>
        <p class="ui-settings-detail-subtitle">
          {t(i18n, 'deviceManagementSubtitle', 'Only one device can be active at a time.')}
        </p>

        <ul class="ui-settings-device-list">
          {devices.value.map((entry) => {
            const lastSeen = formatLastSeen(locale, entry.lastSeenAt);
            return (
              <li key={entry.id} class="ui-settings-device-item">
                <div class="ui-settings-row">
                  <p class="ui-settings-row-title">
                    {entry.deviceLabel || entry.platform || t(i18n, 'deviceUnknownLabel', 'Unknown device')}
                  </p>
                  {entry.isCurrent ? (
                    <span class="ui-settings-row-subtitle">{t(i18n, 'deviceCurrentLabel', 'Current')}</span>
                  ) : (
                    <button
                      type="button"
                      class="ui-settings-link-button"
                      disabled={revokingId.value === entry.id}
                      onClick$={() => revoke$(entry.id)}
                    >
                      {revokingId.value === entry.id
                        ? t(i18n, 'loadingLabel', 'Loading...')
                        : t(i18n, 'deviceRevokeAction', 'Revoke')}
                    </button>
                  )}
                </div>
                {lastSeen ? (
                  <p class="ui-settings-row-subtitle">
                    {t(i18n, 'deviceLastSeenPrefix', 'Last seen')} {lastSeen}
                  </p>
                ) : null}
                {entry.userAgent ? <p class="ui-settings-row-subtitle">{entry.userAgent}</p> : null}
              </li>
            );
          })}
          {devices.value.length === 0 ? (
            <li class="ui-settings-device-item">
              <p class="ui-settings-row-subtitle">{t(i18n, 'deviceUnknownLabel', 'Unknown device')}</p>
            </li>
          ) : null}
        </ul>
      </section>

      {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
    </div>
  );
});
