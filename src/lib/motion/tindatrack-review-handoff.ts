import { createTimeline } from "animejs";

import { canUseExtendedMotion } from "./eligibility";
import { createMotionScope } from "./scope";

export function setupTindaTrackReviewHandoff(root: HTMLElement) {
  const dark = root.querySelector<HTMLElement>("[data-review-handoff-dark]");

  const lavender = root.querySelector<HTMLElement>(
    "[data-review-handoff-lavender]",
  );

  const light = root.querySelector<HTMLElement>("[data-review-handoff-light]");

  const line = root.querySelector<HTMLElement>("[data-review-handoff-line]");

  if (!dark || !lavender || !light || !line) {
    return null;
  }

  const scope = createMotionScope(root, () => {
    let frameId = 0;
    let enhanced = false;

    const timeline = createTimeline({
      autoplay: false,
    })
      .add(
        lavender,
        {
          scaleY: [0, 1],
          duration: 360,
          ease: "linear",
        },
        80,
      )
      .add(
        dark,
        {
          opacity: [1, 0],
          duration: 260,
          ease: "linear",
        },
        300,
      )
      .add(
        light,
        {
          translateY: ["100%", "0%"],
          duration: 360,
          ease: "linear",
        },
        340,
      )
      .add(
        lavender,
        {
          opacity: [1, 0],
          duration: 220,
          ease: "linear",
        },
        500,
      );

    const clearAnimatedStyles = () => {
      [dark, lavender, light, line].forEach((element) => {
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

      const scrollDistance = root.offsetHeight - window.innerHeight * 0.3;

      if (scrollDistance <= 0) {
        return;
      }

      const progress = Math.min(Math.max(-rect.top / scrollDistance, 0), 1);

      timeline.seek(timeline.duration * progress, true);

      line.style.transform = `scaleX(${progress})`;
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
