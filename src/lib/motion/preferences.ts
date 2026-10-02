export type MotionPreference = "system" | "full" | "reduced";

const STORAGE_KEY = "portfolio-motion-preference";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOTION_PREFERENCE_EVENT = "portfolio:motion-preference-change";
let sessionPreference: MotionPreference | undefined;

export function getStoredMotionPreference(): MotionPreference {
  if (typeof window === "undefined") {
    return "system";
  }

  if (sessionPreference) return sessionPreference;

  let stored: string | null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return "system";
  }

  if (stored === "system" || stored === "full" || stored === "reduced") {
    return stored;
  }

  return "system";
}

export function setStoredMotionPreference(preference: MotionPreference): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionPreference = preference;
  try {
    if (preference === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Keep applying the preference when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(MOTION_PREFERENCE_EVENT));
}

export function observeMotionPreference(onChange: () => void): () => void {
  const query = getReducedMotionMediaQuery();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      sessionPreference = undefined;
      onChange();
    }
  };
  query?.addEventListener("change", onChange);
  window.addEventListener(MOTION_PREFERENCE_EVENT, onChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    query?.removeEventListener("change", onChange);
    window.removeEventListener(MOTION_PREFERENCE_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
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
