export type OfferMode = 'single' | 'bulk';

interface ResolveOfferModeParams {
  initialMode?: OfferMode;
  pathname?: string;
  search?: string;
}

export const resolveOfferMode = ({
  initialMode = 'single',
  pathname = '',
  search = '',
}: ResolveOfferModeParams): OfferMode => {
  if (pathname.endsWith('/app/offer/bulk') || pathname.endsWith('/app/offer/bulk/')) {
    return 'bulk';
  }
  const searchParams = new URLSearchParams(search);
  return searchParams.get('mode') === 'bulk' ? 'bulk' : initialMode;
};

export const resolveOfferModeHref = (mode: OfferMode): string => (
  mode === 'bulk' ? '/next/app/offer?mode=bulk' : '/next/app/offer'
);
