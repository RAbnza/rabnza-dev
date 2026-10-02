import { shouldReduceMotion } from "./preferences";

const FLAGSHIP_MIN_WIDTH = 1024;
const FLAGSHIP_MIN_HEIGHT = 720;

export function canUseExtendedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (shouldReduceMotion()) {
    return false;
  }

  return (
    window.innerWidth >= FLAGSHIP_MIN_WIDTH &&
    window.innerHeight >= FLAGSHIP_MIN_HEIGHT
  );
}
