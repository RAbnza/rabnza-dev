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

test("motion compositions build with the showcase, hold, and stay established on return", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?composition=${width}#home`);
    const heading = page.locator("#flagship-title");
    await expect(heading).toHaveAttribute("data-motion-policy", "scroll-once");
    await page.evaluate(() => document.fonts.ready);
    const top = await page
      .locator("#work")
      .evaluate((el) => el.getBoundingClientRect().top + scrollY);
    const revealed = () =>
      heading.evaluate((el) => {
        const style = getComputedStyle(el);
        const right = parseFloat(
          style.clipPath.slice(6).split(/\s+/)[1] || "0",
        );
        return Number(style.opacity) === 0 ? 0 : 1 - right / 100;
      });
    let previous = 0;
    let partial = false;
    let completedAt = 0;
    for (let y = top - 900; y <= top + 100; y += 25) {
      await scroll(page, y);
      const opacity = await revealed();
      expect(opacity).toBeGreaterThanOrEqual(previous - 0.002);
      if (!partial && opacity > 0.25 && opacity < 0.7) {
        partial = true;
        await page.waitForTimeout(350);
        expect(await revealed()).toBeCloseTo(opacity, 2);
        await scroll(page, y - 60);
        expect(await revealed()).toBeCloseTo(opacity, 2);
        await scroll(page, y);
      }
      if (!completedAt && opacity >= 0.999) completedAt = y;
      previous = opacity;
    }
    expect(partial).toBe(true);
    expect(previous).toBe(1);
    await scroll(page, completedAt);
    const composition = await page.locator("#work").evaluate((el) => {
      const nav = el.querySelector(".chapter-nav")!;
      const visual = el.querySelector(
        el.hasAttribute("data-enhanced") ? ".story-stage" : ".chapter-nav",
      )!;
      return {
        visualTop: visual.getBoundingClientRect().top,
        navOpacity: Number(getComputedStyle(nav).opacity),
        titleTop: el.querySelector("h2")!.getBoundingClientRect().top,
      };
    });
    expect(composition.visualTop).toBeLessThan(850);
    expect(composition.navOpacity).toBeGreaterThan(0.9);
    expect(composition.titleTop).toBeGreaterThan(60);
    await page.screenshot({
      path: `artifacts/refinement/work-established-${width}.png`,
    });
    await scroll(page, top + 1000);
    await scroll(page, top - 500);
    await expect(heading).toHaveCSS("opacity", "1");
    await page.setViewportSize({ width, height: 840 });
    await expect(heading).toHaveCSS("opacity", "1");
  }
});

test("motion pre-paint gate covers a delayed import and late imports never reset visible text", async ({
  page,
}) => {
  for (const delay of [650, 1800]) {
    await page.route("**/portfolio.*.js", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      await route.continue();
    });
    await page.goto(`/?delay=${delay}#home`, { waitUntil: "domcontentloaded" });
    const title = page.locator("#flagship-title");
    if (delay === 650) {
      await expect(page.locator("html")).toHaveAttribute(
        "data-motion-boot",
        "pending",
      );
      await expect(title).toHaveCSS("opacity", "0");
      await expect(title).toHaveAttribute("data-text-state", "pending");
      await expect(title).toHaveCSS("opacity", "0");
    } else {
      await expect(page.locator("html")).not.toHaveAttribute(
        "data-motion-boot",
        { timeout: 1700 },
      );
      await expect(title).toHaveCSS("opacity", "1");
      await expect(title).toHaveAttribute("data-text-state", "settled");
      await expect(title).toHaveCSS("opacity", "1");
    }
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("motion ordinary text is hidden before arrival and metadata stays calm on re-entry", async ({
  page,
}) => {
  await page.goto("/#home");
  const tags = page.locator(".project-card .tags").first();
  await expect(tags).toHaveAttribute("data-text-state", "pending");
  await expect(tags).toHaveCSS("opacity", "0");
  await tags.scrollIntoViewIfNeeded();
  await expect(tags).toHaveAttribute("data-text-state", "settled");
  await expect(tags).toHaveCSS("transform", "none");
  await scroll(page, 0);
  await tags.scrollIntoViewIfNeeded();
  await expect(tags).toHaveAttribute("data-text-state", "settled");
  await page.waitForTimeout(1000);
  await expect(tags).toHaveCSS("transform", "none");
  await expect(tags).toHaveCSS("opacity", "1");
});
