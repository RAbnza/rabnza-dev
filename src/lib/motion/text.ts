import { animate, stagger } from "animejs";
import { motionDurations, motionEasings, textDurations } from "./config";

type Pattern =
  "hero" | "title" | "support" | "label" | "body" | "metadata" | "action";
type Policy = "once" | "reentry";
type Animation = ReturnType<typeof animate>;
type Record = {
  element: HTMLElement;
  pattern: Pattern;
  policy: Policy;
  armed: boolean;
};
const ownedStyles = ["transform", "transform-origin", "clip-path"];

/** Native text stays untouched: no word wrappers, whitespace rewriting or line measurements. */
export function setupTextReveals(seen: WeakSet<Element>) {
  const records = new Map<HTMLElement, Record>();
  const running = new Map<
    HTMLElement,
    { animation: Animation; restore: () => void }
  >();
  const add = (selector: string, pattern: Pattern, policy: Policy = "once") => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (records.has(element)) return;
      records.set(element, {
        element,
        pattern,
        policy,
        armed: !seen.has(element),
      });
      element.dataset.textMotion = pattern;
      element.dataset.motionPolicy = policy;
      if (seen.has(element)) element.dataset.textState = "settled";
    });
  };
  add("#hero-title", "hero");
  add(".page-heading h1", "title");
  // Major homepage titles are owned by the reversible scroll controller.
  add(
    "main h3, .tech-row h4, .prose h2, .resume-section h2, .case-chapter h2",
    "support",
  );
  add(".project-card h3", "support", "reentry");
  add("main .eyebrow, .opening-hello", "label");
  add(
    ".about-copy p, .section-intro, .capability > p, .story-chapter > div > p:not(.eyebrow), .flagship-intro > p, .flagship-header > div > p:not(.eyebrow), .project-card > p, .contact-copy > p:not(.eyebrow), .opening-tagline, .page-heading .lead, .prose > p, .tech-heading > p:not(.eyebrow), .tech-row p, .form-intro",
    "body",
  );
  add(".tags, .tech-tools, .story-detail", "metadata", "reentry");
  add(
    "main .text-link, main .button, .tech-evidence a, .email-link, .opening-bottom a",
    "action",
    "reentry",
  );
  // Project titles replay only after the complete element leaves the viewport.
  records.forEach((record) => {
    if (
      record.element.closest(".project-card") &&
      record.pattern === "support"
    ) {
      record.policy = "reentry";
      record.element.dataset.motionPolicy = "reentry";
    }
  });

  const stop = (target: HTMLElement) => {
    const active = running.get(target);
    if (!active) return;
    active.animation.cancel();
    active.restore();
    running.delete(target);
  };
  const run = (
    target: HTMLElement,
    parameters: Parameters<typeof animate>[1],
    done?: () => void,
  ) => {
    stop(target);
    const original = ownedStyles.map(
      (property) =>
        [property, target.style.getPropertyValue(property)] as const,
    );
    const restore = () =>
      original.forEach(([property, value]) => {
        if (value) target.style.setProperty(property, value);
        else target.style.removeProperty(property);
      });
    const animation = animate(target, {
      ...parameters,
      autoplay: false,
      onComplete: (self) => {
        // Cancel at the endpoint. revert() seeks to the beginning and is teardown-only.
        self.cancel();
        restore();
        running.delete(target);
        done?.();
      },
    });
    running.set(target, { animation, restore });
    animation.play();
  };
  const play = (record: Record) => {
    const { element, pattern, policy } = record;
    if (!record.armed || (policy === "once" && seen.has(element))) return;
    record.armed = false;
    seen.add(element);
    element.dataset.textState = "running";
    const mobile = window.matchMedia("(max-width: 47.99rem)").matches;
    const distance = mobile ? 6 : 12;
    const settle = () => {
      element.dataset.textState = "settled";
    };
    const shared = {
      duration: pattern === "hero" ? 1050 : textDurations[pattern],
      ease: motionEasings.reading,
    };
    const opening = !!element.closest("#home");
    if (opening) {
      shared.duration = motionDurations.reveal;
      shared.ease = motionEasings.entrance;
    }
    if (pattern === "metadata") {
      const parts = element.children.length
        ? ([...element.children] as HTMLElement[])
        : [element];
      parts.forEach((part, index) =>
        run(
          part,
          {
            ...shared,
            scale: [0.96, 1],
            translateY: [4, 0],
            delay: stagger(mobile ? 80 : 110)(part, index, parts),
          },
          index === parts.length - 1 ? settle : undefined,
        ),
      );
    } else if (pattern === "action") {
      const icon = element.querySelector<HTMLElement>("svg");
      if (icon)
        run(icon, { ...shared, translateX: [-4, 0], rotate: [-16, 0] }, settle);
      else
        run(
          element,
          { ...shared, clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
          settle,
        );
    } else {
      const parameters: Parameters<typeof animate>[1] = { ...shared };
      if (pattern === "hero")
        Object.assign(parameters, {
          clipPath: [
            "polygon(0 0, 100% 0, 100% 0, 0 18%)",
            "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          ],
          scale: [0.96, 1],
          transformOrigin: ["0% 50%", "0% 50%"],
          duration: 1050,
        });
      if (pattern === "title")
        Object.assign(parameters, {
          clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
          translateY: [distance, 0],
        });
      if (pattern === "support")
        Object.assign(parameters, {
          clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
          scale: [0.98, 1],
          transformOrigin: ["0% 50%", "0% 50%"],
        });
      if (pattern === "label")
        Object.assign(parameters, {
          clipPath: ["inset(0 0 0 100%)", "inset(0 0 0 0%)"],
          duration: opening ? 430 : textDurations.label,
        });
      if (pattern === "body")
        Object.assign(parameters, {
          clipPath: ["inset(0 0 15% 0)", "inset(0 0 0% 0)"],
          translateY: [distance / 2, 0],
          duration: opening ? 650 : textDurations.body,
          delay:
            Math.min([...element.parentElement!.children].indexOf(element), 3) *
            (opening ? 55 : 100),
        });
      run(element, parameters, settle);
    }
  };
  // Different reading bands establish hierarchy without timers. Pixel margins
  // follow viewport height (IO percentage margins are based on viewport width).
  const bands: { [key in Pattern]: number } = {
    hero: 0.96,
    title: 0.86,
    label: 0.9,
    support: 0.74,
    body: 0.68,
    metadata: 0.62,
    action: 0.56,
  };
  const observers = new Map<Pattern, IntersectionObserver>();
  const observe = () => {
    observers.forEach((observer) => observer.disconnect());
    observers.clear();
    const height = window.innerHeight;
    const header =
      document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
    for (const pattern of Object.keys(bands) as Pattern[]) {
      const bottom = Math.round((height - header) * (1 - bands[pattern]));
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const record = records.get(entry.target as HTMLElement)!;
            if (
              record.element.closest("#home") &&
              document.documentElement.hasAttribute("data-intro") &&
              document.documentElement.dataset.heroReady !== "true"
            )
              return;
            play(record);
            if (record.policy === "once") observer.unobserve(entry.target);
          });
        },
        { threshold: 0, rootMargin: `0px 0px -${bottom}px 0px` },
      );
      observers.set(pattern, observer);
    }
    records.forEach((record) => {
      if (record.policy === "reentry" || !seen.has(record.element))
        observers.get(record.pattern)!.observe(record.element);
    });
  };
  const resetObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) return;
        const record = records.get(entry.target as HTMLElement)!;
        if (seen.has(record.element)) record.armed = true;
      });
    },
    { rootMargin: "80px 0px" },
  );
  records.forEach((record) => {
    if (record.policy === "reentry") resetObserver.observe(record.element);
  });
  observe();
  const open = () =>
    records.forEach((record) => {
      if (
        record.element.closest("#home") &&
        record.element.getBoundingClientRect().top < window.innerHeight
      ) {
        play(record);
        if (record.policy === "once")
          observers.get(record.pattern)!.unobserve(record.element);
      }
    });
  const focus = (event: FocusEvent) => {
    const target = event.target as HTMLElement;
    running.forEach(({ animation }, element) => {
      if (element.contains(target) || target.contains(element))
        animation.complete();
    });
  };
  const interact = (event: PointerEvent) => {
    const target = event.target as Element;
    const action = target.closest<HTMLElement>(
      ".text-link, .button, .tech-evidence a, .email-link, .opening-bottom a",
    );
    const icon = action?.querySelector<HTMLElement>("svg");
    if (
      !icon ||
      (event.relatedTarget instanceof Node &&
        action?.contains(event.relatedTarget))
    )
      return;
    run(icon, {
      translateY: event.type === "pointerover" ? -2 : 0,
      rotate: event.type === "pointerover" ? 8 : 0,
      duration: motionDurations.hover,
      ease: motionEasings.state,
    });
  };
  document.addEventListener("portfolio:hero-ready", open);
  window.addEventListener("resize", observe);
  document.addEventListener("focusin", focus);
  document.addEventListener("pointerover", interact);
  document.addEventListener("pointerout", interact);
  return () => {
    observers.forEach((observer) => observer.disconnect());
    window.removeEventListener("resize", observe);
    resetObserver.disconnect();
    document.removeEventListener("portfolio:hero-ready", open);
    document.removeEventListener("focusin", focus);
    document.removeEventListener("pointerover", interact);
    document.removeEventListener("pointerout", interact);
    [...running.keys()].forEach(stop);
    records.forEach(({ element }) => {
      delete element.dataset.textMotion;
      delete element.dataset.motionPolicy;
      delete element.dataset.textState;
    });
  };
}
