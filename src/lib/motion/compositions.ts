import { createTimeline, type AnimationParams } from "animejs";
import { motionEasings } from "./config";

/** Introductions scrub forward once. The journey/stage retain reversible storytelling. */
export function setupCompositions(
  progress: WeakMap<HTMLElement, number>,
  prepare: boolean,
) {
  const mobile = matchMedia("(max-width: 47.99rem)").matches;
  const scenes = [
    ...document.querySelectorAll<HTMLElement>("[data-journey]"),
  ].flatMap((element) => {
    const parts = [...element.querySelectorAll<HTMLElement>("[data-arrival]")];
    if (!parts.length) return [];
    const timeline = createTimeline({
      autoplay: false,
      defaults: { ease: motionEasings.scrub },
    });
    const originals = parts.map((part) => part.getAttribute("style"));
    const windows = new Map<HTMLElement, { at: number; duration: number }>();
    for (const part of parts) {
      const kind = part.dataset.arrival;
      const work = element.id === "work";
      const [at, duration] =
        kind === "label"
          ? [0, 240]
          : kind === "title"
            ? [80, work ? 850 : 620]
            : kind === "body"
              ? [260, 500]
              : kind === "action"
                ? [540, 340]
                : kind === "navigation"
                  ? [620, 300]
                  : [700, 300];
      windows.set(part, { at, duration });
      part.dataset.textMotion = kind!;
      part.dataset.motionPolicy = "scroll-once";
      part.dataset.textState = "pending";
      const params: AnimationParams = {
        opacity: kind === "visual" ? [0, 1] : [1, 1],
        clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
        translateY: [kind === "label" ? 4 : mobile ? 10 : 20, 0],
        duration,
      };
      if (kind === "title") {
        const mask =
          element.id === "work"
            ? "inset(0 100% 0 0)"
            : element.id === "contact"
              ? "inset(100% 0 0 0)"
              : element.id === "more-work"
                ? "inset(0 12% 0 12%)"
                : "inset(0 0 100% 0)";
        Object.assign(params, {
          clipPath: [mask, "inset(0% 0% 0% 0%)"],
          transformOrigin: "0% 50%",
        });
        if (element.id === "capabilities") params.scale = [0.94, 1];
      }
      if (kind === "visual") {
        params.scale = [0.96, 1];
        delete params.clipPath;
      }
      timeline.add(part, params, at);
    }
    return [
      {
        element,
        parts,
        originals,
        windows,
        timeline,
        start: 0,
        end: 1,
        bottom: 1,
        last: -1,
        value: prepare ? (progress.get(element) ?? 0) : 1,
      },
    ];
  });
  let frame = 0;
  let alive = true;
  const update = () => {
    frame = 0;
    if (!alive) return;
    for (const scene of scenes) {
      const raw = Math.max(
        0,
        Math.min(
          1,
          (scrollY - scene.start) / Math.max(1, scene.end - scene.start),
        ),
      );
      scene.value = Math.max(scene.value, raw);
      progress.set(scene.element, scene.value);
      scene.element.dataset.sectionState =
        scrollY > scene.bottom - innerHeight * 0.6
          ? "handoff"
          : scrollY > scene.end + innerHeight * 0.2
            ? "progression"
            : raw >= 1
              ? "established"
              : raw > 0
                ? "introduction"
                : "approaching";
      if (scene.value === scene.last) continue;
      scene.last = scene.value;
      scene.timeline.seek(scene.value * scene.timeline.duration, true);
      scene.parts.forEach((part) => {
        const { at, duration } = scene.windows.get(part)!;
        const time = scene.value * scene.timeline.duration;
        part.dataset.textState =
          time >= at + duration
            ? "settled"
            : time <= at
              ? "pending"
              : "running";
      });
    }
  };
  const schedule = () => {
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  };
  const flowTop = (element: HTMLElement) => {
    let top = 0;
    for (
      let node: HTMLElement | null = element;
      node;
      node = node.offsetParent as HTMLElement | null
    )
      top += node.offsetTop;
    return top;
  };
  const measure = () => {
    if (!alive) return;
    const header =
      document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 80;
    const available = innerHeight - header;
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    const sticky = [
      ...document.querySelectorAll<HTMLElement>(
        ".about-statement, .story-stage",
      ),
    ].map((element) => ({ element, position: element.style.position }));
    sticky.forEach(({ element }) => {
      element.style.position = "relative";
    });
    for (const scene of scenes) {
      const { element } = scene;
      const first = scene.parts[0]!;
      const start = flowTop(first) - header - available * 0.94;
      let anchor: HTMLElement;
      let depth: number;
      let band = mobile ? 0.74 : 0.64;
      if (element.id === "work") {
        const enhanced = element.hasAttribute("data-enhanced");
        // Desktop settles with the first screen entering; stacked layouts settle
        // the introduction at the chapter navigation, then reveal each screen in flow.
        anchor = element.querySelector<HTMLElement>(
          enhanced ? ".story-stage" : ".chapter-nav",
        )!;
        depth = enhanced
          ? Math.min(120, anchor.offsetHeight * 0.25)
          : anchor.offsetHeight;
        band = enhanced ? 0.86 : 0.8;
      } else {
        const selector =
          element.id === "about"
            ? ".about-copy .lead"
            : element.id === "capabilities"
              ? ".capability-grid"
              : element.id === "more-work"
                ? ".project-grid"
                : ".contact-copy > p:not(.eyebrow)";
        anchor = element.querySelector<HTMLElement>(selector)!;
        depth =
          element.id === "about" || element.id === "contact"
            ? anchor.offsetHeight
            : mobile
              ? 70
              : 140;
      }
      scene.start = Math.max(0, start);
      scene.end = Math.min(
        maxScroll,
        Math.max(
          scene.start + available * 0.5,
          flowTop(anchor) + depth - header - available * band,
        ),
      );
      scene.bottom = flowTop(element) + element.offsetHeight;
      // Rebuilds use the stored forward progress, never reset an established intro.
      scene.last = -1;
    }
    sticky.forEach(({ element, position }) => {
      if (position) element.style.position = position;
      else element.style.removeProperty("position");
    });
    // Seek before removing the pre-paint gate, including restored/deep-linked scroll.
    update();
  };
  const focus = (event: FocusEvent) => {
    const target = event.target as Node;
    for (const scene of scenes)
      if (scene.parts.some((part) => part.contains(target))) scene.value = 1;
    update();
  };
  const resize = new ResizeObserver(measure);
  resize.observe(document.body);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("pageshow", measure);
  document.addEventListener("visibilitychange", schedule);
  document.addEventListener("focusin", focus);
  void document.fonts.ready.then(measure);
  measure();
  return () => {
    alive = false;
    cancelAnimationFrame(frame);
    resize.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    window.removeEventListener("pageshow", measure);
    document.removeEventListener("visibilitychange", schedule);
    document.removeEventListener("focusin", focus);
    scenes.forEach(({ element, timeline, parts, originals }) => {
      timeline.revert();
      delete element.dataset.sectionState;
      parts.forEach((part, i) => {
        const style = originals[i];
        if (style == null) part.removeAttribute("style");
        else part.setAttribute("style", style);
        delete part.dataset.textMotion;
        delete part.dataset.motionPolicy;
        delete part.dataset.textState;
      });
    });
  };
}
