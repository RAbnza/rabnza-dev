import { animate } from "animejs";
import { motionDurations, motionEasings, textDurations } from "./config";
import { textTargets } from "./targets";

type Pattern = keyof typeof textTargets;
type TextRecord = { element: HTMLElement; pattern: Pattern };

/** Ordinary text arrives once; scroll composition targets have a separate owner. */
export function setupTextReveals(seen: WeakSet<Element>, prepare: boolean) {
  const records = new Map<HTMLElement, TextRecord>();
  const running = new Map<HTMLElement, ReturnType<typeof animate>>();
  const originals = new Map<HTMLElement, string | null>();
  for (const [pattern, selector] of Object.entries(textTargets)) {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (records.has(element) || element.closest("[data-arrival]")) return;
      records.set(element, { element, pattern: pattern as Pattern });
      originals.set(element, element.getAttribute("style"));
      element.dataset.textMotion = pattern;
      element.dataset.motionPolicy = "once";
      if (!prepare) seen.add(element);
      element.dataset.textState = seen.has(element) ? "settled" : "pending";
    });
  }
  const restore = (element: HTMLElement) => {
    const style = originals.get(element);
    if (style == null) element.removeAttribute("style");
    else element.setAttribute("style", style);
  };
  const settle = (element: HTMLElement) => {
    running.get(element)?.cancel();
    running.delete(element);
    seen.add(element);
    element.dataset.textState = "settled";
    restore(element);
  };
  const play = ({ element, pattern }: TextRecord) => {
    if (seen.has(element)) return;
    seen.add(element);
    const mobile = matchMedia("(max-width: 47.99rem)").matches;
    const opening = !!element.closest("#home");
    const parameters: Parameters<typeof animate>[1] = {
      opacity: [1, 1],
      clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
      translateY: [mobile ? 6 : 10, 0],
      duration: opening
        ? motionDurations.reveal
        : textDurations[pattern === "hero" ? "title" : pattern],
      ease: motionEasings.reading,
      autoplay: false,
      onComplete: () => settle(element),
    };
    if (pattern === "hero")
      Object.assign(parameters, {
        clipPath: [
          "polygon(0 0, 100% 0, 100% 0, 0 18%)",
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        ],
        scale: [0.96, 1],
        transformOrigin: "0% 50%",
        duration: 1050,
      });
    if (pattern === "title" || pattern === "support")
      Object.assign(parameters, {
        clipPath: [
          pattern === "title" ? "inset(0 0 100% 0)" : "inset(0 100% 0 0)",
          "inset(0 0% 0% 0)",
        ],
      });
    // Labels and metadata never scale, rotate, float, or rearm on re-entry.
    if (pattern === "label" || pattern === "metadata") {
      parameters.translateY = [4, 0];
      parameters.clipPath = ["inset(0 100% 0 0)", "inset(0 0% 0 0)"];
    }
    const animation = animate(element, parameters);
    running.set(element, animation);
    element.dataset.textState = "running";
    animation.play();
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        if (
          element.closest("#home") &&
          document.documentElement.hasAttribute("data-intro") &&
          document.documentElement.dataset.heroReady !== "true"
        )
          continue;
        play(records.get(element)!);
        observer.unobserve(element);
      }
    },
    {
      rootMargin: `0px 0px -${Math.round(innerHeight * 0.12)}px 0px`,
      threshold: 0,
    },
  );
  records.forEach(({ element }) => {
    if (!seen.has(element)) observer.observe(element);
  });
  const open = () =>
    records.forEach((record) => {
      if (
        record.element.closest("#home") &&
        record.element.getBoundingClientRect().top < innerHeight
      ) {
        play(record);
        observer.unobserve(record.element);
      }
    });
  const focus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    records.forEach(({ element }) => {
      if (element.contains(target) || target.contains(element)) settle(element);
    });
  };
  document.addEventListener("portfolio:hero-ready", open);
  document.addEventListener("focusin", focus);
  return () => {
    observer.disconnect();
    document.removeEventListener("portfolio:hero-ready", open);
    document.removeEventListener("focusin", focus);
    records.forEach(({ element }) => {
      running.get(element)?.cancel();
      restore(element);
      delete element.dataset.textState;
      delete element.dataset.textMotion;
      delete element.dataset.motionPolicy;
    });
  };
}
