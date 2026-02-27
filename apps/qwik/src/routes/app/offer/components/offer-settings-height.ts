type OfferSettingsView = "menu" | "setup" | "billing";

const MIN_VIEWPORT_HEIGHT_PX = 220;
const BILLING_MIN_HEIGHT_PX = 280;
const BILLING_MAX_RATIO = 0.78;
const SETUP_MAX_RATIO = 0.72;

const parseCssPx = (value: string | null | undefined): number => {
  if (!value) {
    return 0;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const resolveOfferSettingsPanelChromeHeight = (panelElement: HTMLElement | null): number => {
  if (!panelElement || typeof window === "undefined") {
    return 0;
  }
  const panelStyle = window.getComputedStyle(panelElement);
  const paddingTop = parseCssPx(panelStyle.paddingTop);
  const paddingBottom = parseCssPx(panelStyle.paddingBottom);
  const gap = parseCssPx(panelStyle.rowGap || panelStyle.gap);
  const headerElement = panelElement.querySelector(".ui-offer-settings-panel-header");
  const headerHeight =
    headerElement instanceof HTMLElement ? Math.ceil(headerElement.getBoundingClientRect().height) : 0;
  return Math.max(0, Math.ceil(paddingTop + paddingBottom + gap + headerHeight));
};

interface ResolveOfferSettingsViewportHeightParams {
  view: OfferSettingsView;
  viewportHeight: number;
  contentHeight: number;
  panelChromeHeight: number;
}

export const resolveOfferSettingsViewportHeight = (
  params: ResolveOfferSettingsViewportHeightParams,
): number => {
  const safeViewportHeight = Math.max(0, Math.floor(params.viewportHeight));
  const safeContentHeight = Math.max(0, Math.ceil(params.contentHeight));
  const safePanelChromeHeight = Math.max(0, Math.ceil(params.panelChromeHeight));
  const ratioCap = params.view === "billing" ? BILLING_MAX_RATIO : SETUP_MAX_RATIO;
  const ratioBoundedMaxHeight = Math.max(MIN_VIEWPORT_HEIGHT_PX, Math.floor(safeViewportHeight * ratioCap));
  const screenBoundedMaxHeight = Math.max(
    MIN_VIEWPORT_HEIGHT_PX,
    safeViewportHeight - safePanelChromeHeight - 2,
  );
  const maxHeight = Math.max(
    MIN_VIEWPORT_HEIGHT_PX,
    Math.min(ratioBoundedMaxHeight, screenBoundedMaxHeight),
  );
  if (params.view === "billing") {
    const minHeight = Math.min(BILLING_MIN_HEIGHT_PX, maxHeight);
    const boundedContentHeight = Math.min(safeContentHeight, maxHeight);
    return Math.max(boundedContentHeight, minHeight);
  }
  return Math.min(safeContentHeight, maxHeight);
};
