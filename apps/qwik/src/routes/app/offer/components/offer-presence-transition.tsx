import {
  Slot,
  component$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

type OfferPresencePhase = "entering" | "entered" | "exiting";

interface OfferPresenceTransitionProps {
  class?: string;
  show: boolean;
}

export const OfferPresenceTransition =
  component$<OfferPresenceTransitionProps>(({ class: className, show }) => {
    const shouldRender = useSignal(show);
    const phase = useSignal<OfferPresencePhase>("entered");

    useVisibleTask$(({ track, cleanup }) => {
      const isVisible = track(() => show);

      let frameId: number | null = null;
      let exitTimeoutId: number | null = null;

      if (isVisible) {
        shouldRender.value = true;
        phase.value = "entering";
        frameId = window.requestAnimationFrame(() => {
          phase.value = "entered";
        });
      } else if (shouldRender.value) {
        phase.value = "exiting";
        exitTimeoutId = window.setTimeout(() => {
          shouldRender.value = false;
        }, 220);
      }

      cleanup(() => {
        if (frameId !== null) {
          window.cancelAnimationFrame(frameId);
        }
        if (exitTimeoutId !== null) {
          window.clearTimeout(exitTimeoutId);
        }
      });
    });

    if (!shouldRender.value) {
      return null;
    }

    return (
      <div
        class={[
          "ui-offer-presence-transition",
          `is-${phase.value}`,
          className,
        ]}
      >
        <Slot />
      </div>
    );
  });
