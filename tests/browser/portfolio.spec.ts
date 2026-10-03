import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/projects/",
  "/projects/tindatrack/",
  "/projects/homeroom/",
  "/projects/travelwise/",
  "/projects/radmedics/",
  "/projects/rentease/",
  "/projects/original-portfolio/",
  "/resume/",
  "/404/",
];

test("every route renders, internal links resolve, and images load", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(route === "/404/" ? 404 : 200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute("href")!),
      );
    for (const href of new Set(hrefs)) {
      const [path, hash] = href.split("#");
      const target = path || route;
      expect(
        routes.includes(target) || target.endsWith(".pdf"),
        href,
      ).toBeTruthy();
      if (hash && target === route)
        await expect(page.locator(`[id="${hash}"]`)).toHaveCount(1);
    }
    // Trigger lazy image loads without arbitrary delays.
    for (const image of await page.locator("main img").all()) {
      if (await image.isVisible()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (img) =>
                (img as HTMLImageElement).complete &&
                (img as HTMLImageElement).naturalWidth > 0,
            ),
          )
          .toBeTruthy();
      }
    }
  }
  expect(errors).toEqual([]);
});

test("responsive routes fit narrow mobile through desktop", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/projects/",
      "/projects/tindatrack/",
      "/resume/",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: innerWidth,
      }));
      expect(dimensions.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(
        dimensions.viewport + 1,
      );
    }
  }
});

test("motion chapters support forward/reverse scrolling, anchors, and live preferences", async ({
  page,
}) => {
  await page.goto("/#work");
  const story = page.locator("[data-story]");
  await expect(story).toHaveAttribute("data-enhanced", "true");
  for (const id of ["track", "review", "sell"]) {
    await page.evaluate(
      (id) =>
        document.getElementById(id)!.scrollIntoView({ behavior: "instant" }),
      id,
    );
    await expect(page.locator(`[data-chapter-link="${id}"]`)).toHaveAttribute(
      "aria-current",
      "step",
    );
    const index = ["sell", "track", "review"].indexOf(id);
    await expect(page.locator(`[data-frame="${index}"]`)).toHaveCSS(
      "opacity",
      "1",
    );
  }
  await page.selectOption("#motion-preference", "reduced");
  await expect(story).not.toHaveAttribute("data-enhanced");
  await expect(page.locator(".story-inline-media").first()).toBeVisible();
  await page.reload();
  await expect(page.locator("#motion-preference")).toHaveValue("reduced");
  await page.selectOption("#motion-preference", "full");
  await expect(story).toHaveAttribute("data-enhanced", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(story).not.toHaveAttribute("data-enhanced");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(story).toHaveAttribute("data-enhanced", "true");
});

test("reduced motion, keyboard navigation and email copy work", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("[data-story]")).not.toHaveAttribute(
    "data-enhanced",
  );
  await page.getByRole("button", { name: "Copy email address" }).click();
  await expect(page.locator("[data-copy-status]")).toHaveText(
    "Email address copied.",
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "abainzarendel11@gmail.com",
  );
});

test("static pages retain all content without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4322/");
  await expect(page.locator(".story-inline-media")).toHaveCount(3);
  await expect(page.locator(".story-inline-media").last()).toBeVisible();
  await page.getByRole("link", { name: "View my résumé", exact: true }).click();
  await expect(page.locator("h1")).toContainText("Rendel Abainza");
  await context.close();
});

test("WCAG automated audit on all pages and narrow mobile", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations,
      `${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("motion survives denied storage, live OS changes, and history restoration", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto("/#review");
  await expect(page.locator("[data-story]")).toHaveAttribute(
    "data-enhanced",
    "true",
  );
  await expect(page.locator('[data-frame="2"]')).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-story]")).not.toHaveAttribute(
    "data-enhanced",
  );
  await page.selectOption("#motion-preference", "full");
  await expect(page.locator("[data-story]")).toHaveAttribute(
    "data-enhanced",
    "true",
  );
  await page
    .getByRole("link", { name: "Read the case study", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("TindaTrack");
  await page.goBack();
  await expect(page.locator("h1")).toContainText("Rendel");
  await page.selectOption("#motion-preference", "reduced");
  await expect(page.locator(".story-stage")).not.toBeVisible();
});

test("failed animation download retains static chapters and working controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/portfolio.*.js", (route) => route.abort());
  await page.goto("/#work");
  await expect(page.locator(".story-inline-media").first()).toBeVisible();
  await page.selectOption("#motion-preference", "reduced");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  expect(errors).toEqual([]);
});

test("short screens, touch, and enlarged text retain a usable layout", async ({
  page,
  browser,
}) => {
  await page.setViewportSize({ width: 1280, height: 650 });
  await page.goto("/#work");
  await expect(page.locator(".story-stage")).not.toBeVisible();
  // 200% text sizing exercises the rem-based motion eligibility guard.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  await expect(page.locator(".story-stage")).not.toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1440);
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const touchPage = await touch.newPage();
  await touchPage.goto("http://127.0.0.1:4322/");
  await touchPage
    .getByRole("link", { name: "Contact", exact: true })
    .first()
    .tap();
  await expect(touchPage).toHaveURL(/#contact$/);
  await expect(touchPage.locator("#contact")).toBeInViewport();
  await touch.close();
});
