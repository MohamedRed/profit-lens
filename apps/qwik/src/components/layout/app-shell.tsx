import { Slot, component$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { useAuth } from '../../lib/auth/auth-context';
import { signOutCurrentUser } from '../../lib/firebase/auth';
import { applyLocale, supportedLocales, t, useI18n } from '../../lib/i18n/i18n-context';

interface AppShellProps {
  title: string;
}

export const AppShell = component$<AppShellProps>(({ title }) => {
  const auth = useAuth();
  const i18n = useI18n();
  const location = useLocation();

  return (
    <>
      <header class="pl-tabs">
        <nav class="pl-nav">
          <span class="pl-badge">ProfitLens</span>
          <Link class="pl-nav-link" href="/next/app/offer" prefetch={false} aria-current={location.url.pathname.includes('/app/offer') ? 'page' : undefined}>
            {t(i18n, 'offerTabLabel', 'Offer')}
          </Link>
          <Link class="pl-nav-link" href="/next/app/history" prefetch={false} aria-current={location.url.pathname.includes('/app/history') ? 'page' : undefined}>
            {t(i18n, 'historyTabLabel', 'History')}
          </Link>
          <Link class="pl-nav-link" href="/next/app/settings" prefetch={false} aria-current={location.url.pathname.includes('/app/settings') ? 'page' : undefined}>
            {t(i18n, 'settingsTabLabel', 'Settings')}
          </Link>
          <Link class="pl-nav-link" href="/next/app/help" prefetch={false} aria-current={location.url.pathname.includes('/app/help') ? 'page' : undefined}>
            {t(i18n, 'helpTabLabel', 'Help')}
          </Link>
          <span class="pl-nav-spacer" />
          <select
            class="pl-select"
            value={i18n.locale.value}
            onChange$={async (_, element) => {
              await applyLocale(i18n, element.value as 'fr' | 'en' | 'ar');
            }}
            aria-label="Language"
            style="max-width:120px"
          >
            {supportedLocales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </select>
          <button class="pl-button pl-button-ghost" onClick$={async () => await signOutCurrentUser()}>
            {t(i18n, 'signOutButton', 'Sign out')}
          </button>
        </nav>
      </header>
      <main class="pl-page" id="qwik-app-root-marker" data-user={auth.user.value?.uid ?? 'none'}>
        <section class="pl-card pl-stack">
          <h1 class="pl-title">{title}</h1>
          <p class="pl-subtitle">{auth.user.value?.email ?? ''}</p>
        </section>
        <section class="pl-card pl-stack" style="margin-top:16px;">
          <Slot />
        </section>
      </main>
    </>
  );
});
