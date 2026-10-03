import { animate, createTimeline } from "animejs";
import { shouldReduceMotion, observeMotionPreference } from "./preferences";
import { motionEasings } from "./config";

/** A short brand greeting, never a resource-download gate. */
export function setupOpening() {
  const root = document.documentElement;
  const overlay = document.querySelector<HTMLElement>("[data-startup]");
  let intro: ReturnType<typeof createTimeline> | undefined;
  const finish = () => {
    root.removeAttribute("data-intro");
    intro?.revert();
  };
  if (overlay && root.hasAttribute("data-intro") && !shouldReduceMotion()) {
    const duration = root.dataset.returning === "true" ? 320 : 620;
    intro = createTimeline({ onComplete: finish })
      .add(
        "[data-intro-line]",
        {
          scaleX: [0, 1],
          duration: duration * 0.65,
          ease: motionEasings.state,
        },
        0,
      )
      .add(
        ".startup-mark",
        {
          translateY: [8, 0],
          opacity: [0.5, 1],
          duration: duration * 0.55,
          ease: motionEasings.entrance,
        },
        0,
      )
      .add(
        overlay,
        {
          opacity: [1, 0],
          duration: duration * 0.35,
          ease: motionEasings.state,
        },
        duration * 0.65,
      );
  } else finish();
  const skip = document.querySelector("[data-skip-intro]");
  skip?.addEventListener("click", finish);
  const onKey = () => {
    if (root.hasAttribute("data-intro")) finish();
  };
  document.addEventListener("keydown", onKey);

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
    handlers.forEach((stop) => stop());
    animations.forEach((animation) => animation.revert());
    layers.forEach((layer) => {
      layer.style.removeProperty("transform");
      layer.style.removeProperty("z-index");
    });
    stopPreference();
    skip?.removeEventListener("click", finish);
    document.removeEventListener("keydown", onKey);
  };
}
