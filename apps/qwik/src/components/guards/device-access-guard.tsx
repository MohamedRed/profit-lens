import { $, Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../lib/auth/auth-context';
import { getDeviceId } from '../../lib/config/device-id';
import { signOutCurrentUser } from '../../lib/firebase/auth';
import { resolveUserFacingErrorMessage } from '../../lib/errors/user-facing-error';
import {
  normalizeCallableErrorCode,
  parseActiveDevicesFromDetails,
  type ActiveDeviceSnapshot,
} from '../../lib/features/devices/device-registration-error';
import {
  clearDeviceRegistrationCache,
  isDeviceRegistrationFresh,
  markDeviceRegistrationFresh,
} from '../../lib/features/devices/device-registration-cache';
import { registerDeviceWithBackoff } from '../../lib/features/devices/register-device-with-backoff';
import { t, useI18n } from '../../lib/i18n/i18n-context';

type DeviceGateState = 'ready' | 'limit' | 'error';
type RegisterCurrentDeviceOptions = {
  replaceDeviceId?: string;
  allowCached?: boolean;
};

const formatLastSeen = (locale: string, value: Date | null): string | null => {
  if (!value) {
    return null;
  }
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
};

export const DeviceAccessGuard = component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const gateState = useSignal<DeviceGateState>('ready');
  const blockedDevices = useSignal<ActiveDeviceSnapshot[]>([]);
  const currentDeviceId = useSignal('');
  const errorMessage = useSignal('');
  const replacingDeviceId = useSignal('');
  const registrationSeq = useSignal(0);
  const registrationInFlight = useSignal(false);

  const registerCurrentDevice$ = $(async (options?: RegisterCurrentDeviceOptions) => {
    if (registrationInFlight.value) {
      return;
    }
    const user = auth.user.value;
    if (!user) {
      return;
    }
    const deviceId = getDeviceId();
    currentDeviceId.value = deviceId;

    const replaceDeviceId = options?.replaceDeviceId;
    const shouldUseCache = (options?.allowCached ?? true) && !replaceDeviceId;
    if (
      shouldUseCache &&
      isDeviceRegistrationFresh({
        uid: user.uid,
        deviceId,
      })
    ) {
      gateState.value = 'ready';
      return;
    }

    const seq = registrationSeq.value + 1;
    registrationSeq.value = seq;
    registrationInFlight.value = true;
    errorMessage.value = '';
    replacingDeviceId.value = replaceDeviceId ?? '';

    try {
      await registerDeviceWithBackoff({
        deviceId,
        platform: 'web',
        userAgent: navigator.userAgent ?? '',
        replaceDeviceId,
      });

      if (registrationSeq.value !== seq) {
        return;
      }
      markDeviceRegistrationFresh({
        uid: user.uid,
        deviceId,
      });
      blockedDevices.value = [];
      gateState.value = 'ready';
    } catch (error) {
      if (registrationSeq.value !== seq) {
        return;
      }
      clearDeviceRegistrationCache();
      const code = normalizeCallableErrorCode(error);
      if (code === 'resource-exhausted') {
        blockedDevices.value = parseActiveDevicesFromDetails(
          (error as { details?: unknown }).details,
        );
        gateState.value = 'limit';
        return;
      }
      errorMessage.value = resolveUserFacingErrorMessage(i18n, error, 'devices');
      gateState.value = 'error';
    } finally {
      if (registrationSeq.value === seq) {
        registrationInFlight.value = false;
        replacingDeviceId.value = '';
      }
    }
  });

  useVisibleTask$(({ track }) => {
    const ready = track(() => auth.ready.value);
    const uid = track(() => auth.user.value?.uid);
    if (!ready || !uid) {
      return;
    }
    void registerCurrentDevice$({
      allowCached: true,
    });
  });

  if (gateState.value === 'ready') {
    return <Slot />;
  }

  if (gateState.value === 'limit') {
    return (
      <div class="ui-settings-detail-root ui-device-limit-root">
        <section class="ui-settings-detail-card ui-device-limit-card">
          <h2 class="ui-settings-detail-title">{t(i18n, 'deviceLimitTitle', 'Device limit reached')}</h2>
          <p class="ui-settings-detail-subtitle">
            {t(
              i18n,
              'deviceLimitSubtitle',
              'Your plan allows 1 active device. Replace one to continue.',
            )}
          </p>
          <ul class="ui-settings-device-list">
            {blockedDevices.value.map((device) => {
              const isCurrent = device.deviceId === currentDeviceId.value;
              const lastSeen = formatLastSeen(i18n.locale.value, device.lastSeen);
              return (
                <li key={device.deviceId} class="ui-settings-device-item">
                  <div class="ui-settings-row">
                    <p class="ui-settings-row-title">
                      {device.platform || t(i18n, 'deviceUnknownLabel', 'Unknown device')}
                    </p>
                    {isCurrent ? (
                      <span class="ui-settings-row-subtitle">
                        {t(i18n, 'deviceCurrentLabel', 'Current')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        class="ui-settings-link-button"
                        disabled={registrationInFlight.value}
                        onClick$={() =>
                          registerCurrentDevice$({
                            replaceDeviceId: device.deviceId,
                            allowCached: false,
                          })
                        }
                      >
                        {registrationInFlight.value && replacingDeviceId.value === device.deviceId
                          ? t(i18n, 'loadingLabel', 'Loading...')
                          : t(i18n, 'deviceReplaceAction', 'Replace')}
                      </button>
                    )}
                  </div>
                  {lastSeen ? (
                    <p class="ui-settings-row-subtitle">
                      {t(i18n, 'deviceLastSeenPrefix', 'Last seen')} {lastSeen}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            class="ui-button ui-button-secondary ui-button-md"
            onClick$={() => {
              void signOutCurrentUser();
            }}
          >
            {t(i18n, 'signOutButton', 'Sign out')}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">
          {t(i18n, 'deviceRegisterFailedTitle', 'Unable to register device')}
        </h2>
        <p class="ui-status ui-status-error">{errorMessage.value}</p>
        <div class="ui-settings-actions">
          <button
            type="button"
            class="ui-settings-action-button"
            onClick$={() =>
              registerCurrentDevice$({
                allowCached: false,
              })
            }
          >
            {t(i18n, 'retryButtonLabel', 'Retry')}
          </button>
          <button
            type="button"
            class="ui-settings-action-button"
            onClick$={() => {
              void signOutCurrentUser();
            }}
          >
            {t(i18n, 'signOutButton', 'Sign out')}
          </button>
        </div>
      </section>
    </div>
  );
});
