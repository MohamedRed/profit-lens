export const navItems = [
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

const toPathSegments = (path: string): string[] => path.split('/').filter(Boolean);

export const resolveActiveTabIndex = (path: string): number => {
  const index = navItems.findIndex((item) => path.includes(item.match));
  return index === -1 ? 0 : index;
};

export const resolveSectionKey = (path: string): string => {
  const segments = toPathSegments(path);
  if (segments.length >= 2) {
    return `${segments[0]}/${segments[1]}`;
  }
  return path;
};

export const resolveRouteDepth = (path: string): number => toPathSegments(path).length;

const stripNextBase = (path: string): string => {
  if (path.startsWith('/next/')) {
    return path.slice('/next'.length);
  }
  return path;
};

export const toAppPath = (path: string): string => {
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  return stripNextBase(normalized);
};

const tabRootPaths = navItems.map((item) => toAppPath(item.href));

export const isTabRootPath = (path: string): boolean => tabRootPaths.includes(path);

const isValidAppBackHref = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }
  return value.startsWith('/next/app/');
};

export const shouldPreferDeterministicBack = (
  path: string,
  explicitBackHref?: string | null,
): boolean => {
  if (isValidAppBackHref(explicitBackHref)) {
    return true;
  }
  if (path.startsWith('/app/settings/vehicles/')) {
    return true;
  }
  if (path.startsWith('/app/help/tickets/')) {
    return true;
  }
  return false;
};

export const resolveHeaderBackHref = (
  path: string,
  explicitBackHref?: string | null,
): string | null => {
  // Ticket details should always return to ticket list to avoid stale back targets.
  if (path.startsWith('/app/help/tickets/')) {
    return '/next/app/help/tickets';
  }
  if (isValidAppBackHref(explicitBackHref)) {
    return explicitBackHref;
  }
  if (path === '/app/help/tickets') {
    return '/next/app/help';
  }
  if (path.startsWith('/app/history/')) {
    return '/next/app/history';
  }
  if (path.startsWith('/app/settings/vehicles/')) {
    return '/next/app/settings';
  }
  if (path.startsWith('/app/settings/')) {
    return '/next/app/settings';
  }
  return null;
};
