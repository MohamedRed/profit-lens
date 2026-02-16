import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useLocation } from '@builder.io/qwik-city';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { prefetchTabRoutes } from '../../lib/navigation/prefetch-tab-routes';

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

const resolveActiveTabIndex = (path: string): number => {
  const index = navItems.findIndex((item) => path.includes(item.match));
  return index === -1 ? 0 : index;
};

const triggerTabHaptic = (): void => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }
  if (typeof navigator.vibrate !== 'function') {
    return;
  }
  if (typeof window.matchMedia === 'function' && !window.matchMedia('(pointer: coarse)').matches) {
    return;
  }
  navigator.vibrate(8);
};

export const AppShell = component$(() => {
  const i18n = useI18n();
  const location = useLocation();
  const nextTransitionIsPop = useSignal(false);
  const transitionClass = useSignal<'is-push' | 'is-pop'>('is-push');
  const pathname = location.url.pathname;
  const normalizedPath =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  const showHelpTicketsAction =
    normalizedPath === '/app/help' || normalizedPath === '/next/app/help';
  const activeTabIndex = resolveActiveTabIndex(pathname);
  const activeTab = navItems[activeTabIndex];

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

  useVisibleTask$(({ cleanup }) => {
    let cancelled = false;
    const runPrefetch = () => {
      if (cancelled) {
        return;
      }
      void prefetchTabRoutes(location.url.pathname);
    };

    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(runPrefetch, { timeout: 1800 });
    } else {
      timeoutHandle = setTimeout(runPrefetch, 300);
    }

    cleanup(() => {
      cancelled = true;
      if (idleHandle !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
    });
  });

  return (
    <div class="ui-mobile-app" id="qwik-app-root-marker">
      <main class="ui-mobile-page">
        <header class="ui-mobile-header">
          <h1 class="ui-mobile-title">{t(i18n, activeTab.labelKey, activeTab.fallback)}</h1>
          {showHelpTicketsAction ? (
            <Link
              class="ui-mobile-header-action"
              href="/next/app/help/tickets"
              aria-label={t(i18n, 'helpViewTicketsButton', 'View tickets')}
            >
              <span class="material-icons-outlined" aria-hidden="true">
                list_alt
              </span>
            </Link>
          ) : null}
        </header>

        <section
          key={location.url.pathname}
          class={`ui-mobile-content ui-mobile-content-transition ${transitionClass.value}`}
        >
          <Slot />
        </section>
      </main>

      <footer class="ui-mobile-tab-shell">
        <div class="ui-mobile-tab-nav" role="tablist" aria-label="Main navigation">
          <div class="ui-mobile-tab-inner" style={{ '--ui-mobile-active-tab-index': String(activeTabIndex) }}>
            <span class="ui-mobile-tab-indicator" aria-hidden="true" />
            {navItems.map((item, index) => {
              const active = index === activeTabIndex;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  class={{
                    'ui-mobile-tab-link': true,
                    'is-active': active,
                  }}
                  role="tab"
                  aria-selected={active ? 'true' : 'false'}
                  aria-current={active ? 'page' : undefined}
                  onClick$={() => {
                    if (!active) {
                      triggerTabHaptic();
                    }
                  }}
                >
                  <span class="material-icons-outlined ui-mobile-tab-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span class="ui-mobile-tab-label">{t(i18n, item.labelKey, item.fallback)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
});
