import { animate, createTimeline, stagger } from "animejs";
import { shouldReduceMotion, observeMotionPreference } from "./preferences";
import { motionDurations, motionEasings } from "./config";

/** A finite brand sequence, never a pretend download meter or scroll lock. */
export function setupOpening() {
  const root = document.documentElement;
  const overlay = document.querySelector<HTMLElement>("[data-startup]");
  let intro: ReturnType<typeof createTimeline> | undefined;
  let watchdog = 0;
  let finished = false;
  const events = new AbortController();
  const releaseHero = () => {
    if (root.dataset.heroReady === "true") return;
    root.dataset.heroReady = "true";
    document.dispatchEvent(new Event("portfolio:hero-ready"));
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    events.abort();
    releaseHero();
    root.removeAttribute("data-intro");
    // Completion is not teardown: rewinding here resets visible text to its start.
    intro?.cancel();
    document.dispatchEvent(new Event("portfolio:opening-complete"));
  };
  if (overlay && root.hasAttribute("data-intro") && !shouldReduceMotion()) {
    root.dataset.intro = "playing";
    const compact =
      window.innerWidth < 768 || root.dataset.returning === "true";
    const hold = compact ? 1150 : motionDurations.loader;
    intro = createTimeline({
      autoplay: false,
      onComplete: finish,
      defaults: { ease: motionEasings.entrance },
    })
      .add(
        "[data-loader-plane]",
        {
          translateY: (_: unknown, i = 0) => [90 - i * 75, (i - 1) * 18],
          translateX: (_: unknown, i = 0) => [(i - 1) * 100, (i - 1) * 24],
          rotate: (_: unknown, i = 0) => [(i - 1) * 38, -24],
          scale: [0.65, 1],
          opacity: [0, 1],
          duration: 1000,
          delay: stagger(100),
        },
        0,
      )
      .add(
        ".startup-mark",
        { opacity: [0, 1], scale: [0.8, 1], duration: 650 },
        450,
      )
      .add(
        ".startup-signature",
        { opacity: [0, 1], translateY: [10, 0], duration: 500 },
        550,
      )
      .add(
        ".startup-center",
        { opacity: [1, 0], scale: [1, 1.16], duration: 400 },
        hold,
      )
      .add(
        ".startup-atmosphere",
        { scale: [0.6, 1.4], opacity: [0.3, 0.7], duration: hold + 1100 },
        0,
      )
      .add(".intro-scene", { opacity: [0, 1], duration: 100 }, hold + 200)
      .add(
        ".intro-kicker, .intro-note",
        { opacity: [0, 1], translateY: [8, 0], duration: 650 },
        hold + 300,
      )
      .add(
        "[data-intro-phrase]",
        {
          translateY: ["110%", "0%"],
          rotate: [3, 0],
          duration: 850,
          delay: stagger(190),
        },
        hold + 250,
      )
      .add(
        ".intro-scene",
        { translateY: [0, -24], opacity: [1, 0], duration: 450 },
        hold + 1600,
      )
      .add(
        overlay,
        {
          clipPath: ["inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"],
          duration: 850,
        },
        hold + 1780,
      )
      .call(releaseHero, hold + 1780);
    intro.play();
    watchdog = window.setTimeout(finish, 6200);
  } else finish();
  const skip = document.querySelector("[data-skip-intro]");
  skip?.addEventListener("click", finish, { signal: events.signal });
  const onKey = () => {
    if (root.hasAttribute("data-intro")) finish();
  };
  document.addEventListener("keydown", onKey, { signal: events.signal });
  window.addEventListener("hashchange", finish, { signal: events.signal });
  document.addEventListener("portfolio:skip-opening", finish, {
    signal: events.signal,
  });
  // Scrolling is always native. An intentional scroll also dismisses the opening.
  const onScroll = () => {
    if (window.scrollY > 30) finish();
  };
  window.addEventListener("scroll", onScroll, {
    passive: true,
    signal: events.signal,
  });

  const choices = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-identity-choice]"),
  );
  const layers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-identity-layer]"),
  );
  const caption = document.querySelector<HTMLElement>(
    "[data-identity-caption]",
  );
  const descriptions = [
    "Interfaces that make the next step clear.",
    "Logic that gives every action a reason.",
    "Data that keeps the whole picture connected.",
  ];
  document.querySelector(".identity-controls")?.removeAttribute("hidden");
  const animations = new Set<ReturnType<typeof animate>>();
  let selected = 0;
  const render = (index: number) => {
    selected = index;
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    const spread = window.innerWidth < 360 ? 28 : 42;
    layers.forEach((layer, i) => {
      const order = (i - index + 3) % 3;
      const x = (order - 1) * spread;
      const y = order * 24 - 12;
      const rotation = (order - 1) * 7;
      layer.style.zIndex = String(3 - order);
      if (shouldReduceMotion())
        layer.style.transform = `translate(${x}px,${y}px) rotate(${rotation}deg)`;
      else {
        const animation = animate(layer, {
          translateX: x,
          translateY: y,
          rotate: rotation,
          duration: 420,
          ease: motionEasings.entrance,
          onComplete: () => animations.delete(animation),
        });
        animations.add(animation);
      }
    });
    choices.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    if (caption) caption.textContent = descriptions[index]!;
  };
  const handlers = choices.map((button, index) => {
    const handler = () => render(index);
    button.addEventListener("click", handler);
    return () => button.removeEventListener("click", handler);
  });
  const stopPreference = observeMotionPreference(() => {
    if (shouldReduceMotion()) finish();
    render(selected);
  });
  return () => {
    finish();
    intro?.revert();
    handlers.forEach((stop) => stop());
    animations.forEach((animation) => animation.revert());
    layers.forEach((layer) => {
      layer.style.removeProperty("transform");
      layer.style.removeProperty("z-index");
    });
    stopPreference();
    skip?.removeEventListener("click", finish);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("hashchange", finish);
    document.removeEventListener("portfolio:skip-opening", finish);
    window.removeEventListener("scroll", onScroll);
  };
}
