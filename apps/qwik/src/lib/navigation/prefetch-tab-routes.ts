const tabPrefetchers: Record<string, () => Promise<unknown>> = {
  '/app/offer': () => import('../../routes/app/offer/index'),
  '/app/history': () => import('../../routes/app/history/index'),
  '/app/settings': () => import('../../routes/app/settings/index'),
  '/app/help': () => import('../../routes/app/help/index'),
};

export const prefetchTabRoutes = async (currentPath: string): Promise<void> => {
  const jobs = Object.entries(tabPrefetchers)
    .filter(([match]) => !currentPath.includes(match))
    .map(([, load]) => load());
  await Promise.allSettled(jobs);
};
