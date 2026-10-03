import { cubicBezier } from "animejs";

export const motionDurations = {
  hover: 160,
  press: 100,
  reveal: 500,
  content: 400,
  chapter: 700,
  heading: 850,
  stagger: 65,
  loader: 1500,
} as const;

export const motionEasings = {
  entrance: cubicBezier(0.22, 1, 0.36, 1),
  reading: cubicBezier(0.3, 0.05, 0.3, 1),
  scrub: cubicBezier(0.4, 0, 0.6, 1),
  state: cubicBezier(0.4, 0, 0.2, 1),
} as const;

// Reading rhythm is separate from the established loader/hero handoff.
export const textDurations = {
  title: 1400,
  support: 1100,
  label: 600,
  body: 1250,
  metadata: 850,
  action: 800,
} as const;
