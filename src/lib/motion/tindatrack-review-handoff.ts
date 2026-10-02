import { setupExtendedScrollMotion } from "./extended-scroll";

export function setupTindaTrackReviewHandoff(root: HTMLElement) {
  const line = root.querySelector<HTMLElement>("[data-review-handoff-line]");
  if (!line) return null;

  return setupExtendedScrollMotion(root, {
    render() {
      const rect = root.getBoundingClientRect();
      const distance = window.innerHeight + rect.height;
      if (distance <= 0) return;

      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / distance, 0),
        1,
      );
      root.style.setProperty("--handoff-dark-stop", `${12 + progress * 16}%`);
      root.style.setProperty("--handoff-accent-stop", `${32 + progress * 36}%`);
      root.style.setProperty("--handoff-light-stop", `${72 + progress * 16}%`);
      line.style.transform = `scaleX(${progress})`;
    },
    reset() {
      root.style.removeProperty("--handoff-dark-stop");
      root.style.removeProperty("--handoff-accent-stop");
      root.style.removeProperty("--handoff-light-stop");
      line.style.removeProperty("transform");
    },
  });
}
