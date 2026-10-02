export const motionDurations = {
  hover: 160,
  press: 100,
  reveal: 500,
  content: 400,
  chapter: 700,
} as const;

export const motionEasings = {
  entrance: "cubicBezier(0.22, 1, 0.36, 1)",
  state: "cubicBezier(0.4, 0, 0.2, 1)",
} as const;
