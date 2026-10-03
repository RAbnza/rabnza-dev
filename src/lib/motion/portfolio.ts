import { animate, createScope, createTimeline } from "animejs";
import { observeMotionPreference, shouldReduceMotion } from "./preferences";
import { motionDurations, motionEasings } from "./config";
import { setupOpening } from "./opening";
import { setupJourney } from "./journey";

/** Progressive enhancement: content is readable until this scope is ready. */
export function setupMotion(root: HTMLElement | null) {
  const stopOpening = setupOpening();
  let disposeScene = () => {};
  let disposed = false;
  const query = window.matchMedia("(min-width: 64rem) and (min-height: 45rem)");
  const mobileQuery = window.matchMedia("(max-width: 47.99rem)");
  const rebuild = () => {
    disposeScene();
    if (disposed || shouldReduceMotion()) return;
    const scope = createScope({ root: document.body });
    scope.add(() => {
      // Observer callbacks run after scope construction; own their animations explicitly.
      const reveals = new Set<ReturnType<typeof animate>>();
      const revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            revealObserver.unobserve(entry.target);
            // No pre-hidden content: even an interrupted import remains readable.
            const animation = animate(entry.target, {
              translateY: [12, 0],
              duration: motionDurations.reveal,
              ease: motionEasings.entrance,
              onComplete: () => {
                animation.revert();
                reveals.delete(animation);
              },
            });
            reveals.add(animation);
          }
        },
        { threshold: 0.08 },
      );
      document
        .querySelectorAll("[data-reveal]")
        .forEach((element) => revealObserver.observe(element));
      const stopStory = root && query.matches ? setupStory(root) : () => {};
      const stopJourney = setupJourney();
      return () => {
        revealObserver.disconnect();
        reveals.forEach((animation) => animation.revert());
        reveals.clear();
        stopStory();
        stopJourney();
      };
    });
    disposeScene = () => scope.revert();
  };
  const stopPreference = observeMotionPreference(rebuild);
  query.addEventListener("change", rebuild);
  mobileQuery.addEventListener("change", rebuild);
  rebuild();
  return () => {
    disposed = true;
    stopOpening();
    disposeScene();
    stopPreference();
    query.removeEventListener("change", rebuild);
    mobileQuery.removeEventListener("change", rebuild);
  };
}

function setupStory(root: HTMLElement) {
  const chapters = Array.from(
    root.querySelectorAll<HTMLElement>("[data-chapter]"),
  );
  const frames = Array.from(root.querySelectorAll<HTMLElement>("[data-frame]"));
  const links = Array.from(
    root.querySelectorAll<HTMLElement>("[data-chapter-link]"),
  );
  const fill = root.querySelector<HTMLElement>("[data-story-progress]")!;
  const light = root.querySelector<HTMLElement>("[data-story-light]")!;
  const stage = root.querySelector<HTMLElement>(".story-stage")!;
  if (chapters.length !== 3 || frames.length !== 3) return () => {};
  root.dataset.enhanced = "true";
  const timeline = createTimeline({ autoplay: false });
  for (let i = 0; i < 2; i++) {
    const at = i * 1000 + 350;
    timeline.add(
      frames[i]!,
      { opacity: [1, 0], translateY: [0, -12], duration: 300, ease: "linear" },
      at,
    );
    timeline.add(
      frames[i + 1]!,
      { opacity: [0, 1], translateY: [12, 0], duration: 300, ease: "linear" },
      at,
    );
  }
  timeline.add(
    light,
    { opacity: [1, 0.25], duration: 2000, ease: "linear" },
    0,
  );
  let positions: number[] = [];
  let near = true;
  let frameId = 0;
  let alive = true;
  let lastProgress = -1;
  let fits = true;
  const render = () => {
    frameId = 0;
    if (!alive || !near || document.hidden || !fits || positions.length !== 3)
      return;
    const y = window.scrollY;
    const segment = y < positions[1]! ? 0 : 1;
    const fraction = Math.max(
      0,
      Math.min(
        1,
        (y - positions[segment]!) /
          Math.max(1, positions[segment + 1]! - positions[segment]!),
      ),
    );
    const progress = segment + fraction;
    if (progress === lastProgress) return;
    lastProgress = progress;
    timeline.seek(progress * 1000, true);
    fill.style.transform = `scaleX(${progress / 2})`;
    const active = Math.min(2, Math.floor(progress + 0.35));
    links.forEach((link, index) =>
      index === active
        ? link.setAttribute("aria-current", "step")
        : link.removeAttribute("aria-current"),
    );
  };
  const schedule = () => {
    if (near && !frameId && !document.hidden)
      frameId = requestAnimationFrame(render);
  };
  const measure = () => {
    if (!alive) return;
    // Geometry is cached only on layout changes, never read on scroll ticks.
    root.dataset.enhanced = "true";
    const fontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    fits =
      stage.offsetHeight + 200 <= window.innerHeight &&
      window.innerWidth >= 64 * fontSize &&
      window.innerHeight >= 45 * fontSize;
    if (!fits) delete root.dataset.enhanced;
    const header =
      document.querySelector(".site-header")?.getBoundingClientRect().height ??
      80;
    positions = chapters.map(
      (chapter) =>
        chapter.getBoundingClientRect().top + window.scrollY - header - 24,
    );
    lastProgress = -1;
    schedule();
  };
  const observer = new IntersectionObserver(
    (entries) => {
      near = entries[0]!.isIntersecting;
      if (near) schedule();
    },
    { rootMargin: "200px" },
  );
  observer.observe(root);
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.body);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure);
  window.addEventListener("pageshow", measure);
  document.addEventListener("visibilitychange", schedule);
  void document.fonts.ready.then(measure);
  measure();
  return () => {
    alive = false;
    cancelAnimationFrame(frameId);
    observer.disconnect();
    resizeObserver.disconnect();
    timeline.revert();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    window.removeEventListener("pageshow", measure);
    document.removeEventListener("visibilitychange", schedule);
    delete root.dataset.enhanced;
    fill.style.removeProperty("transform");
    links.forEach((link) => link.removeAttribute("aria-current"));
  };
}
