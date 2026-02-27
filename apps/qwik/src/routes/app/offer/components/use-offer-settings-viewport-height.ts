import { useVisibleTask$, type Signal } from "@builder.io/qwik";
import {
  resolveOfferSettingsPanelChromeHeight,
  resolveOfferSettingsViewportHeight,
} from "./offer-settings-height";

export type OfferSettingsView = "menu" | "setup" | "billing";

interface UseOfferSettingsViewportHeightParams {
  isOpen: Signal<boolean>;
  activeView: Signal<OfferSettingsView>;
  dialogRef: Signal<HTMLDialogElement | undefined>;
  viewHeightPx: Signal<number | null>;
}

const resolveViewportHeight = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }
  const visualViewportHeight = window.visualViewport?.height;
  if (
    typeof visualViewportHeight === "number" &&
    Number.isFinite(visualViewportHeight) &&
    visualViewportHeight > 0
  ) {
    return Math.floor(visualViewportHeight);
  }
  return window.innerHeight || document.documentElement.clientHeight || 0;
};

const resolveMeasuredViewElement = (
  view: OfferSettingsView,
  activeElement: HTMLElement,
): HTMLElement => {
  if (view !== "billing") {
    return activeElement;
  }
  return (
    activeElement.querySelector<HTMLElement>(".ui-offer-billing-manager") ??
    activeElement
  );
};

export const useOfferSettingsViewportHeight = (
  params: UseOfferSettingsViewportHeightParams,
): void => {
  useVisibleTask$(({ track, cleanup }) => {
    const isOpen = track(() => params.isOpen.value);
    const view = track(() => params.activeView.value);
    const dialogElement = track(() => params.dialogRef.value);
    if (!isOpen || !dialogElement) {
      params.viewHeightPx.value = null;
      return;
    }

    const resolveActiveElement = (): HTMLElement | null => {
      return dialogElement.querySelector<HTMLElement>(
        `[data-offer-settings-view="${view}"]`,
      );
    };

    const updateHeight = () => {
      const activeElement = resolveActiveElement();
      if (!activeElement) {
        return;
      }
      const measuredElement = resolveMeasuredViewElement(view, activeElement);
      const measuredHeight = Math.ceil(measuredElement.scrollHeight);
      const panelElement = activeElement.closest(".ui-offer-settings-panel");
      const panelChromeHeight =
        panelElement instanceof HTMLElement
          ? resolveOfferSettingsPanelChromeHeight(panelElement)
          : 0;
      const nextHeight = resolveOfferSettingsViewportHeight({
        view,
        viewportHeight: resolveViewportHeight(),
        contentHeight: measuredHeight,
        panelChromeHeight,
      });
      if (
        params.viewHeightPx.value !== null &&
        Math.abs(params.viewHeightPx.value - nextHeight) < 2
      ) {
        return;
      }
      params.viewHeightPx.value = nextHeight;
    };

    updateHeight();
    const animationFrameId = window.requestAnimationFrame(updateHeight);
    const activeElement = resolveActiveElement();
    const resizeObserver =
      typeof ResizeObserver === "function" ? new ResizeObserver(updateHeight) : null;
    if (activeElement && resizeObserver) {
      const observedElements = [
        activeElement,
        resolveMeasuredViewElement(view, activeElement),
      ];
      const uniqueObservedElements = new Set(observedElements);
      for (const observedElement of uniqueObservedElements) {
        resizeObserver.observe(observedElement);
      }
    }

    window.addEventListener("resize", updateHeight, { passive: true });
    cleanup(() => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateHeight);
    });
  });
};
