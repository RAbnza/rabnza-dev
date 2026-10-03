import { animate, createTimeline } from "animejs";
import { motionEasings } from "./config";

/** One measured scroll pass for the non-sticky parts of the narrative. */
export function setupJourney() {
  const scenes: Array<{
    element: HTMLElement;
    timeline: ReturnType<typeof createTimeline>;
    start: number;
    distance: number;
    last: number;
  }> = [];
  const add = (
    selector: string,
    build: (
      timeline: ReturnType<typeof createTimeline>,
      element: HTMLElement,
    ) => void,
  ) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return;
    const timeline = createTimeline({ autoplay: false });
    build(timeline, element);
    scenes.push({ element, timeline, start: 0, distance: 1, last: -1 });
  };
  const mobile = window.matchMedia("(max-width: 47.99rem)").matches;
  add("#about", (timeline, element) => {
    const line = element.querySelector("[data-thread-line]");
    if (line)
      timeline.add(
        line,
        {
          [mobile ? "scaleX" : "scaleY"]: [0, 1],
          duration: 1000,
          ease: "linear",
        },
        0,
      );
  });
  add("#capabilities", (timeline, element) => {
    element.querySelectorAll("[data-capability]").forEach((card, i) =>
      timeline.add(
        card,
        {
          translateY: [mobile ? 12 : 32, 0],
          duration: 600,
          ease: motionEasings.entrance,
        },
        i * 150,
      ),
    );
  });
  add(".work-bridge", (timeline, element) => {
    timeline.add(
      element.querySelector("[data-environment-light]")!,
      { opacity: [1, 0], scaleY: [1, 0.5], duration: 1000, ease: "linear" },
      0,
    );
  });
  add("#more-work", (timeline, element) => {
    element.querySelectorAll(".project-image-link").forEach((card, i) =>
      timeline.add(
        card,
        {
          translateY: [mobile ? 8 : 24 + i * 12, 0],
          duration: 800,
          ease: motionEasings.entrance,
        },
        i * 100,
      ),
    );
  });
  add("#contact", (timeline, element) => {
    timeline.add(
      element.querySelector("[data-contact-orbit]")!,
      { scale: [0.8, 1], translateY: [24, 0], duration: 1000, ease: "linear" },
      0,
    );
  });
  const rail = document.querySelector<HTMLElement>("[data-reading-progress]");
  let maxScroll = 1;
  let frame = 0;
  let alive = true;
  const update = () => {
    frame = 0;
    if (!alive || document.hidden) return;
    const y = window.scrollY;
    if (rail)
      rail.style.transform = `scaleX(${Math.min(1, Math.max(0, y / maxScroll))})`;
    for (const scene of scenes) {
      const progress = Math.min(
        1,
        Math.max(0, (y - scene.start) / scene.distance),
      );
      if (progress === scene.last) continue;
      scene.last = progress;
      scene.timeline.seek(progress * scene.timeline.duration, true);
    }
  };
  const schedule = () => {
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  };
  const measure = () => {
    if (!alive) return;
    maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    for (const scene of scenes) {
      const rect = scene.element.getBoundingClientRect();
      scene.start = rect.top + window.scrollY - window.innerHeight * 0.88;
      scene.distance = Math.min(rect.height, window.innerHeight * 0.9);
      scene.last = -1;
    }
    schedule();
  };
  const observer = new ResizeObserver(measure);
  observer.observe(document.body);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("pageshow", measure);
  document.addEventListener("visibilitychange", schedule);
  void document.fonts.ready.then(measure);
  measure();
  const pageHeader = document.querySelector(".page-heading");
  const entry = pageHeader
    ? animate(pageHeader, {
        translateY: [10, 0],
        duration: 400,
        ease: motionEasings.entrance,
      })
    : undefined;
  return () => {
    alive = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    window.removeEventListener("pageshow", measure);
    document.removeEventListener("visibilitychange", schedule);
    scenes.forEach((scene) => scene.timeline.revert());
    entry?.revert();
    rail?.style.removeProperty("transform");
  };
}
