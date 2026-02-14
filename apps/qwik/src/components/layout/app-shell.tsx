import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { ToggleGroup } from '@qwik-ui/headless';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { useAuth } from '../../lib/auth/auth-context';
import { cn } from '../../lib/ui/cn';

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
  const navigate = useNavigate();
  const auth = useAuth();
  const nextTransitionIsPop = useSignal(false);
  const transitionClass = useSignal<'is-push' | 'is-pop'>('is-push');

  const activeTabHref = navItems.find((item) => location.url.pathname.includes(item.match))?.href ?? navItems[0].href;

  useVisibleTask$(({ cleanup }) => {
    const onPopState = () => {
      nextTransitionIsPop.value = true;
    };
    window.addEventListener('popstate', onPopState);
    cleanup(() => {
      window.removeEventListener('popstate', onPopState);
    });
  });

  useVisibleTask$(({ track }) => {
    track(() => location.url.pathname);
    transitionClass.value = nextTransitionIsPop.value ? 'is-pop' : 'is-push';
    nextTransitionIsPop.value = false;
  });

  return (
    <div class="ui-mobile-app" id="qwik-app-root-marker" data-user={auth.user.value?.uid ?? 'none'}>
      <main class="ui-mobile-page">
        <header class="ui-mobile-header">
          <h1 class="ui-mobile-title">{t(i18n, titleKey, titleFallback)}</h1>
        </header>

        <section
          key={location.url.pathname}
          class={`ui-mobile-content ui-mobile-content-transition ${transitionClass.value}`}
        >
          <Slot />
        </section>
      </main>

      <footer class="ui-mobile-tab-shell">
        <ToggleGroup.Root
          class="ui-mobile-tab-nav"
          value={activeTabHref}
          onChange$={async (nextHref: string) => {
            if (nextHref && nextHref !== activeTabHref) {
              await navigate(nextHref);
            }
          }}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const active = location.url.pathname.includes(item.match);
            return (
              <ToggleGroup.Item
                key={item.href}
                value={item.href}
                class={cn('ui-mobile-tab-link', active ? 'is-active' : null)}
                aria-current={active ? 'page' : undefined}
              >
                <span class="material-icons-outlined ui-mobile-tab-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span class="ui-mobile-tab-label">{t(i18n, item.labelKey, item.fallback)}</span>
              </ToggleGroup.Item>
            );
          })}
        </ToggleGroup.Root>
      </footer>
    </div>
  );
});
