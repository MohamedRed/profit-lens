import { $, Slot, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import { t, useI18n } from '../../lib/i18n/i18n-context';
import { prefetchTabRoutes } from '../../lib/navigation/prefetch-tab-routes';
import { readTabScrollY, saveTabScrollY } from '../../lib/navigation/tab-scroll-memory';
import {
  isTabRootPath,
  navItems,
  resolveActiveTabIndex,
  resolveHeaderBackHref,
  resolveRouteDepth,
  resolveSectionKey,
  toAppPath,
} from './app-shell-routing';

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
  const navigate = useNavigate();
  const nextTransitionIsPop = useSignal(false);
  const transitionClass = useSignal<'is-push' | 'is-pop' | 'is-push-deep'>('is-push');
  const previousAppPath = useSignal<string | null>(null);
  const appPath = toAppPath(location.url.pathname);
  const showHelpTicketsAction = appPath === '/app/help';
  const headerBackHref = resolveHeaderBackHref(appPath);
  const preferDeterministicBack =
    appPath === '/app/settings/vehicles' || appPath.startsWith('/app/settings/vehicles/');
  const activeTabIndex = resolveActiveTabIndex(appPath);
  const activeTab = navItems[activeTabIndex];

  const onHeaderBack$ = $(async () => {
    if (!headerBackHref) {
      return;
    }
    if (window.history.length > 1 && !preferDeterministicBack) {
      window.history.back();
      return;
    }
    nextTransitionIsPop.value = true;
    await navigate(headerBackHref);
  });

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
    const currentPath = toAppPath(location.url.pathname);
    const previousPath = previousAppPath.value;
    if (nextTransitionIsPop.value) {
      transitionClass.value = 'is-pop';
    } else if (!previousPath) {
      transitionClass.value = 'is-push';
    } else {
      const sameSection = resolveSectionKey(previousPath) === resolveSectionKey(currentPath);
      const depthDiff = resolveRouteDepth(currentPath) - resolveRouteDepth(previousPath);
      if (sameSection && depthDiff > 0) {
        transitionClass.value = 'is-push-deep';
      } else if (sameSection && depthDiff < 0) {
        transitionClass.value = 'is-pop';
      } else {
        transitionClass.value = 'is-push';
      }
    }

    const previousSection = previousPath ? resolveSectionKey(previousPath) : null;
    const currentSection = resolveSectionKey(currentPath);
    const switchedTab = previousSection !== null && previousSection !== currentSection;
    const initialHydration = previousSection === null;
    if ((switchedTab || initialHydration) && isTabRootPath(currentPath)) {
      const savedScroll = readTabScrollY(currentSection);
      if (savedScroll !== null) {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: savedScroll, behavior: 'auto' });
        });
      }
    }

    previousAppPath.value = currentPath;
    nextTransitionIsPop.value = false;
  });

  useVisibleTask$(({ track, cleanup }) => {
    track(() => location.url.pathname);
    const currentPath = toAppPath(location.url.pathname);
    const sectionKey = resolveSectionKey(currentPath);
    let lastKnownScrollY = window.scrollY;
    const isCurrentSectionActive = (): boolean => {
      return resolveSectionKey(toAppPath(window.location.pathname)) === sectionKey;
    };

    const onScroll = () => {
      if (!isCurrentSectionActive()) {
        return;
      }
      lastKnownScrollY = window.scrollY;
      saveTabScrollY(sectionKey, lastKnownScrollY);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    cleanup(() => {
      if (isCurrentSectionActive()) {
        lastKnownScrollY = window.scrollY;
      }
      saveTabScrollY(sectionKey, lastKnownScrollY);
      window.removeEventListener('scroll', onScroll);
    });
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
          {headerBackHref ? (
            <button
              type="button"
              class="ui-mobile-header-back"
              onClick$={onHeaderBack$}
              aria-label={t(i18n, 'commonBackLabel', 'Back')}
            >
              <span class="material-icons-outlined" aria-hidden="true">
                arrow_back
              </span>
            </button>
          ) : null}
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
