import { Slot, component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { useAuth } from '../../lib/auth/auth-context';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
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
          <Badge>ProfitLens</Badge>
          <a class="pl-nav-link" href="/next/app/offer" aria-current={location.url.pathname.includes('/app/offer') ? 'page' : undefined}>
            {t(i18n, 'offerTabLabel', 'Offer')}
          </a>
          <a class="pl-nav-link" href="/next/app/history" aria-current={location.url.pathname.includes('/app/history') ? 'page' : undefined}>
            {t(i18n, 'historyTabLabel', 'History')}
          </a>
          <a class="pl-nav-link" href="/next/app/settings" aria-current={location.url.pathname.includes('/app/settings') ? 'page' : undefined}>
            {t(i18n, 'settingsTabLabel', 'Settings')}
          </a>
          <a class="pl-nav-link" href="/next/app/help" aria-current={location.url.pathname.includes('/app/help') ? 'page' : undefined}>
            {t(i18n, 'helpTabLabel', 'Help')}
          </a>
          <span class="pl-nav-spacer" />
          <Select
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
          </Select>
          <Button variant="secondary" onClick$={async () => await signOutCurrentUser()}>
            {t(i18n, 'signOutButton', 'Sign out')}
          </Button>
        </nav>
      </header>
      <main class="pl-page" id="qwik-app-root-marker" data-user={auth.user.value?.uid ?? 'none'}>
        <Card class="pl-stack">
          <h1 class="pl-title">{title}</h1>
          <p class="pl-subtitle">{auth.user.value?.email ?? ''}</p>
        </Card>
        <Card class="pl-stack" style="margin-top:16px;">
          <Slot />
        </Card>
      </main>
    </>
  );
});
