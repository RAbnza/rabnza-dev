# Portfolio development guide

Setup, verification, content maintenance, and deployment for the [portfolio repository](../README.md).

## Development

Requires Node **22.12+** and npm. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

```sh
npm ci
npm run astro -- dev --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

The background development server runs at `http://localhost:4321`.

## Verification

```sh
npm run build
npm run lint
npm run format:check
npm test
```

Playwright tests the **built `dist/` site**, automatically serving it on `127.0.0.1:4322`. The test configuration uses installed Microsoft Edge. On a machine without Edge, install Playwright Chromium (`npx playwright install chromium`) and remove `channel: "msedge"` in `playwright.config.ts`. Browser tests cover routes/images, 320–1920px reflow, startup and identity interaction, chapter motion and preferences, navigation, no-JS fallback, enlarged text, keyboard access, clipboard interaction, form validation and mocked delivery, and axe accessibility checks. No test sends real email.

`npm run test:motion` runs motion-related journeys. `npm run test:performance` builds and runs repeatable throttled Chromium measurements and asset budgets. Reports and screenshots are written to ignored `artifacts/`, `test-results/`, and `playwright-report/` directories.

## Structure

- `src/content/projects/`: validated Markdown for all six projects.
- `src/data/`: profile, navigation, and evidence-linked capabilities.
- `src/layouts/`: shared document and project layouts.
- `src/components/`: header/footer, static UI, flagship narrative, and engineering detail.
- `src/lib/motion/`: intro, identity interaction, scroll scenes, and persistent motion preferences.
- `src/lib/contact.ts`: validated EmailJS submission with timeout and retry states.
- `src/styles/`: finalized tokens and responsive editorial styles.
- `src/assets/`: authentic project media optimized by Astro.
- `public/`: favicon, social preview, font license, and optional approved résumé.
- `tests/browser/`: production browser regression journeys.
- `scripts/`: local build server, brand artwork generation, and visual review utilities.

## Content and deployment

EmailJS configuration, the approved PDF, precise personal contribution details, and final Vercel/domain configuration require owner input. Direct email and the online résumé remain available while these are pending.

Set `PUBLIC_SITE_URL` to the final HTTPS production origin before the production build. Without it, the site remains nonindexable; Vercel previews always remain nonindexable. Canonical URLs, social metadata, robots, and the collection-driven sitemap update at build time. `vercel.json` is ready for a new Vercel project. No backend or deployment credentials are included.

For the contact form, configure `PUBLIC_EMAILJS_SERVICE_ID`, `PUBLIC_EMAILJS_TEMPLATE_ID`, and `PUBLIC_EMAILJS_PUBLIC_KEY` in a local uncommitted `.env` and the deployment environment, then rebuild. These are intentionally public browser identifiers; never add a private key. Confirm the recipient, template variables, domain restrictions, and real delivery before relying on the form. Until configured, the form explains its status and keeps Send disabled.

Place an approved PDF at `public/resume/rendel-abainza-resume.pdf` and rebuild to enable the download automatically. To add a project, add a collection entry and local media; publication flags drive routes, archive, sitemap, and supporting homepage features.

Read [architecture and motion](ARCHITECTURE.md), [asset conventions](assets.md), and the original [development context](PORTFOLIO_PROJECT_DEVELOPMENT_CONTEXT.md). The planning context is preserved; implementation deviations are explained in the architecture notes.
