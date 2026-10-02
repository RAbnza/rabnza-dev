export type MotionPreference = "system" | "full" | "reduced";

const STORAGE_KEY = "portfolio-motion-preference";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function getStoredMotionPreference(): MotionPreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "system" || stored === "full" || stored === "reduced") {
    return stored;
  }

  return "system";
}

export function setStoredMotionPreference(preference: MotionPreference): void {
  if (typeof window === "undefined") {
    return;
  }

  if (preference === "system") {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, preference);
}

export function systemPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function shouldReduceMotion(
  preference = getStoredMotionPreference(),
): boolean {
  if (preference === "reduced") {
    return true;
  }

  if (preference === "full") {
    return false;
  }

  return systemPrefersReducedMotion();
}

export function getReducedMotionMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY);
}
