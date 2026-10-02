import { createTimeline } from "animejs";

import { canUseExtendedMotion } from "./eligibility";
import { createMotionScope } from "./scope";

export function setupTindaTrackReviewHandoff(
  root: HTMLElement,
) {
  const lavender = root.querySelector<HTMLElement>(
    "[data-review-handoff-lavender]",
  );

  const light = root.querySelector<HTMLElement>(
    "[data-review-handoff-light]",
  );

  if (!lavender || !light) {
    return null;
  }

  const scope = createMotionScope(root, () => {
    let frameId = 0;
    let enhanced = false;

    const timeline = createTimeline({
      autoplay: false,
    })
      .add(
        light,
        {
          translateY: ["100%", "0%"],
          duration: 500,
          ease: "linear",
        },
        120,
      )
      .add(
        lavender,
        {
          opacity: [1, 0],
          duration: 260,
          ease: "linear",
        },
        360,
      );

    const clearAnimatedStyles = () => {
      [lavender, light].forEach((element) => {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
      });
    };

    const update = () => {
      frameId = 0;

      if (!enhanced) {
        return;
      }

      const rect = root.getBoundingClientRect();

      const viewportProgress =
        (window.innerHeight - rect.top) /
        (window.innerHeight + root.offsetHeight);

      const progress = Math.min(
        Math.max(viewportProgress, 0),
        1,
      );

      timeline.seek(
        timeline.duration * progress,
        true,
      );
    };

    const scheduleUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId =
        window.requestAnimationFrame(update);
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

    window.addEventListener(
      "scroll",
      scheduleUpdate,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener(
        "scroll",
        scheduleUpdate,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );

      delete root.dataset.enhanced;

      clearAnimatedStyles();
    };
  });

  return scope;
}