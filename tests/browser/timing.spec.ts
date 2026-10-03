import { test, expect, type Page } from "@playwright/test";

const scroll = async (page: Page, top: number) => {
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    top,
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
};

test("text entrances stay within the viewport for their entire animation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.assign(window, { widestFrame: 0 });
    const state = window as unknown as { widestFrame: number };
    const start = performance.now();
    const sample = () => {
      state.widestFrame = Math.max(
        state.widestFrame,
        document.documentElement.scrollWidth,
      );
      if (performance.now() - start < 1900) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  for (const width of [390, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/resume/", "/projects/", "/projects/tindatrack/"]) {
      await page.goto(route);
      await page.waitForTimeout(2000);
      expect(
        await page.evaluate(
          () => (window as unknown as { widestFrame: number }).widestFrame,
        ),
        `${route} at ${width}`,
      ).toBeLessThanOrEqual(width + 1);
    }
  }
});

test("person markers keep a real gap before, during and after motion", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?markers=${width}#home`);
    await expect(page.locator("html")).toHaveAttribute(
      "data-journey-motion",
      "true",
    );
    const bounds = await page.locator("#about").evaluate((el) => ({
      top: el.getBoundingClientRect().top + scrollY,
      height: (el as HTMLElement).offsetHeight,
    }));
    for (const y of [
      bounds.top - 850,
      bounds.top - 350,
      bounds.top + bounds.height / 2,
    ]) {
      await scroll(page, y);
      const words = await page
        .locator(".about-thread > .mono")
        .evaluateAll((elements) =>
          elements.map((el) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            const dot = getComputedStyle(el, "::before");
            return {
              text: el.textContent,
              gap:
                range.getBoundingClientRect().left -
                el.getBoundingClientRect().left -
                parseFloat(dot.width),
              dot: dot.display,
              position: dot.position,
            };
          }),
        );
      expect(words.map((word) => word.text)).toEqual([
        "Observe",
        "Understand",
        "Build",
      ]);
      for (const word of words) {
        if (width >= 768) {
          expect(word.position).not.toBe("absolute");
          expect(word.gap).toBeGreaterThanOrEqual(15);
        } else expect(word.dot).toBe("none");
      }
    }
    await page
      .locator("#about")
      .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
    await expect(page.locator(".about-copy .lead")).toHaveAttribute(
      "data-text-state",
      "settled",
    );
    await page.screenshot({
      path: `artifacts/cinematic/person-timing-${width}.png`,
    });
    await page.selectOption("#motion-preference", "reduced");
    await expect(page.locator(".about-thread .mono").first()).toHaveCSS(
      "transform",
      "none",
    );
    await page.selectOption("#motion-preference", "full");
  }
});

test("major reveals follow attention, hold when scrolling stops and reverse at every speed", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?scrub=${width}#home`);
    await expect(page.locator("#flagship-title")).toHaveAttribute(
      "data-motion-policy",
      "scroll",
    );
    await page.evaluate(() => document.fonts.ready);
    const heading = page.locator("#flagship-title");
    const geometry = await heading.evaluate((el) => {
      const header = (document.querySelector(".site-header") as HTMLElement)
        .offsetHeight;
      return {
        top: el.getBoundingClientRect().top + scrollY,
        height: (el as HTMLElement).offsetHeight,
        header,
        available: innerHeight - header,
      };
    });
    const nearBottom =
      geometry.top - geometry.header - geometry.available * 0.82;
    const central =
      geometry.top +
      geometry.height / 2 -
      geometry.header -
      geometry.available * 0.48;
    const mask = () =>
      heading.evaluate((el) =>
        parseFloat(getComputedStyle(el).clipPath.match(/[\d.]+%/)![0]),
      );
    await scroll(page, nearBottom);
    const early = await mask();
    expect(early).toBeGreaterThan(75);
    await page.waitForTimeout(650);
    expect(await mask()).toBeCloseTo(early, 1);
    const middle = (nearBottom + central) / 2;
    await scroll(page, middle);
    const partial = await mask();
    expect(partial).toBeGreaterThan(20);
    expect(partial).toBeLessThan(65);
    // Small / normal / full-range steps exercise both directions, not a timer.
    for (const step of [12, 80, central - nearBottom]) {
      await scroll(page, nearBottom);
      let previous = await mask();
      for (let y = nearBottom + step; y < central; y += step) {
        await scroll(page, y);
        const current = await mask();
        expect(current).toBeLessThanOrEqual(previous + 0.2);
        previous = current;
      }
      await scroll(page, central + 2);
      expect(await mask()).toBeLessThan(0.2);
      for (let y = central - step; y > nearBottom; y -= step)
        await scroll(page, y);
      await scroll(page, middle);
      expect(await mask()).toBeCloseTo(partial, 0);
      await scroll(page, nearBottom);
      expect(await mask()).toBeCloseTo(early, 0);
    }
    await scroll(page, 100000);
    await scroll(page, central);
    expect(await mask()).toBeLessThan(0.2);
    // Resizing while About is sticky must not move its normal-flow scroll range.
    await page
      .locator("#about")
      .evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
    await page.setViewportSize({ width, height: 880 });
    await page.setViewportSize({ width, height: 900 });
    await scroll(page, middle);
    expect(await mask()).toBeCloseTo(partial, 0);
  }
});

test("paragraphs wait for the reading band and have deliberate time to settle", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?reading=${width}#home`);
    const paragraph = page.locator(".about-copy .lead");
    await expect(paragraph).toHaveAttribute("data-text-motion", "body");
    const top = await paragraph.evaluate(
      (el) => el.getBoundingClientRect().top + scrollY,
    );
    await scroll(page, top - 800);
    await page.waitForTimeout(700);
    await expect(paragraph).not.toHaveAttribute(
      "data-text-state",
      /running|settled/,
    );
    await scroll(page, top - 560);
    await expect(paragraph).toHaveAttribute("data-text-state", "running");
    await page.waitForTimeout(700);
    await expect(paragraph).toHaveAttribute("data-text-state", "running");
    await expect(paragraph).toHaveAttribute("data-text-state", "settled");
    await expect(paragraph).toHaveCSS("clip-path", "none");
    await scroll(page, 100000);
    await scroll(page, top - 300);
    await expect(paragraph).toHaveAttribute("data-text-state", "settled");
  }
});
