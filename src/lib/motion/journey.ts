import { createTimeline } from "animejs";
import { motionEasings } from "./config";

/** Cached geometry, native scroll, one scheduler; each scene has its own rhythm. */
export function setupJourney() {
  type Scene = {
    element: HTMLElement;
    timeline: ReturnType<typeof createTimeline>;
    range: "enter" | "travel" | "transition" | "exit";
    start: number;
    distance: number;
    last: number;
  };
  const scenes: Scene[] = [];
  const mobile = window.matchMedia("(max-width: 47.99rem)").matches;
  const add = (
    selector: string,
    range: Scene["range"],
    build: (timeline: Scene["timeline"], element: HTMLElement) => void,
  ) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      const timeline = createTimeline({
        autoplay: false,
        defaults: { ease: "linear" },
      });
      build(timeline, element);
      scenes.push({
        element,
        timeline,
        range,
        start: 0,
        distance: 1,
        last: -1,
      });
    });
  };
  document.documentElement.dataset.journeyMotion = "true";
  add("#home", "exit", (timeline, element) => {
    timeline
      .add(
        element.querySelector(".opening-identity")!,
        {
          translateY: [0, mobile ? -18 : -64],
          duration: 1000,
        },
        0,
      )
      .add(
        element.querySelector(".lab-grid")!,
        {
          scale: [1, 1.08],
          rotate: [0, 3],
          opacity: [1, 0.3],
          duration: 1000,
        },
        0,
      );
  });
  add("#about", "travel", (timeline, element) => {
    timeline.add(
      element.querySelector("[data-thread-line]")!,
      {
        [mobile ? "scaleX" : "scaleY"]: [0, 1],
        duration: 1000,
      },
      0,
    );
    element.querySelectorAll(".about-thread .mono").forEach((step, i) => {
      timeline.add(
        step,
        {
          color: ["#5e5e6b", "#6b469c"],
          duration: 230,
        },
        i * 300,
      );
    });
  });
  add(".capability", "enter", (timeline, element) => {
    timeline.add(
      element,
      {
        translateY: [mobile ? 24 : 60, 0],
        clipPath: ["inset(0% 0% 18% 0%)", "inset(0% 0% 0% 0%)"],
        duration: 1000,
        ease: motionEasings.scrub,
      },
      0,
    );
  });
  add(".tech-stack", "travel", (timeline, element) => {
    element.querySelectorAll("[data-tech-plane]").forEach((plane, i) => {
      timeline.add(
        plane,
        {
          translateX: [0, (i - 1) * (mobile ? 18 : 42)],
          translateY: [0, (i - 1) * 24],
          rotate: [-30, -12 + i * 12],
          duration: 1000,
        },
        0,
      );
    });
  });
  add(".tech-row", "enter", (timeline, element) => {
    timeline.add(
      element.querySelector(".tech-number")!,
      {
        translateY: [mobile ? 8 : 16, 0],
        color: ["#5e5e6b", "#6b469c"],
        duration: 700,
      },
      0,
    );
  });
  // Native headline boxes stay in flow; their masks/depth follow both directions.
  const headlines = [
    "#about-title",
    "#capabilities-title",
    "#flagship-title",
    "#supporting-title",
    "#contact-title",
  ];
  headlines.forEach((selector, index) =>
    add(selector, "enter", (timeline, element) => {
      element.dataset.textMotion = [
        "line-mask",
        "depth",
        "project-wipe",
        "aperture",
        "closing-mask",
      ][index];
      element.dataset.motionPolicy = "scroll";
      const masks = [
        ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
        ["inset(0 0 0 0)", "inset(0 0 0 0)"],
        ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
        ["inset(0 12% 0 12%)", "inset(0 0% 0 0%)"],
        ["inset(100% 0 0 0)", "inset(0% 0 0 0)"],
      ];
      timeline.add(
        element,
        {
          clipPath: masks[index],
          scale: [index === 1 ? 0.94 : 1, 1],
          translateY: [index === 4 ? (mobile ? 6 : 14) : 0, 0],
          transformOrigin: ["0% 50%", "0% 50%"],
          duration: 1000,
          ease: motionEasings.scrub,
        },
        0,
      );
    }),
  );
  add(".work-bridge", "transition", (timeline, element) => {
    timeline
      .add(
        element.querySelector("[data-environment-light]")!,
        {
          clipPath: [
            "ellipse(100% 100% at 50% 0%)",
            "ellipse(12% 0% at 50% 0%)",
          ],
          duration: 1000,
        },
        0,
      )
      .add(
        element.querySelector(".mono")!,
        {
          translateY: [mobile ? 18 : 45, -12],
          duration: 1000,
        },
        0,
      );
  });
  // The Selected Work controller retains exclusive ownership of its sticky stage.
  if (
    !window.matchMedia("(min-width: 64rem) and (min-height: 45rem)").matches
  ) {
    add(".story-inline-media", "enter", (timeline, element) => {
      timeline.add(
        element,
        { scale: [0.94, 1], translateY: [20, 0], duration: 1000 },
        0,
      );
    });
  }
  add(".daybreak-bridge", "transition", (timeline, element) => {
    timeline.add(
      element.querySelector("[data-daybreak]")!,
      {
        clipPath: [
          "ellipse(25% 0% at 50% 100%)",
          "ellipse(100% 110% at 50% 100%)",
        ],
        duration: 1000,
      },
      0,
    );
  });
  add("#more-work .project-image-link", "enter", (timeline, element) => {
    timeline
      .add(
        element,
        {
          clipPath: [
            "inset(12% 5% 0% 5% round 16px)",
            "inset(0% 0% 0% 0% round 16px)",
          ],
          duration: 1000,
        },
        0,
      )
      .add(
        element.querySelector("img")!,
        { scale: [1.12, 1], translateY: [mobile ? 12 : 24, 0], duration: 1000 },
        0,
      );
  });
  add("#contact", "enter", (timeline, element) => {
    timeline
      .add(
        element.querySelector("[data-contact-orbit]")!,
        {
          scale: [0.7, 1.2],
          translateY: [60, -30],
          duration: 1000,
        },
        0,
      )
      .add(
        element.querySelector("[data-contact-light]")!,
        {
          scale: [0.55, 1.15],
          opacity: [0.2, 0.8],
          duration: 1000,
        },
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
    const height = window.innerHeight;
    const header =
      document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
    const available = Math.max(1, height - header);
    maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
    // Sticky offsets depend on scroll position. Measure their normal flow once,
    // without changing sizing, then restore before the browser paints.
    const sticky = [
      ...document.querySelectorAll<HTMLElement>(
        ".about-statement, .tech-heading",
      ),
    ]
      .filter((element) => getComputedStyle(element).position === "sticky")
      .map((element) => ({ element, position: element.style.position }));
    sticky.forEach(({ element }) => {
      element.style.position = "relative";
    });
    for (const scene of scenes) {
      // Offset geometry is unaffected by the scene's own animated transform.
      let top = 0;
      let node: HTMLElement | null = scene.element;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      const size = scene.element.offsetHeight;
      // Enter near the lower attention band; complete when the visual's center
      // reaches the reading area. Tall sections continue through their content.
      scene.start =
        scene.range === "exit" ? top : top - header - available * 0.88;
      const focus =
        header + available * (scene.range === "transition" ? 0.35 : 0.48);
      const anchor =
        scene.range === "travel"
          ? Math.max(
              Math.min(size / 2, available * 0.5),
              size - available * 0.45,
            )
          : Math.min(size / 2, available * 0.4);
      const end = scene.range === "exit" ? top + size : top + anchor - focus;
      scene.distance = Math.max(1, Math.min(maxScroll, end) - scene.start);
      scene.last = -1;
    }
    sticky.forEach(({ element, position }) => {
      if (position) element.style.position = position;
      else element.style.removeProperty("position");
    });
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
  return () => {
    alive = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    window.removeEventListener("pageshow", measure);
    document.removeEventListener("visibilitychange", schedule);
    scenes.forEach((scene) => scene.timeline.revert());
    headlines.forEach((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) {
        delete element.dataset.textMotion;
        delete element.dataset.motionPolicy;
      }
    });
    rail?.style.removeProperty("transform");
    delete document.documentElement.dataset.journeyMotion;
  };
}
