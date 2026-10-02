import { animate } from "animejs";

import { motionDurations, motionEasings } from "./config";
import { canUseExtendedMotion } from "./eligibility";
import { observeMotionPreference, shouldReduceMotion } from "./preferences";

export function setupCaseStudyMotion(root: HTMLElement) {
  if (shouldReduceMotion() || typeof IntersectionObserver === "undefined") {
    return null;
  }

  const targets = Array.from(
    root.querySelectorAll<HTMLElement>(
      "[data-case-study-chapter] [data-chapter-copy], [data-case-study-chapter] [data-chapter-media]",
    ),
  );
  if (targets.length === 0) return null;

  const pending = new Set(targets);
  const animations = new Set<ReturnType<typeof animate>>();
  let disposed = false;

  const clearStyles = (element: HTMLElement) => {
    element.style.removeProperty("opacity");
    element.style.removeProperty("transform");
  };

  const reveal = (element: HTMLElement) => {
    if (disposed || !pending.delete(element)) return;
    observer.unobserve(element);
    const animation = animate(element, {
      opacity: 1,
      translateY: 0,
      duration: motionDurations.chapter,
      ease: motionEasings.entrance,
      onComplete: () => {
        animations.delete(animation);
        clearStyles(element);
      },
    });
    animations.add(animation);
  };

  // Observe each content block, not the whole chapter: a tall gallery may
  // never reach a percentage threshold relative to its complete height.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -5% 0px" },
  );

  const showAll = () => {
    observer.disconnect();
    animations.forEach((animation) => animation.revert());
    animations.clear();
    pending.clear();
    targets.forEach(clearStyles);
  };

  targets.forEach((element) => {
    const rect = element.getBoundingClientRect();
    // Leave restored scroll positions and already-visible content readable.
    if (
      (rect.top < window.innerHeight && rect.bottom > 0) ||
      rect.bottom <= 0
    ) {
      pending.delete(element);
      return;
    }
    element.style.opacity = "0";
    element.style.transform = `translateY(${canUseExtendedMotion() ? 20 : 12}px)`;
    observer.observe(element);
  });

  const stopObservingPreference = observeMotionPreference(() => {
    if (shouldReduceMotion()) showAll();
  });

  return {
    revert() {
      if (disposed) return;
      disposed = true;
      stopObservingPreference();
      showAll();
    },
  };
}
