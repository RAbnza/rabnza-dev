import {
  getStoredMotionPreference,
  observeMotionPreference,
  setStoredMotionPreference,
  shouldReduceMotion,
  type MotionPreference,
} from "./motion/preferences";
import { setupNavigation } from "./navigation";
import { setupContactForm } from "./contact";

let initialized = false;
export function setupSite() {
  if (initialized) return;
  initialized = true;
  const select =
    document.querySelector<HTMLSelectElement>("#motion-preference");
  const update = () => {
    document.documentElement.dataset.motion = shouldReduceMotion()
      ? "reduced"
      : "full";
    if (select) select.value = getStoredMotionPreference();
  };
  update();
  document.querySelector(".motion-control")?.removeAttribute("hidden");
  select?.addEventListener("change", () =>
    setStoredMotionPreference(select.value as MotionPreference),
  );
  const stopPreference = observeMotionPreference(update);
  const stopNavigation = setupNavigation();
  const stopContact = setupContactForm();
  const copy = document.querySelector<HTMLButtonElement>("[data-copy-email]");
  copy?.removeAttribute("hidden");
  copy?.addEventListener("click", async () => {
    const status = document.querySelector<HTMLElement>("[data-copy-status]");
    try {
      await navigator.clipboard.writeText(copy.dataset.copyEmail!);
      if (status) status.textContent = "Email address copied.";
    } catch {
      if (status)
        status.textContent =
          "Select and copy the email address above, or open the email link.";
    }
  });
  let disposeMotion: (() => void) | undefined;
  let disposed = false;
  const load = async () => {
    try {
      const { setupMotion } = await import("./motion/portfolio");
      if (!disposed)
        disposeMotion = setupMotion(document.querySelector("[data-story]"));
    } catch {
      document.documentElement.removeAttribute("data-intro");
    }
  };
  // A single shared Anime.js chunk powers the introduction and the full journey.
  void load();
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    disposed = true;
    disposeMotion?.();
    stopPreference();
    stopNavigation();
    stopContact();
  });
}
