import { Slot, component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../lib/auth/auth-context';
import { signOutCurrentUser } from '../../lib/firebase/auth';
import { t, useI18n } from '../../lib/i18n/i18n-context';

interface AppShellProps {
  title: string;
}

const navItems = [
  { href: '/next/app/offer', match: '/app/offer', icon: '◎', labelKey: 'offerTabLabel', fallback: 'Offer' },
  { href: '/next/app/history', match: '/app/history', icon: '◷', labelKey: 'historyTabLabel', fallback: 'History' },
  { href: '/next/app/settings', match: '/app/settings', icon: '⚙', labelKey: 'settingsTabLabel', fallback: 'Settings' },
  { href: '/next/app/help', match: '/app/help', icon: '?', labelKey: 'helpTabLabel', fallback: 'Help' },
] as const;

export const AppShell = component$<AppShellProps>(({ title }) => {
  const auth = useAuth();
  const i18n = useI18n();
  const location = useLocation();

  return (
    <div class="ui-mobile-app" id="qwik-app-root-marker" data-user={auth.user.value?.uid ?? 'none'}>
      <main class="ui-mobile-page">
        <header class="ui-mobile-header">
          <div class="ui-mobile-header-row">
            <div>
              <p class="ui-mobile-brand">ProfitLens</p>
              <h1 class="ui-mobile-title">{title}</h1>
              <p class="ui-mobile-email">{auth.user.value?.email ?? ''}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="ui-mobile-signout"
              onClick$={async () => {
                await signOutCurrentUser();
              }}
            >
              {t(i18n, 'signOutButton', 'Sign out')}
            </Button>
          </div>
        </header>

        <section class="ui-mobile-content">
          <Slot />
        </section>
      </main>

      <footer class="ui-mobile-tab-shell">
        <nav class="ui-mobile-tab-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = location.url.pathname.includes(item.match);
            return (
              <a
                key={item.href}
                class={{ 'ui-mobile-tab-link': true, 'is-active': active }}
                href={item.href}
                aria-current={active ? 'page' : undefined}
              >
                <span class="ui-mobile-tab-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span class="ui-mobile-tab-label">{t(i18n, item.labelKey, item.fallback)}</span>
              </a>
            );
          })}
        </nav>
      </footer>
    </div>
  );
});
