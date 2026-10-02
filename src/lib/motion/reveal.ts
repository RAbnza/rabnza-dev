import { animate } from "animejs";

import { motionDurations, motionEasings } from "./config";
import { shouldReduceMotion } from "./preferences";

export function revealElement(element: HTMLElement) {
  if (shouldReduceMotion()) {
    element.style.opacity = "1";
    element.style.transform = "none";

    return null;
  }

  return animate(element, {
    opacity: [0, 1],
    translateY: [16, 0],

    duration: motionDurations.reveal,
    ease: motionEasings.entrance,
  });
}
