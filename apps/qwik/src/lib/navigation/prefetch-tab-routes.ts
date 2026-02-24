const historyPrefetchInFlightByUid = new Map<string, Promise<void>>();

const tabPrefetchers: Record<string, () => Promise<unknown>> = {
  '/app/offer': () => import('../../routes/app/offer/index'),
  '/app/history': () => import('../../routes/app/history/index'),
  '/app/settings': () => import('../../routes/app/settings/index'),
  '/app/help': () => import('../../routes/app/help/index'),
};

const prefetchHistoryStats = async (uid: string): Promise<void> => {
  const existing = historyPrefetchInFlightByUid.get(uid);
  if (existing) {
    return await existing;
  }
  const job = (async () => {
    const [{ readPrefetchedHistoryStats, savePrefetchedHistoryStats }, { fetchOfferStats }] = await Promise.all([
      import('../../routes/app/history/history-prefetch-cache'),
      import('../features/offers/offers-service'),
    ]);
    if (readPrefetchedHistoryStats(uid)) {
      return;
    }
    const stats = await fetchOfferStats(uid);
    if (stats.length > 0) {
      savePrefetchedHistoryStats(uid, stats);
    }
  })().finally(() => {
    historyPrefetchInFlightByUid.delete(uid);
  });
  historyPrefetchInFlightByUid.set(uid, job);
  return await job;
};

export const prefetchTabRoutes = async (
  currentPath: string,
  options: { uid?: string | null } = {},
): Promise<void> => {
  const routeJobs = Object.entries(tabPrefetchers)
    .filter(([match]) => !currentPath.includes(match))
    .map(([, load]) => load());

  const dataJobs: Array<Promise<void>> = [];
  if (options.uid && !currentPath.includes('/app/history')) {
    dataJobs.push(prefetchHistoryStats(options.uid));
  }

  await Promise.allSettled([...routeJobs, ...dataJobs]);
};
