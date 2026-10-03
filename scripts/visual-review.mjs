/* global console, document, window */
import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (error) => console.log("PAGE ERROR", error.message));
await page.goto("http://localhost:4321/", { waitUntil: "domcontentloaded" });
if (await page.locator("[data-startup]").isVisible())
  await page.screenshot({ path: "artifacts/startup-desktop.png" });
await page.evaluate(() => document.fonts.ready);
await expect(page.locator("[data-startup]")).not.toBeVisible();
await page.screenshot({ path: "artifacts/home-desktop.png" });
await page.locator("#about").scrollIntoViewIfNeeded();
await page.screenshot({ path: "artifacts/about-desktop.png" });
await page.locator("#contact").scrollIntoViewIfNeeded();
await page.screenshot({ path: "artifacts/contact-desktop.png" });
await page.locator("#work").scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
console.log(
  await page.evaluate(() => ({
    enhanced: document.querySelector("[data-story]").dataset.enhanced,
    stageHeight: document.querySelector(".story-stage").offsetHeight,
    imgs: [...document.querySelectorAll(".story-frame img")].map((i) => [
      i.width,
      i.height,
      i.naturalWidth,
      i.naturalHeight,
    ]),
    motion: document.documentElement.dataset.motion,
  })),
);
await page.evaluate(() =>
  document.getElementById("track").scrollIntoView({ behavior: "instant" }),
);
await expect(page.locator('[data-frame="1"]')).toHaveCSS("opacity", "1");
await page.screenshot({ path: "artifacts/story-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:4321/");
await expect(page.locator("[data-startup]")).not.toBeVisible();
for (const img of await page.locator("main img").all()) {
  if (await img.isVisible()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0))
      .toBeTruthy();
  }
}
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
await page.screenshot({ path: "artifacts/mobile-top.png" });
await page.locator("#work").scrollIntoViewIfNeeded();
await page.screenshot({ path: "artifacts/mobile-work.png" });
await page.locator(".project-grid").scrollIntoViewIfNeeded();
await page.screenshot({ path: "artifacts/mobile-projects.png" });
await page.locator("#contact").scrollIntoViewIfNeeded();
await page.screenshot({ path: "artifacts/contact-mobile.png" });
await page.goto("http://localhost:4321/projects/");
await expect
  .poll(() =>
    page
      .locator("main img")
      .first()
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  )
  .toBeTruthy();
await page.screenshot({ path: "artifacts/archive-mobile.png" });
await page.goto("http://localhost:4321/projects/tindatrack/");
for (const img of await page.locator("main img").all()) {
  await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0))
    .toBeTruthy();
}
await page.screenshot({ path: "artifacts/case-mobile.png", fullPage: true });
await browser.close();
