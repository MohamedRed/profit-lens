import { type QRL, type Signal, useVisibleTask$ } from "@builder.io/qwik";
import { type I18nStore, t } from "../../../../lib/i18n/i18n-context";
import type { VehicleProfile } from "../../../../lib/types/vehicle";
import { stageOfferScreenshotFile } from "../offer-file-transfer-store";

interface UseOfferFileImportParams {
  captureFileInputRef: Signal<HTMLInputElement | undefined>;
  fileImportInFlight: Signal<boolean>;
  i18n: I18nStore;
  importFileInputRef: Signal<HTMLInputElement | undefined>;
  loading: Signal<boolean>;
  onImportScreenshotFile$: QRL<(fileToken: string) => Promise<void>>;
  selectedVehicleId: Signal<string>;
  status: Signal<string>;
  vehicles: Signal<VehicleProfile[]>;
}

const readSelectedFileWithRetry = async (
  element: HTMLInputElement,
): Promise<File | null> => {
  let file = element.files?.item(0) ?? null;
  let attempt = 0;
  while (!file && attempt < 4) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 120);
    });
    file = element.files?.item(0) ?? null;
    attempt += 1;
  }
  return file;
};

export const useOfferFileImport = (params: UseOfferFileImportParams): void => {
  const {
    captureFileInputRef,
    fileImportInFlight,
    i18n,
    importFileInputRef,
    loading,
    onImportScreenshotFile$,
    selectedVehicleId,
    status,
    vehicles,
  } = params;

  useVisibleTask$(({ track, cleanup }) => {
    track(() => loading.value);
    track(() => selectedVehicleId.value);
    track(() => vehicles.value.length);
    track(() => fileImportInFlight.value);

    const handleFileInputElement = async (
      element: HTMLInputElement,
    ): Promise<void> => {
      if (fileImportInFlight.value) {
        return;
      }
      fileImportInFlight.value = true;
      const file = await readSelectedFileWithRetry(element);
      if (!file) {
        fileImportInFlight.value = false;
        return;
      }
      status.value = t(
        i18n,
        "offerScreenshotSelectedMessage",
        "Screenshot selected. Preparing analysis...",
      );
      try {
        const fileToken = stageOfferScreenshotFile(file);
        await onImportScreenshotFile$(fileToken);
      } catch {
        status.value = t(
          i18n,
          "offerActionFailedMessage",
          "Unable to complete this action right now. Please try again.",
        );
      } finally {
        element.value = "";
        fileImportInFlight.value = false;
      }
    };

    const cleanups: Array<() => void> = [];
    const register = (element: HTMLInputElement | undefined) => {
      if (!element) {
        return;
      }
      const onInput = () => {
        void handleFileInputElement(element);
      };
      const onChange = () => {
        void handleFileInputElement(element);
      };
      element.addEventListener("input", onInput);
      element.addEventListener("change", onChange);
      cleanups.push(() => {
        element.removeEventListener("input", onInput);
        element.removeEventListener("change", onChange);
      });
    };

    register(importFileInputRef.value);
    register(captureFileInputRef.value);

    cleanup(() => {
      cleanups.forEach((runCleanup) => {
        runCleanup();
      });
    });
  });
};
