import { createTimeline } from "animejs";

import { canUseExtendedMotion } from "./eligibility";
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

  const scope = createMotionScope(root, () => {
    let frameId = 0;
    let enhanced = false;

    const timeline = createTimeline({
      autoplay: false,
    })
      .add(
        sellCopy,
        {
          opacity: [1, 0],
          translateY: [0, -24],
          duration: 320,
          ease: "linear",
        },
        180,
      )
      .add(
        sellMedia,
        {
          opacity: [1, 0],
          translateY: [0, -32],
          scale: [1, 0.985],
          duration: 380,
          ease: "linear",
        },
        200,
      )
      .add(
        lavenderBridge,
        {
          opacity: [0, 1],
          duration: 260,
          ease: "linear",
        },
        260,
      )
      .add(
        darkEnvironment,
        {
          opacity: [0, 1],
          duration: 360,
          ease: "linear",
        },
        400,
      )
      .add(
        lavenderBridge,
        {
          opacity: [1, 0],
          duration: 280,
          ease: "linear",
        },
        520,
      )
      .add(
        trackCopy,
        {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 360,
          ease: "linear",
        },
        500,
      )
      .add(
        trackMedia,
        {
          opacity: [0, 1],
          translateY: [32, 0],
          scale: [0.985, 1],
          duration: 420,
          ease: "linear",
        },
        540,
      );

    if (receipt) {
      timeline.add(
        receipt,
        {
          opacity: [1, 0],
          translateY: [0, -18],
          scale: [1, 0.96],
          duration: 260,
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
    };

    const update = () => {
      frameId = 0;

      if (!enhanced) {
        return;
      }

      const rect = root.getBoundingClientRect();

      const scrollDistance = root.offsetHeight - window.innerHeight;

      if (scrollDistance <= 0) {
        return;
      }

      const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);

      timeline.seek(timeline.duration * progress, true);

      if (progressFill) {
        progressFill.style.transform = `scaleX(${progress})`;
      }
    };

    const scheduleUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(update);
    };

    const enable = () => {
      if (enhanced) {
        return;
      }

      enhanced = true;

      root.dataset.enhanced = "true";

      update();
    };

    const disable = () => {
      if (!enhanced) {
        return;
      }

      enhanced = false;

      delete root.dataset.enhanced;

      clearAnimatedStyles();
    };

    const syncEligibility = () => {
      if (canUseExtendedMotion()) {
        enable();
      } else {
        disable();
      }
    };

    const handleResize = () => {
      syncEligibility();
      scheduleUpdate();
    };

    syncEligibility();

    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });

    window.addEventListener("resize", handleResize);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", scheduleUpdate);

      window.removeEventListener("resize", handleResize);

      delete root.dataset.enhanced;

      clearAnimatedStyles();
    };
  });

  return scope;
}
