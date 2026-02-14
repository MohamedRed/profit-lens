import { Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { useAuth } from '../../lib/auth/auth-context';
import { prefetchTabRoutes } from '../../lib/navigation/prefetch-tab-routes';

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

let framework7TabbarStylesPromise: Promise<unknown[]> | null = null;

const ensureFramework7TabbarStyles = (): Promise<unknown[]> => {
  if (!framework7TabbarStylesPromise) {
    framework7TabbarStylesPromise = Promise.all([import('framework7/css')]);
  }
  return framework7TabbarStylesPromise;
};

export const AppShell = component$<AppShellProps>(({ titleKey, titleFallback }) => {
  const i18n = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const nextTransitionIsPop = useSignal(false);
  const transitionClass = useSignal<'is-push' | 'is-pop'>('is-push');
  const framework7StylesReady = useSignal(false);

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

  useVisibleTask$(({ cleanup }) => {
    let cancelled = false;
    void ensureFramework7TabbarStyles()
      .then(() => {
        if (!cancelled) {
          framework7StylesReady.value = true;
        }
      })
      .catch(() => {
        framework7StylesReady.value = false;
      });
    cleanup(() => {
      cancelled = true;
    });
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

      <footer class={{ 'ui-mobile-tab-shell': true, 'is-framework7-ready': framework7StylesReady.value }}>
        <div class="toolbar toolbar-bottom tabbar tabbar-labels ui-mobile-tab-nav" role="tablist" aria-label="Main navigation">
          <div class="toolbar-inner">
          {navItems.map((item) => {
            const active = location.url.pathname.includes(item.match);
            return (
              <button
                key={item.href}
                type="button"
                class={{
                  'tab-link': true,
                  'ui-mobile-tab-link': true,
                  'tab-link-active': active,
                  'is-active': active,
                }}
                role="tab"
                aria-selected={active ? 'true' : 'false'}
                aria-current={active ? 'page' : undefined}
                onClick$={async () => {
                  if (!active) {
                    await navigate(item.href);
                  }
                }}
              >
                <span class="material-icons-outlined icon ui-mobile-tab-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span class="tabbar-label ui-mobile-tab-label">{t(i18n, item.labelKey, item.fallback)}</span>
              </button>
            );
          })}
          </div>
        </div>
      </footer>
    </div>
  );
});
