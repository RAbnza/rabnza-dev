import { test, expect } from "@playwright/test";

test("motion opening hands off once and does not replay across breakpoints", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const counts: Record<string, number> = {};
    Object.assign(window, { motionStarts: counts });
    const travel: number[] = [];
    Object.assign(window, { introTravel: travel });
    document.addEventListener("portfolio:hero-ready", () => {
      Object.assign(window, {
        heroReleasedDuringOpening:
          document.documentElement.dataset.intro === "playing",
      });
    });
    const start = performance.now();
    const sample = () => {
      const phrase = document.querySelector("[data-intro-phrase]");
      const scene = document.querySelector(".intro-scene");
      if (
        phrase &&
        scene &&
        Number(getComputedStyle(scene).opacity) > 0.05 &&
        document.documentElement.hasAttribute("data-intro")
      )
        travel.push(new DOMMatrix(getComputedStyle(phrase).transform).m42);
      if (performance.now() - start < 6500) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const element = mutation.target as HTMLElement;
        if (
          mutation.attributeName === "data-text-state" &&
          element.dataset.textState === "running"
        )
          counts[element.id || element.className] =
            (counts[element.id || element.className] || 0) + 1;
      }
    }).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-text-state"],
    });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-intro", "playing");
  await expect(page.locator("#hero-title")).toHaveCSS("visibility", "hidden");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#hero-title")).toHaveAttribute(
    "data-text-state",
    "running",
  );
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { heroReleasedDuringOpening: boolean })
          .heroReleasedDuringOpening,
    ),
  ).toBe(true);
  await expect(page.locator("#hero-title")).toHaveAttribute(
    "data-text-state",
    "settled",
  );
  await expect(page.locator("[data-startup]")).not.toBeVisible();
  const travel = await page.evaluate(
    () => (window as unknown as { introTravel: number[] }).introTravel,
  );
  expect(travel.length).toBeGreaterThan(10);
  for (let index = 1; index < travel.length; index++)
    expect(travel[index]! - travel[index - 1]!).toBeLessThan(1);
  for (const width of [767, 768, 1023, 1024, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator("#hero-title")).toHaveAttribute(
      "data-text-state",
      "settled",
    );
  }
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { motionStarts: Record<string, number> })
          .motionStarts["hero-title"],
    ),
  ).toBe(1);
});

test("native typography keeps its markup, wrapping and height after entrances", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  const selectors = [
    "#hero-title",
    ".opening-tagline",
    "#about-title",
    "#capabilities-title",
    ".about-copy .lead",
    "#contact-title",
  ];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await staticPage.setViewportSize({ width, height: 900 });
    await Promise.all([
      page.goto("/#about"),
      staticPage.goto("http://127.0.0.1:4322/"),
    ]);
    await Promise.all([
      page.evaluate(() => document.fonts.ready),
      staticPage.evaluate(() => document.fonts.ready),
    ]);
    for (const selector of selectors) {
      const natural = await staticPage.locator(selector).evaluate((el) => ({
        html: el.innerHTML,
        height: (el as HTMLElement).offsetHeight,
        lineHeight: getComputedStyle(el).lineHeight,
      }));
      await page.locator(selector).scrollIntoViewIfNeeded();
      const animated = await page.locator(selector).evaluate((el) => ({
        html: el.innerHTML,
        height: (el as HTMLElement).offsetHeight,
        lineHeight: getComputedStyle(el).lineHeight,
      }));
      expect(animated, `${selector} at ${width}`).toEqual(natural);
    }
    await expect(page.locator(".text-word, .text-mask")).toHaveCount(0);
  }
  await context.close();
});

test("mobile viewport stays at scale one throughout scrolling and identity interaction", async ({
  browser,
}) => {
  test.setTimeout(60000);
  const context = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  for (const width of [320, 360, 390, 430, 600, 768, 820, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("http://127.0.0.1:4322/#about");
    await expect(page.locator("html")).toHaveAttribute(
      "data-journey-motion",
      "true",
    );
    for (const fraction of [0, 0.15, 0.4, 0.7, 1, 0]) {
      await page.evaluate(
        (fraction) =>
          window.scrollTo({
            top:
              (document.documentElement.scrollHeight - innerHeight) * fraction,
            behavior: "instant",
          }),
        fraction,
      );
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        inner: innerWidth,
        scale: visualViewport!.scale,
      }));
      expect(dimensions.width).toBe(width);
      expect(
        dimensions.scroll,
        `scroll width at ${width}, ${fraction}`,
      ).toBeLessThanOrEqual(width + 1);
      expect(dimensions.inner).toBe(width);
      expect(dimensions.scale).toBe(1);
    }
    for (const name of ["Logic", "Data", "Interface"]) {
      await page.getByRole("button", { name, exact: true }).click();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width + 1);
    }
  }
  await context.close();
});

test("text stays settled on reentry and responsive rebuilds do not accumulate observers", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const live = { intersection: 0, resize: 0 };
    Object.assign(window, { liveMotionObservers: live });
    const IO = IntersectionObserver;
    const RO = ResizeObserver;
    window.IntersectionObserver = class extends IO {
      alive = true;
      constructor(...args: ConstructorParameters<typeof IO>) {
        super(...args);
        live.intersection++;
      }
      disconnect() {
        if (this.alive) live.intersection--;
        this.alive = false;
        super.disconnect();
      }
    };
    window.ResizeObserver = class extends RO {
      alive = true;
      constructor(...args: ConstructorParameters<typeof RO>) {
        super(...args);
        live.resize++;
      }
      disconnect() {
        if (this.alive) live.resize--;
        this.alive = false;
        super.disconnect();
      }
    };
  });
  await page.goto("/#about");
  const paragraph = page.locator(".about-copy .lead");
  await expect(paragraph).toHaveAttribute("data-text-state", "settled");
  const baseline = await page.evaluate(
    () =>
      (window as unknown as { liveMotionObservers: object })
        .liveMotionObservers,
  );
  const tags = page.locator(".project-card .tags").first();
  await tags.scrollIntoViewIfNeeded();
  await expect(tags).toHaveAttribute("data-text-state", "settled");
  await paragraph.scrollIntoViewIfNeeded();
  await expect(paragraph).toHaveAttribute("data-text-state", "settled");
  await tags.scrollIntoViewIfNeeded();
  await expect(tags).toHaveAttribute("data-text-state", "settled");
  for (let repeat = 0; repeat < 3; repeat++) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.selectOption("#motion-preference", "reduced");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.selectOption("#motion-preference", "full");
  }
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { liveMotionObservers: object })
            .liveMotionObservers,
      ),
    )
    .toEqual(baseline);
});
