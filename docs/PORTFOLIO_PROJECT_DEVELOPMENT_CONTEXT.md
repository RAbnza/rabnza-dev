# Portfolio Development Handoff — Revised Final Plan

This document replaces the previous handoff. Planning is complete. Continue into development without restarting broad portfolio discovery.

## 1. Project Context

Build a new personal developer portfolio for **Rendel Abainza**, a fresh Computer Science graduate seeking employment.

Primary target: entry-level full-stack development. Also support frontend, backend, software developer, and related entry-level opportunities.

Audience: recruiters, hiring managers, developers, and collaborators.

The user states they have **no professional work experience**. This overrides older profile/portfolio internship wording. Do not publish an employment timeline or present RADMedics as an internship/client engagement without explicit clarification.

Education reference: BS Computer Science, Polytechnic University of the Philippines. Graduate status is user-confirmed; graduation date is not. Never invent dates, achievements, metrics, credentials, or personal contributions.

Positioning: a thoughtful developer who builds usable interfaces and dependable underlying systems.

Suggested headline: “Useful software, thoughtfully built.”

Primary action: Explore TindaTrack. Secondary actions: View résumé and Contact me.

## 2. Repository Strategy

Use a **brand-new repository**. Suggested provisional name: `rendel-portfolio`; exact name/location remain setup details.

The existing portfolio repository is read-only reference material. Transfer useful facts/assets selectively; do not carry forward its architecture, components, code, or design automatically.

All synced project files under `sources/` are read-only.

Transfer selectively:
- Verified identity, education, professional links, project facts.
- Suitable real screenshots, portrait source, optional RA mark.
- Useful wording after factual review.

Recreate:
- Architecture, layouts, components, navigation, typography, responsive behavior, animation, and metadata.

Leave behind:
- Old loaders, stacked-logo effects, marquees, hobbies modals, old route structure, unused assets, unsupported claims, environment files, and credentials.

The old portrait source is approximately 10 MB; create responsive optimized derivatives if used.

## 3. Final Creative Direction

Concept: **From interface to system**.

Create an editorial, cinematic portfolio that reveals finished interfaces and then explains the engineering behind them.

The homepage progresses through:
1. Bright silvery introduction.
2. Lavender-lit transition into TindaTrack.
3. Dark TindaTrack presentation with Sell → Track → Review chapters.
4. Return to silver for supporting work.
5. Calm, bright capabilities/about/contact.

This is one authored light/dark experience, not a manual theme toggle. Lavender is the dominant accent; pink appears only as a small supporting lighting/gradient detail.

Use real screenshots, clear copy, precise composition, and scroll-driven transitions. The style must remain professional and readable, with subtle futuristic character.

No gaming-style dashboard, full-site neon, custom cursor, mandatory intro loader, autoplay carousel, scroll hijacking, or background video.

## 4. Final Design System

### Colors

- Silver canvas: `#F7F7FA`
- White surface: `#FFFFFF`
- Soft silver: `#EEEEF3`
- Charcoal text: `#1B1B22`
- Muted text on light: `#5E5E6B`
- Night canvas: `#111116`
- Dark surface: `#1B1B24`
- Primary text on dark: `#F5F5F8`
- Muted text on dark: `#B9B9C6`
- **Dominant silver lavender: `#C8B6F2`**
- Violet ink for light-surface text/links/focus: `#6B469C`
- Secondary pink mist: `#E6BCD4`
- Decorative light divider: `#DCDCE5`
- Decorative dark divider: `#343440`
- Strong control borders: `#82828F` on light, `#747484` on dark

Most surfaces remain neutral. Roughly 85–90% of colored decorative emphasis should be lavender; pink is a minor supporting accent.

Use violet ink rather than pale lavender for text on white. Primary buttons use lavender fill and charcoal text.

Calculated solid-color text pairings pass normal-text contrast thresholds, but validate rendered states, gradients, transparency, and focus indicators.

Environment transitions must not interpolate essential text/background colors through unreadable combinations. Animate decorative layers, keep reading surfaces stable, and switch compatible foreground/surface pairs together. Header contrast must not depend on blend modes.

### Typography

**Geist Sans** is finalized for headings, body, and UI. No second display family.

Self-host Latin variable WOFF2 using Fontsource or equivalent local assets. Retain the license. Use `font-display: swap`, preload only the primary font file, and configure metric-compatible fallbacks. Add character coverage only when needed.

Type scale, mobile → desktop:
- Hero: 44–88 px, weight 600, line-height 1.04–1.08, tracking −0.04em.
- Section heading: 32–56 px, 600, 1.1, −0.03em.
- Project heading: 24–32 px, 600, 1.2, −0.02em.
- Lead: 18–22 px, 400, 1.5.
- Body: 16–18 px, 400, 1.65.
- Navigation/buttons: 14–16 px, 500, 1.25.
- Captions: 14 px, 400, 1.5.
- Eyebrows/technical labels: 12–13 px, 500, 1.4, +0.08em.

Use sentence case. Uppercase only short labels. Keep prose around 60–68ch. Use fluid sizes with bounded minimums/maximums. Allow natural line wrapping.

Monospace: system `ui-monospace`, SFMono-Regular, Consolas, monospace, for technical labels, numbered steps, identifiers, and code. No extra downloaded monospace font.

No typewriter/scramble effects or continuous animated text.

### Layout and Spacing

- Main container: max 1200 px.
- Wide visual stage: max 1360 px.
- Reading column: max 68ch, approximately 720 px.
- Gutters: 20 px mobile, 32 px tablet, 48 px desktop.
- Conceptual grid: 4/8/12 columns.
- Grid gaps: 16/24/32 px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px.
- Section padding: 64/96/128 px.
- Breakpoints: 640, 768, 1024, 1280 px.

Default to left-aligned copy and deliberate grid-based asymmetry.

The extended flagship scene requires at least 1024 px width and 720 px height with full motion enabled. Target total section height 220–260svh. Short screens/mobile/reduced motion use content-driven normal flow.

### Shapes and UI

Solid surfaces with precise, lightly softened geometry:
- Buttons/inputs: 10 px radius.
- Small panels: 12 px.
- Cards/screenshots: 16 px.
- Large stage: 20 px.
- Pills only for small status/technology labels.
- Borders generally 1 px.
- Controls at least 44 px high; main CTAs 48 px.
- Focus ring: 2 px with 3 px offset; violet on light, lavender on dark.

Primary button: lavender/charcoal. Secondary: neutral surface and visible border. Important links have a non-color cue.

Inputs, if introduced later, need persistent labels, visible boundaries, and explicit error messages.

### Effects

- Small shadow: approximately 0 2px 8px at 6% black.
- Raised light card: approximately 0 12px 32px at 8% black.
- Dark panels rely mostly on borders and tonal separation.
- Lavender glow: 24–48 px soft extent, 8–16% opacity, limited to meaningful emphasis.
- Pink only as a faint gradient endpoint/edge light.
- No glowing paragraphs, saturated full-page gradients, animated blur radius, or large live backdrop blurs.
- Glass is not a base material; use a solid/nearly opaque header.
- No required texture.
- Maximum two decorative depth layers behind a scene.
- Prefer moving/fading prepared lighting layers to repainting effects.

## 5. Icon and Component Strategy

### Icons

**Lucide is the single general-purpose icon library.**

Default 20 px with 1.75 stroke; compact 16 px; larger actions 24 px. Use consistent round caps/joins and `currentColor`.

Render selected SVGs at build time in Astro. Use named imports inside React islands. No icon fonts or whole-library runtime loading.

Hide decorative icons from assistive technology. Label icon-only buttons and keep practical targets. Important actions should have visible text.

Official brand/logo assets and custom SVG diagrams are allowed documented exceptions. Do not add another general icon library.

Use technology text labels by default. Keep application screenshots authentic rather than tinting them to match the portfolio.

### Components

**shadcn/ui with Radix-based primitives** is the preferred reusable foundation for stateful React UI.

Reuse appropriate library components for manual gallery tabs, dialogs/sheets when needed, supplementary tooltips, and future form controls. Add only what is actually used.

Use semantic Astro/native elements for ordinary static buttons, links, headings, cards, disclosures, and navigation. Do not hydrate static UI merely to share styles.

Custom-build the distinctive scroll composition, chapter transitions, editorial layouts, project diagrams, and annotations.

Homepage scroll chapter controls use normal anchors, not automatically activated accessible tabs.

Aceternity UI is optional as an individual component source, not part of the required base stack. Reuse only when it saves work after evaluating accessibility, dependencies, license, and performance. Do not add Motion or another animation engine merely to accommodate borrowed effects.

All third-party UI must adopt the finalized palette, typography, spacing, radii, focus, icons, and motion. Remove default showcase styling. Do not assemble unrelated template sections.

## 6. Content and Information Architecture

Routes:
- `/`: introduction → TindaTrack → HomeRoom/TravelWise → capabilities → about/journey → contact.
- `/projects/`: complete launch archive.
- `/projects/tindatrack/`: full flagship case study.
- `/projects/[slug]/`: supporting/archived project pages.
- `/resume/`: accessible summary and current downloadable PDF.
- `/404/`: useful recovery links.

Header: Work, About, Résumé, Contact. Use homepage anchors and correct cross-page anchor links. Sticky header must not obscure content/focus.

Project priority:
1. TindaTrack: flagship, full case study and cinematic feature.
2. HomeRoom: supporting homepage feature and concise case study.
3. TravelWise: supporting feature and concise case study.
4. RADMedics website: compact archive page with neutral project framing.
5. RentEase: compact archive page.
6. Original portfolio: compact retrospective/archive page.

Retain all five projects from the existing portfolio. Other repositories are future candidates, not automatic launch scope.

Previews contain purpose, actual screenshot, verified contribution/type, selected technologies, one concrete detail, and case-study link.

Case studies contain problem/users, status, role/team/contribution, workflow screenshots, architecture, decisions/tradeoffs, validation, limitations, lessons, and available demo/source links.

Distinguish “the application supports” from “I implemented.” Never infer sole authorship from repository ownership.

TindaTrack is inventory/sales software for small local retailers. Documentation describes React/TypeScript/Vite/Tailwind, Node/Express, PostgreSQL/Prisma, and testing tools. Planning source review confirmed server-calculated prices and a serializable sale transaction. A test covers competing sales for the last unit. Tests were inspected, not executed. Do not claim customers, revenue, business impact, or production scale.

HomeRoom database wording needs verification: old portfolio mentions MySQL; repository README describes SQLite locally.

Skills: interfaces, application/data work, engineering practice, linked to project evidence. No proficiency bars or unsupported expertise labels.

Keep a brief personal note based on existing interests, such as drawing, gaming, and OPM. No large hobbies module.

Update the résumé to match current graduate status and verified facts before publication.

## 7. Technical Architecture

Confirmed stack:
- Astro static output with Vite-based tooling.
- Strict TypeScript.
- Tailwind and shared CSS-variable tokens.
- Astro layouts/content, selective React islands.
- **Anime.js is required and the primary animation system.**
- CSS/native APIs for simple effects and interaction.
- Selective shadcn/ui/Radix.
- Lucide icons.
- Astro file-based routing, no React Router.
- Validated content collections and Markdown.
- Typed profile, links, navigation, and capabilities.
- Local state; no global state library.
- npm and committed lockfile.
- New Vercel project connected to the new repository.

Remove Motion from previous recommendations. Do not install Lenis, GSAP, Lottie, Three.js, React Three Fiber, or other overlapping animation/rendering systems at launch.

Anime.js can animate Astro DOM directly. React is not required for scroll scenes.

Build a small scoped motion layer for preference, responsive eligibility, scene lifecycle, timelines, environment state, and shared easing. Keep layout separate from animated wrappers. One owner per animated property.

No portfolio backend, CMS, authentication, or contact form at launch. Use visible email, copy-email enhancement, LinkedIn, and GitHub.

Project schema:
slug, title, summary, type, priority, featured flag, verified dates/status, technologies, contribution/team context, cover/gallery media, alt/captions, demo/source links, publication status, case-study body.

Maintain internal claim/source/verification records. Do not publish draft placeholders or unverified claims.

## 8. Motion and Scroll Design

Motion personality: controlled, smooth, deliberate. No elastic bounce.

Timings:
- Hover/focus: 140–180 ms, at most 2 px movement.
- Press: 80–120 ms, optional scale to 0.98.
- Reveal: 400–550 ms, 12–24 px translation plus opacity.
- Stagger: 40–60 ms; group completes in about 700 ms or less.
- Content change: 300–450 ms.
- Timed chapter transition: 600–800 ms.

Easing equivalents:
- Entrance: cubic Bézier (0.22, 1, 0.36, 1).
- State change: (0.4, 0, 0.2, 1).
- Scroll master progress directly follows scroll; ease individual segments without excessive trailing inertia.

Flagship beats:
1. Sell: sales screenshot; server pricing/transaction explanation.
2. Track: stock history; traceability explanation.
3. Review: reporting/permissions; operational visibility explanation.

Use real local screenshots and a compact interface → API → database graphic. No live app embedding, production API calls, or demo mutations.

Desktop may use a sticky visual beside normal-flow narrative. Only this flagship has extended scroll choreography. Include chapter anchors and a direct case-study link.

Support reverse/fast scrolling, direct anchors, resizing, and restored scroll positions. Do not queue delayed animations.

Mobile uses compact reveals and stacked sections without extended sticky choreography.

Keep identity, navigation, résumé/contact links, and case-study body copy stable. No character-by-character paragraph animation.

## 9. Performance and Accessibility

Older PCs/laptops and mid-range/lower-powered phones are first-class targets.

- Deliver complete readable HTML before enhancements.
- Native scrolling; no wheel/touch interception or forced snapping.
- Lazy-initialize nearby scenes and defer noncritical islands.
- Use Anime.js scopes and proper teardown/reversion.
- One complex scene active at a time; target no more than six independently animated visual groups.
- At most incoming/outgoing screenshot layers during transitions.
- Measure geometry on setup/controlled changes, not every frame.
- No React state updates every scroll tick.
- Stop work when finished, offscreen, or hidden.
- Primarily transform/opacity animation.
- Reserve dimensions; optimize responsive images.
- No autoplay video, perpetual decorative loops, expensive live blur, or excessive composited layers.

Provide Full motion / Reduced motion preference, initially following the OS and persisting explicit choice. Reduced motion removes scroll scrubbing, extended sticky height, parallax, large environment fades, and spatial reveals. The same content remains in normal flow. Handle preference changes live.

Do not rely on device detection to rescue an expensive baseline.

Budgets remain:
- Initial route JS ≤100 KB compressed.
- Cumulative homepage JS ≤180 KB compressed.
- Initial viewport transfer ≤700 KB.
- Screenshot variants generally 100–200 KB.
- Fonts ≤100 KB total.
- CLS ≤0.1.
- LCP goal ≤2.5 s; INP goal ≤200 ms with representative field data.

Include Anime.js, React, and component dependencies in measurements. These are targets, not achieved results. Use repeatable throttled lab checks and available real hardware. Lighthouse does not establish field INP.

Target WCAG 2.2 AA: semantic landmarks/headings, skip link, visible focus, contrast, meaningful alt text, keyboard support, descriptive links, practical 44 px targets, and no hover-only information.

Test 320 CSS px, 200% zoom, touch, keyboard, reduced motion, no JS, intermediate animation states, and header/anchor interactions.

Decorative motion must not reorder screen-reader content or move focus. Keep text intact and avoid duplicate accessible content in animated layers.

## 10. SEO, Tooling, and Structure

Generate titles, descriptions, canonical URLs, social images, sitemap, robots configuration, and accurate Person/CreativeWork structured data. Prevent preview indexing.

Use TypeScript checks, formatting, relevant ESLint configuration, critical Playwright journeys, automated accessibility checks, and manual testing. Unit-test meaningful interaction/state logic.

Planned directories:
- `src/pages/`
- `src/layouts/`
- `src/components/ui/`
- `src/components/sections/`
- `src/components/interactive/`
- `src/content/projects/`
- `src/data/`
- `src/assets/`
- `src/styles/`
- `src/lib/motion/`
- `public/`
- `tests/`
- `docs/`

Document handoff, tokens, content evidence, architecture, motion choreography, budgets, QA, and how to update projects/résumé.

## 11. Scope and Implementation Roadmap

Must-have: complete content/pages, TindaTrack hierarchy, responsive cinematic sequence, Anime.js, chapter environments, motion preference/static fallbacks, résumé/contact, accessibility/SEO/performance, deployment.

High-value: refined screenshot annotations, architecture diagram, lighting, timing, supporting reveals.

Optional: additional page transitions, user-triggered demo video, selected creative-source components.

Exclude launch 3D, manual theme toggle, backend contact form, multiple animation engines, and perpetual decoration.

Build order:
1. Verify content/contributions, prepare screenshots, update résumé; omit unsupported claims.
2. Apply finalized design system to desktop/mobile homepage and case-study compositions. Produce reviewable designs; do not reopen font/palette/library discovery.
3. Define routes, schemas, island boundaries, scene lifecycle, and budgets.
4. Set up the new repository, stack, checks, and preview.
5. Prototype one representative Anime.js TindaTrack transition using real media. Validate mobile/reduced motion/contrast/performance before expanding.
6. Build static shell and TindaTrack case study first.
7. Build homepage, archive, other project pages, résumé, contact, metadata.
8. Integrate full flagship choreography, environment transitions, and restrained supporting interactions.
9. Optimize media/fonts/bundles/animation work.
10. Test content, routes, browsers, keyboard, touch, no JS, reduced motion, fast/reverse scroll, direct anchors, resizing, cleanup, and throttled performance.
11. Deploy to the new Vercel project; verify production routes, assets, résumé, contact, canonical URLs, and indexing.
12. Refine from observations before adding scope.

The static baseline must remain complete throughout enhancement work.

## 12. Confirmed and Open Decisions

Confirmed—do not reopen without a real technical problem:
- Employment-first graduate positioning and full-stack emphasis.
- New repository, reference-only old portfolio.
- TindaTrack flagship and retention of five older projects.
- From interface to system concept.
- Neutral silver/charcoal environments, dominant lavender, secondary pink.
- Geist Sans, system monospace, defined layout/type/shape/effect tokens.
- Lucide primary icons.
- Selective shadcn/Radix, optional individually evaluated Aceternity components.
- Anime.js required; no Motion/Lenis or launch 3D.
- Astro static foundation, selective React, Tailwind, content collections.
- Native scroll input with cinematic progression.
- Complete accessible reduced-motion/static experience.
- Vercel and direct contact.

Open implementation details:
- Repository name/location/access.
- Compatible stable dependency versions.
- Final screenshot selection/crops and content-driven line breaks.
- Small choreography adjustments within defined rules.
- Verified personal contributions, current résumé, optional graduation date.
- HomeRoom database wording and disputed older claims.
- Source/demo availability and final canonical domain.

Typography, palette direction, icons, and component strategy are finalized, not open discovery topics.

## 13. Important References

Identity/contact:
- GitHub: https://github.com/RAbnza
- LinkedIn: https://www.linkedin.com/in/rendel-abainza/
- Email: abainzarendel11@gmail.com
- Profile reference: https://github.com/RAbnza/RAbnza

Existing portfolio:
- https://github.com/RAbnza/rabnza-portfolio
- https://rabnza-portfolio.vercel.app/
- Useful old files: `src/data/projects.js`, `src/component/about/Intro.jsx`, `src/data/hobbies.js`, image assets, résumé PDF.
- Old student/internship wording conflicts with current user context.
- Live appearance/performance was not verified during planning.

Projects:
- https://github.com/RAbnza/TindaTrack
- https://tindatrack.pages.dev/
- TindaTrack: `README.md`, `docs/`, `server/src/services/sale.service.ts`, `server/src/test/sale-api.test.ts`
- https://github.com/COMP-016-Web-Development-Group-1/HomeRoom
- https://github.com/RAbnza/TravelWise
- https://github.com/LesterOsana18/RentEase-Application
- RADMedics reference: https://www.radmedicsph.com/

Technical/design:
- https://animejs.com/documentation/events/onscroll/
- https://animejs.com/documentation/scope/
- https://docs.astro.build/en/concepts/islands/
- https://docs.astro.build/en/guides/content-collections/
- https://docs.astro.build/en/guides/images/
- https://docs.astro.build/en/guides/deploy/vercel/
- https://ui.shadcn.com/docs/installation/astro
- https://ui.shadcn.com/docs/components/radix/tabs
- https://lucide.dev/guide/static
- https://vercel.com/font
- https://fontsource.org/fonts/geist/use
- Optional component source: https://ui.aceternity.com/components

## 14. Development Instructions

Follow this plan phase by phase. Do not restart broad planning or modify the old portfolio.

Use actual project evidence and honest graduate positioning. Ask only for blocking information; otherwise make bounded implementation choices and document them.

Reuse mature components where useful, customize them fully, and reserve custom work for the distinctive experience.

Do not quietly replace Anime.js or dilute the lavender-focused identity. Preserve the content hierarchy and low-powered-device requirements.

Explain significant deviations, update this handoff when major decisions change, and report measured validation results accurately.