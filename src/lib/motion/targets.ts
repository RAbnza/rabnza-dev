// Shared by pre-paint CSS and the runtime: a reveal cannot be registered without
// also having an initial state while the animation chunk is loading.
export const textTargets = {
  hero: "#hero-title",
  title: ".page-heading h1",
  support:
    "main h3, .tech-row h4, .prose h2, .resume-section h2, .case-chapter h2",
  label: "main .eyebrow, .opening-hello",
  body: ".about-copy p, .section-intro, .capability > p, .story-chapter > div > p:not(.eyebrow), .flagship-intro > p, .flagship-header > div > p:not(.eyebrow), .project-card > p, .contact-copy > p:not(.eyebrow), .opening-tagline, .page-heading .lead, .prose > p, .tech-heading > p:not(.eyebrow), .tech-row p, .form-intro",
  metadata: ".tags, .tech-tools, .story-detail",
  action:
    "main .text-link, main .button, .tech-evidence a, .email-link, .opening-bottom a",
} as const;

export const entranceSelector = `${Object.values(textTargets).join(", ")}, [data-arrival], .capability, .story-inline-media, #more-work .project-image-link`;
