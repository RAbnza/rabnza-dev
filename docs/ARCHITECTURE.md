# Implementation notes

## Static first

Astro builds ten HTML pages: homepage, archive, six projects, résumé, and 404. `src/content.config.ts` validates project Markdown and image references. `ProjectLayout.astro` supplies a consistent project shell; TindaTrack adds workflow screenshots and engineering detail. Profile/navigation/capabilities are typed data, not repeated page content.

`global.css` owns palette, typography, geometry, and Tailwind mappings. `portfolio.css` owns shared editorial layouts; `experience.css` adds the personal opening, intro, narrative details, and form. Geist Latin variable is the single downloaded font. Lucide is rendered to SVG at build time using named React imports; no React island is hydrated. No external fonts, trackers, or embedded apps are required. The only third-party runtime request is EmailJS when a visitor explicitly submits a configured contact form.

## Motion

`src/lib/site.ts` owns navigation state, contact initialization, the copy-email enhancement, motion control, and a dynamic import of `motion/portfolio.ts`. The motion preference defaults to the OS; explicit choices persist, work when storage is denied, synchronize across tabs, and react to OS changes. Enhancement-only controls are hidden without JavaScript.

`opening.ts` owns a 620ms Anime.js brand introduction (320ms for repeat visits in the same tab) and the keyboard/touch-operated Interface → Logic → Data identity layers. The head script enables the overlay before first paint only when appropriate, with a 1.4-second independent failsafe if the animation bundle fails. Reduced motion, deep links, storage failures, and restored history skip the greeting. Any key or the Skip intro action dismisses it. Content is rendered immediately underneath; no scroll lock, focus trap, resource-download simulation, or endless loading state exists.

The homepage now flows from personal identity to About, capabilities, TindaTrack, supporting projects, and contact. `journey.ts` creates paused Anime.js timelines for the About thread, staggered capability movement, the transition into the dark work environment, supporting imagery, and the closing orbit. It updates a subtle reading-progress rail. These scenes use transform/opacity, keep reading text fully opaque, and simplify their distances on mobile. Secondary pages have a small spatial entry, breadcrumbs, contextual active navigation, and normal links back to the portfolio and adjacent projects.

One Anime.js scope owns the active motion. Full motion on screens at least 64rem wide and 45rem high may enhance TindaTrack into a sticky visual beside normal-flow chapters. The stage also checks actual height; if it cannot fit, the entire scene remains in normal flow. Chapter anchors are ordinary links, and all narrative text remains stable and readable. Only incoming/outgoing screenshot layers crossfade; reading text is never faded to low contrast.

A paused timeline follows scroll directly through Sell → Track → Review, including reverse scroll and direct anchors. Geometry is cached on setup, font readiness, resize, and layout changes. One passive handler serves the whole-page journey and a second serves the desktop flagship; each schedules at most one animation frame. The flagship uses IntersectionObserver to gate offscreen updates. Journey timelines seek only when their clamped progress changes; hidden documents do not update. Preference changes and teardown revert timelines, disconnect observers, cancel queued frames, and restore static styles. Mobile uses normal-flow screenshots and compact transform reveals. Reduced motion removes scroll scenes, entry movement, and the sticky scene; identity controls still switch immediately.

The sticky visual is an aria-hidden enhancement of the original figures. The original semantic figures remain accessible in the document, visually clipped only while the desktop enhancement is active. Without JavaScript, all screenshots and content are visible in flow.

## Decisions relative to the original plan

- The later focused-redesign brief explicitly adds a branded intro and working contact form, superseding the original plan's exclusions for those features. Existing collection content, project routes, shared design tokens, and the TindaTrack story are retained.
- Kept the existing repository as explicitly requested by the implementation handoff, rather than creating another repository.
- Replaced the old two-chapter wipe and separate Review transition with one three-chapter homepage narrative. This removes duplicate lifecycle code and animated gradient repainting. The detailed case study now favors normal reading flow.
- Removed unused shadcn/Radix setup, the unused React button, and supporting packages. Native links, buttons, select, and form fields provide the current interactions without client React hydration.
- Kept captions and essential text opaque throughout reveals. Anime.js still provides compact spatial reveals, screenshot transitions, and restrained environment-light fades.
- Omitted an unapproved résumé download and speculative personal-credit claims. These have functional fallbacks and a precise owner checklist.
- No portrait is necessary for the editorial About layout, so a missing personal photo is not a required owner task.

## Publication and metadata

`PUBLIC_SITE_URL` supplies the final root origin. Without it, pages and robots are nonindexable and the sitemap is empty. Vercel preview builds remain nonindexable even when an origin exists. Canonical and absolute social-image URLs are only emitted with a configured origin. The résumé download appears only when the exact PDF exists at build time. `vercel.json` provides static build settings and basic response headers.

## Contact delivery

`ContactForm.astro` renders semantic labelled fields, inline errors and a live status. `contact.ts` adds validation and posts a JSON payload to EmailJS's documented `/api/v1.0/email/send` endpoint. It requires only the three public environment identifiers from `.env.example`. No SDK or private credentials are shipped. Missing configuration leaves Send disabled with an honest explanation and a direct email fallback.

Only a successful provider response clears the form. Errors, rate limits, and the 15-second timeout preserve the visitor's text. A honeypot, length limits, in-flight guard, and cooldown limit accidental or simple automated repeats; provider origin restrictions and quotas remain necessary. There is no backend, CAPTCHA, or guarantee against determined abuse. The test suite injects public fixture identifiers into the same contact module and intercepts all delivery requests, covering success and failure without sending mail. Real recipient/template configuration and inbox verification remain an owner task.

## Content maintenance

Add Markdown under `src/content/projects/` and local images under `src/assets/projects/`. Set `publication.published`, numeric `priority`, and optional `publication.homepage`. The archive, dynamic routes, and sitemap follow the collection. Homepage supporting features follow the homepage flag; TindaTrack remains the authored flagship. Use `docs/CONTENT_EVIDENCE.md` to record provenance.

Do not attach user data or production services to the demo screenshots. Review `docs/HUMAN_INTERVENTION_REQUIRED.md` before deployment.
