import { Slot, component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { useAuth } from '../../lib/auth/auth-context';

interface AppShellProps {
  titleKey: string;
  titleFallback: string;
}

const navItems = [
  {
    href: '/next/app/offer',
    match: '/app/offer',
    icon: 'add_circle_outline',
    labelKey: 'offerTabLabel',
    fallback: 'Offer',
  },
  {
    href: '/next/app/history',
    match: '/app/history',
    icon: 'history',
    labelKey: 'historyTabLabel',
    fallback: 'History',
  },
  {
    href: '/next/app/settings',
    match: '/app/settings',
    icon: 'settings',
    labelKey: 'settingsTabLabel',
    fallback: 'Settings',
  },
  {
    href: '/next/app/help',
    match: '/app/help',
    icon: 'help_outline',
    labelKey: 'helpTabLabel',
    fallback: 'Help',
  },
] as const;

export const AppShell = component$<AppShellProps>(({ titleKey, titleFallback }) => {
  const i18n = useI18n();
  const location = useLocation();
  const auth = useAuth();

  return (
    <div class="ui-mobile-app" id="qwik-app-root-marker" data-user={auth.user.value?.uid ?? 'none'}>
      <main class="ui-mobile-page">
        <header class="ui-mobile-header">
          <h1 class="ui-mobile-title">{t(i18n, titleKey, titleFallback)}</h1>
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
                <span class="material-icons-outlined ui-mobile-tab-icon" aria-hidden="true">
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
