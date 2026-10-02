import { createTimeline } from "animejs";

import { setupExtendedScrollMotion } from "./extended-scroll";
import { createMotionScope } from "./scope";

export function setupTindaTrackSequence(root: HTMLElement) {
  const sellCopy = root.querySelector<HTMLElement>("[data-sequence-sell-copy]");

  const sellMedia = root.querySelector<HTMLElement>(
    "[data-sequence-sell-media]",
  );

  const receipt = root.querySelector<HTMLElement>("[data-sequence-receipt]");

  const trackCopy = root.querySelector<HTMLElement>(
    "[data-sequence-track-copy]",
  );

  const trackMedia = root.querySelector<HTMLElement>(
    "[data-sequence-track-media]",
  );

  const darkEnvironment = root.querySelector<HTMLElement>(
    "[data-sequence-dark]",
  );

  const lavenderBridge = root.querySelector<HTMLElement>(
    "[data-sequence-bridge]",
  );

  const progressFill = root.querySelector<HTMLElement>(
    "[data-sequence-progress-fill]",
  );

  if (
    !sellCopy ||
    !sellMedia ||
    !trackCopy ||
    !trackMedia ||
    !darkEnvironment ||
    !lavenderBridge
  ) {
    return null;
  }

  const stage = root.querySelector<HTMLElement>("[data-sequence-stage]");
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>("[data-sequence-panel]"),
  );
  const layouts = Array.from(
    root.querySelectorAll<HTMLElement>("[data-sequence-layout]"),
  );
  if (!stage || panels.length !== 2 || layouts.length !== 2) return null;

  const scope = createMotionScope(root, () => {
    const timeline = createTimeline({
      autoplay: false,
    })
      .add(
        sellCopy,
        {
          opacity: [1, 0],
          translateY: [0, -20],
          duration: 300,
          ease: "linear",
        },
        180,
      )
      .add(
        sellMedia,
        {
          opacity: [1, 0],
          translateY: [0, -28],
          scale: [1, 0.988],
          duration: 360,
          ease: "linear",
        },
        200,
      )
      .add(
        lavenderBridge,
        {
          scaleX: [0, 1],
          duration: 260,
          ease: "linear",
        },
        300,
      )
      .add(
        darkEnvironment,
        {
          opacity: [0, 1],
          duration: 240,
          ease: "linear",
        },
        500,
      )
      .add(
        lavenderBridge,
        {
          opacity: [1, 0],
          duration: 180,
          ease: "linear",
        },
        560,
      )
      .add(
        trackCopy,
        {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 320,
          ease: "linear",
        },
        610,
      )
      .add(
        trackMedia,
        {
          opacity: [0, 1],
          translateY: [28, 0],
          scale: [0.988, 1],
          duration: 360,
          ease: "linear",
        },
        640,
      );

    if (receipt) {
      timeline.add(
        receipt,
        {
          opacity: [1, 0],
          translateY: [0, -14],
          scale: [1, 0.95],
          duration: 240,
          ease: "linear",
        },
        180,
      );
    }

    const clearAnimatedStyles = () => {
      const elements = [
        sellCopy,
        sellMedia,
        receipt,
        trackCopy,
        trackMedia,
        darkEnvironment,
        lavenderBridge,
      ].filter((element): element is HTMLElement => Boolean(element));

      elements.forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
      });

      if (progressFill) {
        progressFill.style.removeProperty("transform");
      }

      delete root.dataset.phase;
    };

    const controller = setupExtendedScrollMotion(root, {
      observe: layouts,
      // Re-seeking a completed child may skip its writes. Restore the whole
      // timeline when re-entering desktop mode after fallback styles cleared.
      onEnable: () => timeline.reset(),
      canEnhance() {
        // Fall back to normal sections when text, zoom or media cannot fit.
        const height =
          root.dataset.enhanced === "true"
            ? stage.getBoundingClientRect().height
            : window.innerHeight;
        return panels.every((panel, index) => {
          const styles = window.getComputedStyle(panel);
          const copy = index === 0 ? sellCopy : trackCopy;
          const media = index === 0 ? sellMedia : trackMedia;
          const mediaStyles = window.getComputedStyle(media);
          // The receipt joins normal flow in the fallback, but overlays the
          // sell image in the stage. Measure the stage's intended content.
          const receiptHeight =
            index === 0 && root.dataset.enhanced !== "true"
              ? (receipt?.offsetHeight ?? 0)
              : 0;
          const mediaHeight =
            media.scrollHeight -
            receiptHeight -
            parseFloat(mediaStyles.paddingTop) -
            parseFloat(mediaStyles.paddingBottom);
          const required =
            Math.max(copy.scrollHeight, mediaHeight) +
            parseFloat(styles.paddingTop) +
            parseFloat(styles.paddingBottom) +
            48;
          return required <= height;
        });
      },
      render() {
        const rect = root.getBoundingClientRect();
        const distance = rect.height - stage.getBoundingClientRect().height;
        if (distance <= 0) return;
        const progress = Math.min(Math.max(-rect.top / distance, 0), 1);
        timeline.seek(timeline.duration * progress, true);
        root.dataset.phase = progress < 0.55 ? "sell" : "track";
        if (progressFill) progressFill.style.transform = `scaleX(${progress})`;
      },
      reset: clearAnimatedStyles,
    });

    return () => controller.revert();
  });

  return scope;
}
