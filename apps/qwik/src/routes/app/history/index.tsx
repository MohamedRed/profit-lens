import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Tabs } from '@qwik-ui/headless';
import { useAuth } from '../../../lib/auth/auth-context';
import {
  fetchOffersPage,
  type OffersPageCursor,
  watchOfferStats,
} from '../../../lib/features/offers/offers-service';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { OfferRecord, OfferStatsDay } from '../../../lib/types/offer';
import { saveHistoryOfferCache, saveSelectedHistoryOfferId } from './history-offer-cache';
import { HistoryChartPanel } from './history-chart-panel';
import { HistoryListPanel } from './history-list-panel';
import { readHistoryTabSessionState, writeHistoryTabSessionState } from './history-tab-session';
import {
  readHistoryScrollY,
  readHistoryViewMode,
  saveHistoryScrollY,
  saveHistoryViewMode,
} from './history-navigation-state';

const historyPageSize = 15;
const historyLoadMoreThresholdPx = 240;
const historyChartsTabIndex = 0;
const historyListTabIndex = 1;
const inBrowser = typeof window !== 'undefined';

export default component$(() => {
  const i18n = useI18n();
  const auth = useAuth();
  const offers = useSignal<OfferRecord[]>([]);
  const offersCursor = useSignal<OffersPageCursor | null>(null);
  const stats = useSignal<OfferStatsDay[]>([]);
  const isLoadingInitial = useSignal(true);
  const isLoadingMore = useSignal(false);
  const hasMore = useSignal(true);
  const hasLoadMoreError = useSignal(false);
  const selectedTabIndex = useSignal<number>(0);
  const suppressAutoLoadMore = useSignal(false);
  const hasHydratedFromSession = useSignal(false);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      stats.value = [];
      return;
    }

    const unsubscribeStats = watchOfferStats(user.uid, (items) => {
      stats.value = items;
    });

    cleanup(() => {
      unsubscribeStats();
    });
  });

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      offers.value = [];
      offersCursor.value = null;
      isLoadingInitial.value = false;
      isLoadingMore.value = false;
      hasMore.value = false;
      hasLoadMoreError.value = false;
      return;
    }

    let disposed = false;
    const uid = user.uid;
    const session = readHistoryTabSessionState(uid);
    hasHydratedFromSession.value = session !== null;

    if (session) {
      offers.value = session.offers;
      offersCursor.value = session.offersCursor;
      stats.value = session.stats;
      hasMore.value = session.hasMore;
      hasLoadMoreError.value = session.hasLoadMoreError;
      isLoadingInitial.value = false;
    }

    const loadInitial = async (): Promise<void> => {
      isLoadingInitial.value = true;
      hasLoadMoreError.value = false;
      try {
        const page = await fetchOffersPage({ uid, limitCount: historyPageSize });
        if (disposed) {
          return;
        }
        offers.value = page.offers;
        offersCursor.value = page.cursor;
        hasMore.value = page.hasMore;
      } finally {
        if (!disposed) {
          isLoadingInitial.value = false;
        }
      }
    };

    const loadMore = async (): Promise<void> => {
      if (isLoadingInitial.value || isLoadingMore.value || !hasMore.value || hasLoadMoreError.value) {
        return;
      }
      isLoadingMore.value = true;
      hasLoadMoreError.value = false;
      try {
        const currentCursor = offersCursor.value;
        const page = await fetchOffersPage({
          uid,
          limitCount: historyPageSize,
          cursor: currentCursor,
        });
        if (disposed) {
          return;
        }
        const sameCursor =
          page.cursor !== null && currentCursor !== null && page.cursor.id === currentCursor.id;
        const noProgress = page.offers.length === 0 || sameCursor;
        if (!noProgress) {
          offers.value = [...offers.value, ...page.offers];
          offersCursor.value = page.cursor;
        }
        hasMore.value = page.hasMore && !noProgress;
        hasLoadMoreError.value = noProgress;
      } catch {
        if (disposed) {
          return;
        }
        hasMore.value = false;
        hasLoadMoreError.value = true;
      } finally {
        if (!disposed) {
          isLoadingMore.value = false;
        }
      }
    };

    const maybeLoadMore = (): void => {
      if (selectedTabIndex.value !== historyListTabIndex) {
        return;
      }
      const remaining =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      if (remaining <= historyLoadMoreThresholdPx) {
        void loadMore();
      }
    };

    const savedMode = readHistoryViewMode();
    if (savedMode) {
      selectedTabIndex.value =
        savedMode === 'charts' ? historyChartsTabIndex : historyListTabIndex;
    }

    const onScroll = () => {
      saveHistoryScrollY(window.scrollY);
      if (suppressAutoLoadMore.value) {
        return;
      }
      maybeLoadMore();
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const restoreScrollPosition = () => {
      if (disposed) {
        return;
      }
      const savedScrollY = readHistoryScrollY();
      if (savedScrollY !== null && inBrowser) {
        suppressAutoLoadMore.value = true;
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: savedScrollY, behavior: 'auto' });
          window.requestAnimationFrame(() => {
            suppressAutoLoadMore.value = false;
          });
        });
      }
    };

    if (session) {
      restoreScrollPosition();
    } else {
      void loadInitial().then(() => {
        restoreScrollPosition();
      });
    }

    cleanup(() => {
      disposed = true;
      window.removeEventListener('scroll', onScroll);
    });
  });

  useVisibleTask$(({ track }) => {
    const uid = track(() => auth.user.value?.uid);
    const currentOffers = track(() => offers.value);
    const currentStats = track(() => stats.value);
    const currentCursor = track(() => offersCursor.value);
    const currentHasMore = track(() => hasMore.value);
    const currentHasLoadMoreError = track(() => hasLoadMoreError.value);
    const currentTabIndex = track(() => selectedTabIndex.value);
    const hydrated = track(() => hasHydratedFromSession.value);

    if (!uid) {
      return;
    }
    if (!hydrated && currentOffers.length === 0 && currentStats.length === 0) {
      return;
    }

    writeHistoryTabSessionState({
      uid,
      offers: currentOffers,
      offersCursor: currentCursor,
      stats: currentStats,
      hasMore: currentHasMore,
      hasLoadMoreError: currentHasLoadMoreError,
      selectedTabIndex: currentTabIndex,
    });
  });

  useVisibleTask$(({ track }) => {
    const currentOffers = track(() => offers.value);
    saveHistoryOfferCache(currentOffers);
  });

  const locale = i18n.locale.value;
  const onHistoryItemClick$ = $((offerId: string) => {
    saveSelectedHistoryOfferId(offerId);
  });
  const onHistoryModeChange$ = $((nextIndex: number) => {
    saveHistoryViewMode(nextIndex === historyChartsTabIndex ? 'charts' : 'list');
  });

  return (
    <div class="ui-history-root">
      <Tabs.Root bind:selectedIndex={selectedTabIndex} onSelectedIndexChange$={onHistoryModeChange$}>
        <Tabs.List class="ui-history-segmented">
          <Tabs.Tab class="ui-history-segment-btn" selectedClassName="is-active">
            <span class="material-icons-outlined ui-history-segment-icon" aria-hidden="true">
              show_chart
            </span>
            <span>{t(i18n, 'historyViewChartsLabel', 'Charts')}</span>
          </Tabs.Tab>
          <Tabs.Tab class="ui-history-segment-btn" selectedClassName="is-active">
            <span class="material-icons-outlined ui-history-segment-icon" aria-hidden="true">
              list
            </span>
            <span>{t(i18n, 'historyViewListLabel', 'List')}</span>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel class="ui-history-panel">
          <HistoryChartPanel stats={stats.value} locale={locale} />
        </Tabs.Panel>

        <Tabs.Panel class="ui-history-panel">
          <HistoryListPanel
            offers={offers.value}
            locale={locale}
            isLoadingInitial={isLoadingInitial.value}
            isLoadingMore={isLoadingMore.value}
            hasMore={hasMore.value}
            onHistoryItemClick$={onHistoryItemClick$}
          />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
});
