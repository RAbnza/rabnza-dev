/* global document, window */
import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import process from "node:process";

await mkdir("artifacts/cinematic", { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const origin = process.env.REVIEW_URL ?? "http://127.0.0.1:4322";
await page.goto(origin, { waitUntil: "domcontentloaded" });
await expect(page.locator("html")).toHaveAttribute("data-intro", "playing");
await page.waitForTimeout(1000);
await page.screenshot({ path: "artifacts/cinematic/loader.png" });
await expect(page.locator(".intro-scene")).toHaveCSS("opacity", "1");
await page.waitForTimeout(950);
await page.screenshot({ path: "artifacts/cinematic/intro.png" });
await expect(page.locator("[data-startup]")).not.toBeVisible();
await page.waitForTimeout(1300);
await page.screenshot({ path: "artifacts/cinematic/hero.png" });
for (const width of [1440, 390, 320]) {
  await page.setViewportSize({ width, height: 900 });
  for (const id of [
    "about",
    "tech-stack",
    "work",
    "track",
    "more-work",
    "contact",
  ]) {
    await page.evaluate(
      (id) =>
        document.getElementById(id).scrollIntoView({ behavior: "instant" }),
      id,
    );
    // Capture settled text, with scroll-driven geometry at this exact position.
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `artifacts/cinematic/${id}-${width}.png` });
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `artifacts/cinematic/hero-${width}.png` });
}
await browser.close();
if (errors.length) throw new Error(errors.join("\n"));
