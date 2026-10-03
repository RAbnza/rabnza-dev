/** Section-aware navigation without intercepting links or browser history. */
export function setupNavigation() {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-nav-section]"),
  );
  if (!links.length || !("IntersectionObserver" in window)) return () => {};
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("[data-journey]"),
  );
  const visible = new Set<HTMLElement>();
  const update = () => {
    const section = sections.find((section) => visible.has(section));
    const id = section?.dataset.journey;
    const active =
      id === "capabilities" ? "about" : id === "more-work" ? "work" : id;
    links.forEach((link) =>
      link.dataset.navSection === active
        ? link.setAttribute("aria-current", "location")
        : link.removeAttribute("aria-current"),
    );
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const section = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(section);
        else visible.delete(section);
      });
      update();
    },
    { rootMargin: "-20% 0px -45% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
  return () => observer.disconnect();
}
