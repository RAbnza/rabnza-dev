import { canUseExtendedMotion } from "./eligibility";
import { observeMotionPreference } from "./preferences";

interface ExtendedScrollOptions {
  render: () => void;
  reset: () => void;
  onEnable?: () => void;
  canEnhance?: () => boolean;
  observe?: HTMLElement[];
}

/** Own all listeners and styles for a reversible scroll enhancement. */
export function setupExtendedScrollMotion(
  root: HTMLElement,
  {
    render,
    reset,
    onEnable,
    canEnhance = () => true,
    observe = [],
  }: ExtendedScrollOptions,
) {
  let frameId = 0;
  let enhanced = false;
  let disposed = false;

  const update = () => {
    frameId = 0;
    if (disposed) return;

    const eligible = canUseExtendedMotion() && canEnhance();
    if (eligible !== enhanced) {
      enhanced = eligible;
      reset();
      if (enhanced) {
        root.dataset.enhanced = "true";
        onEnable?.();
      } else delete root.dataset.enhanced;
    }
    if (enhanced) render();
  };

  const scheduleUpdate = () => {
    if (!disposed && frameId === 0) {
      frameId = window.requestAnimationFrame(update);
    }
  };

  // Timelines can write initial styles during construction, even on mobile.
  reset();
  update();
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);
  const stopObservingPreference = observeMotionPreference(scheduleUpdate);

  const resizeObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleUpdate);
  new Set([root, root.parentElement, ...observe]).forEach((element) => {
    if (element) resizeObserver?.observe(element);
  });
  void document.fonts?.ready.then(scheduleUpdate);

  return {
    revert() {
      if (disposed) return;
      disposed = true;
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("pageshow", scheduleUpdate);
      stopObservingPreference();
      resizeObserver?.disconnect();
      delete root.dataset.enhanced;
      reset();
    },
  };
}
