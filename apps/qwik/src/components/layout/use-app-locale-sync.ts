import { useVisibleTask$ } from '@builder.io/qwik';
import type { AuthStore } from '../../lib/auth/auth-context';
import { watchUserProfile } from '../../lib/features/profile/profile-service';
import {
  applyLocale,
  resolveLocaleCode,
  type I18nStore,
  type LocaleCode,
} from '../../lib/i18n/i18n-context';

interface UseAppLocaleSyncParams {
  auth: AuthStore;
  i18n: I18nStore;
}

export const useAppLocaleSync = (params: UseAppLocaleSyncParams): void => {
  const { auth, i18n } = params;

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      return;
    }

    let latestRequestedLocale: LocaleCode | null = null;
    const unsubscribe = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      const preferredLocale = resolveLocaleCode(nextProfile.preferredLocale);
      if (preferredLocale === i18n.locale.value || preferredLocale === latestRequestedLocale) {
        return;
      }
      latestRequestedLocale = preferredLocale;
      void applyLocale(i18n, preferredLocale)
        .catch((error) => {
          console.warn('[i18n] failed to apply preferred locale from profile', error);
        })
        .finally(() => {
          if (latestRequestedLocale === preferredLocale) {
            latestRequestedLocale = null;
          }
        });
    });

    cleanup(() => {
      unsubscribe();
    });
  });
};
