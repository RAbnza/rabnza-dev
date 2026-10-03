# Implementation notes

## Static first

Astro builds ten HTML pages: homepage, archive, six projects, résumé, and 404. `src/content.config.ts` validates project Markdown and image references. `ProjectLayout.astro` supplies a consistent project shell; TindaTrack adds workflow screenshots and engineering detail. Profile/navigation/capabilities are typed data, not repeated page content.

`global.css` owns palette, typography, geometry, and Tailwind mappings. `portfolio.css` owns shared editorial layouts; `experience.css` adds the personal opening, intro, narrative details, and form. Geist Latin variable is the single downloaded font. Lucide is rendered to SVG at build time using named React imports; no React island is hydrated. No external fonts, trackers, or embedded apps are required. The only third-party runtime request is EmailJS when a visitor explicitly submits a configured contact form.

## Motion

`src/lib/site.ts` owns navigation state, contact initialization, the copy-email enhancement, motion control, and a dynamic import of `motion/portfolio.ts`. The motion preference defaults to the OS; explicit choices persist, work when storage is denied, synchronize across tabs, and react to OS changes. Enhancement-only controls are hidden without JavaScript.

`opening.ts` owns a finite silver-plane assembly, a typographic introduction, and the keyboard/touch-operated Interface → Logic → Data identity layers. The first desktop sequence lasts 4.13 seconds; mobile and return visits use 3.78 seconds. Assembly is held for 1.5 seconds (1.15 compact), followed by a two-line statement and curtain reveal. Skip, any key, native scrolling, or a hash change dismisses it. Reduced motion, deep links, denied storage and restored history bypass the opening. A 1.4-second pending-import fallback and independent 6.5-second deadline prevent a failed bundle from trapping the page. Content is rendered immediately underneath, with no scroll lock or simulated download progress.

The homepage flows from personal identity to About, capabilities and a project-linked tech ledger, Selected Work, supporting projects, and contact. `journey.ts` uses cached geometry and paused Anime.js timelines: hero depth, an anchored About statement and progressing thread, toolkit planes opening as the ledger is read, a silver aperture into dark work, a daybreak into further projects, image masks, and expanding light at contact. Mobile retains these scenes with shorter distances, normal-flow About/toolkit layouts, and depth on Selected Work's inline figures. The reading-progress rail remains connected to native page scroll.

`targets.ts` shares entrance selectors between pre-paint CSS and `text.ts`. A small inline head script gates those elements before the deferred animation import. The gate fails open after 1.4 seconds; a late import then keeps already exposed text settled. No-JS and reduced-motion HTML remains readable. Each delayed composition child has its own pending/running/settled state: a paused timeline alone is not sufficient to hide children scheduled later in that timeline.

`text.ts` animates native text without splitting or replacing text nodes. Ordinary headings, prose, labels, metadata, and actions enter once per document. Small text uses a mask and short translation, with no scale, wobble, loops, or re-entry reset. Masks keep revealed text at full contrast even when scrolling pauses midway. Keyboard focus settles the relevant text immediately. Hero text still starts when the opening curtain lifts.

`compositions.ts` owns the five major section introductions. Paused Anime.js timelines reveal labels first, then headings and descriptions, then actions and visuals. Progress follows native scrolling and retains its furthest position, so introductions do not disappear on small reverse scrolls or responsive rebuilds. Section states describe approaching, introduction, established, progression, and handoff. Completion uses content anchors: About's lead, the capability/project grids, contact context, and Selected Work's first screen entering the desktop viewport. On stacked screens, Selected Work establishes its introduction at the chapter navigation; its screenshots then reveal in normal flow. This keeps the title readable on narrow screens instead of waiting until an entire tall composition can fit. `journey.ts` and the flagship stage retain reversible environmental, media, and chapter storytelling.

The Person's right column groups its lead, two supporting notes, and r?sum? action with compact spacing and light dividers. Observe / Understand / Build keeps its existing marker layout. `config.ts` supplies shared easing and durations; `data/technologies.ts` records toolkit groups with team-project context rather than proficiency ratings.

Each controller explicitly owns and cleans up its Anime.js instances, observers and listeners. Full motion on screens at least 64rem wide and 45rem high may enhance TindaTrack into a sticky visual beside normal-flow chapters. The stage also checks actual height; if it cannot fit, the entire scene remains in normal flow. Chapter anchors are ordinary links, and all narrative text remains stable and readable. Only incoming/outgoing screenshot layers crossfade during chapter progression; text remains settled after its entrance.

A paused timeline follows scroll directly through Sell → Track → Review, including reverse scroll and direct anchors. Geometry is cached on setup, font readiness, resize, and layout changes. The journey, composition arrivals, and desktop flagship each use a passive scroll handler that schedules at most one animation frame. Geometry reads stay in setup/resize measurement, outside scroll updates. The flagship uses IntersectionObserver to gate offscreen updates. Journey timelines seek only when their clamped progress changes; hidden documents do not update. Preference changes and teardown revert timelines, disconnect observers, cancel queued frames, and restore static styles. Mobile uses normal-flow screenshots and compact transform reveals. Reduced motion removes scroll scenes, entry movement, and the sticky scene; identity controls still switch immediately.

The sticky visual is an aria-hidden enhancement of the original figures. The original semantic figures remain accessible in the document, visually clipped only while the desktop enhancement is active. Without JavaScript, all screenshots and content are visible in flow.

## Decisions relative to the original plan

- The later focused-redesign brief explicitly adds a branded intro and working contact form, superseding the original plan's exclusions for those features. Existing collection content, project routes, shared design tokens, and the TindaTrack story are retained.
- Kept the existing repository as explicitly requested by the implementation handoff, rather than creating another repository.
- Replaced the old two-chapter wipe and separate Review transition with one three-chapter homepage narrative. This removes duplicate lifecycle code and animated gradient repainting. The detailed case study now favors normal reading flow.
- Removed unused shadcn/Radix setup, the unused React button, and supporting packages. Native links, buttons, select, and form fields provide the current interactions without client React hydration.
- The cinematic pass adds finite text masks and spatial entrances at full text contrast. Static HTML remains the fallback, and reduced motion restores original text and styles.
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

## Cinematic pass verification

Production build, Astro diagnostics, ESLint, and all 19 Playwright checks passed. Browser coverage includes 320–1920px widths, no JavaScript, reduced motion, live preference changes, opening timing/skip, reverse scroll, anchors, secondary routes, contact handling, automated accessibility, and throttled asset budgets. Contact tests require a build with all three public EmailJS identifiers empty; the test module then injects intercepted fixture identifiers. The local environment file is not edited for that build, and the production build is restored afterward.

`scripts/cinematic-review.mjs` captures the loader, intro, hero, and major sections at desktop and 390/320px widths against the static server on port 4322 (or `REVIEW_URL`). Reviewed screenshots are saved under `artifacts/cinematic/`. Three cold-cache mobile lab runs stayed within the existing transfer budgets with zero measured CLS; these are controlled checks, not field performance measurements. No new owner-supplied assets are required for this pass.

## Focused refinement verification ? 2026-10-04

The production build and Astro diagnostics pass with zero errors/warnings. ESLint and formatting checks pass. The 24 browser checks in `experience.spec.ts`, `portfolio.spec.ts`, `refinement.spec.ts`, and `timing.spec.ts` pass, including the axe audit, 320?1920px reflow, reduced motion, no JavaScript, keyboard access, history restoration, startup, and reversible project chapters. New regressions cover pre-paint hiding during delayed imports, fail-open late imports, composition-driven arrival, stationary holds, reverse-scroll stability, and calm metadata on re-entry.

Desktop (1440px) and mobile (390px) scroll review sampled all five section arrivals in both directions, with no browser errors, overflow, or small-text scaling. About marker spacing was also verified at 320/390/768/1440px. Review captures are in ignored `artifacts/refinement/` and `artifacts/cinematic/person-timing-*.png`.

The existing throttled performance/asset-budget check also passed during this refinement, with zero measured CLS in all three runs. LCP ranged from 1.06 to 4.19 seconds with the retained opening, so the original 2.5-second LCP goal is not consistently met; no field-performance claim is made.
