import { test, expect } from "@playwright/test";
import { readFile, readdir, stat, mkdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

test("production asset budgets and repeatable throttled load", async ({
  browser,
}) => {
  test.setTimeout(60000);
  const assets = await readdir("dist/_astro");
  let allJs = 0;
  let fontBytes = 0;
  let largestImage = 0;
  for (const filename of assets) {
    const file = `dist/_astro/${filename}`;
    if (filename.endsWith(".js"))
      allJs += gzipSync(await readFile(file)).length;
    if (filename.endsWith(".woff2")) fontBytes += (await stat(file)).size;
    if (filename.endsWith(".webp"))
      largestImage = Math.max(largestImage, (await stat(file)).size);
  }
  expect(allJs).toBeLessThan(180 * 1024);
  expect(fontBytes).toBeLessThan(100 * 1024);
  expect(largestImage).toBeLessThan(200 * 1024);
  const runs: Array<Record<string, number>> = [];
  for (let run = 0; run < 3; run++) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 1_600_000 / 8,
      uploadThroughput: 750_000 / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      const metrics = { lcp: 0, cls: 0 };
      Object.assign(window, { portfolioLab: metrics });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!shift.hadRecentInput) metrics.cls += shift.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("[data-startup]")).not.toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const metrics = await page.evaluate(() => {
      const lab = (
        window as unknown as { portfolioLab: { lcp: number; cls: number } }
      ).portfolioLab;
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      return {
        ...lab,
        transfer: resources.reduce(
          (sum, r) => sum + r.transferSize,
          nav.transferSize,
        ),
        jsTransfer: resources
          .filter((r) => r.name.endsWith(".js"))
          .reduce((sum, r) => sum + r.transferSize, 0),
      };
    });
    expect(metrics.transfer).toBeLessThan(700 * 1024);
    expect(metrics.jsTransfer).toBeLessThan(100 * 1024);
    expect(metrics.cls).toBeLessThanOrEqual(0.1);
    runs.push(metrics);
    await context.close();
  }
  await mkdir("artifacts", { recursive: true });
  await writeFile(
    "artifacts/performance.json",
    JSON.stringify(
      {
        conditions:
          "Chromium, 390×844, DPR 1, cold cache, 4× CPU slowdown, 1.6 Mbps down / 750 Kbps up / 150 ms latency, local gzip server",
        allJsGzipBytes: allJs,
        fontBytes,
        largestWebpBytes: largestImage,
        runs,
      },
      null,
      2,
    ),
  );
});
