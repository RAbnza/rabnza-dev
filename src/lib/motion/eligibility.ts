import { shouldReduceMotion } from "./preferences";

// Match the rem breakpoints used by the layouts, including browser font sizing.
const FLAGSHIP_QUERY = "(min-width: 64rem) and (min-height: 45rem)";

export function canUseExtendedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (shouldReduceMotion()) {
    return false;
  }

  return window.matchMedia(FLAGSHIP_QUERY).matches;
}
