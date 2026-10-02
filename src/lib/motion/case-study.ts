import { animate } from "animejs";

import { motionDurations, motionEasings } from "./config";
import { canUseExtendedMotion } from "./eligibility";
import { shouldReduceMotion } from "./preferences";
import { createMotionScope } from "./scope";

const CHAPTER_SELECTOR = "[data-case-study-chapter]";

export function setupCaseStudyMotion(root: HTMLElement) {
  if (shouldReduceMotion()) {
    return null;
  }

  const chapters = Array.from(
    root.querySelectorAll<HTMLElement>(CHAPTER_SELECTOR),
  );

  if (chapters.length === 0) {
    return null;
  }

  const extended = canUseExtendedMotion();

  const scope = createMotionScope(root, () => {
    const observers: IntersectionObserver[] = [];

    chapters.forEach((chapter) => {
      const copy = chapter.querySelector<HTMLElement>("[data-chapter-copy]");

      const media = chapter.querySelector<HTMLElement>("[data-chapter-media]");

      if (!copy || !media) {
        return;
      }

      let hasAnimated = false;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry || !entry.isIntersecting || hasAnimated) {
            return;
          }

          hasAnimated = true;
          observer.disconnect();

          animate(copy, {
            opacity: [0, 1],
            translateY: [extended ? 20 : 12, 0],
            duration: motionDurations.chapter,
            ease: motionEasings.entrance,
          });

          animate(media, {
            opacity: [0, 1],
            translateY: [extended ? 28 : 12, 0],
            duration: motionDurations.chapter,
            delay: extended ? 80 : 40,
            ease: motionEasings.entrance,
          });
        },
        {
          threshold: 0.18,
          rootMargin: "0px 0px -8% 0px",
        },
      );

      observer.observe(chapter);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => {
        observer.disconnect();
      });
    };
  });

  return scope;
}
