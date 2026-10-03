import { test, expect } from "@playwright/test";

test("branded startup is brief and identity controls are keyboard accessible", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-startup]")).toBeVisible();
  await expect(page.locator("[data-startup]")).not.toBeVisible({
    timeout: 2000,
  });
  await expect(page.locator("h1")).toContainText("Rendel");
  await expect(page.locator(".personal-opening img")).toHaveCount(0);
  const logic = page.getByRole("button", { name: "Logic", exact: true });
  await logic.focus();
  await page.keyboard.press("Enter");
  await expect(logic).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-identity-caption]")).toHaveText(
    "Logic that gives every action a reason.",
  );
  await page.getByRole("button", { name: "Data", exact: true }).click();
  await expect(page.locator("[data-identity-caption]")).toHaveText(
    "Data that keeps the whole picture connected.",
  );
  await page.reload();
  await expect(page.locator("[data-startup]")).not.toBeVisible({
    timeout: 2000,
  });
});

test("reduced motion skips startup and failed JS cannot leave an overlay", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-startup]")).not.toBeVisible();
  await page.getByRole("button", { name: "Logic", exact: true }).click();
  await expect(page.locator('[data-identity-choice="1"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("[data-startup]")).not.toBeVisible({
    timeout: 2000,
  });
  await expect(page.locator("h1")).toBeVisible();
});

test("portfolio flow, section state and secondary return paths are clear", async ({
  page,
}) => {
  await page.goto("/#about");
  const order = await page
    .locator("[data-journey]")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-journey")),
    );
  expect(order).toEqual([
    "home",
    "about",
    "capabilities",
    "work",
    "more-work",
    "contact",
  ]);
  await expect(page.locator('[data-nav-section="about"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page
    .getByRole("link", { name: "View all projects", exact: true })
    .click();
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Projects", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page
    .getByRole("link", { name: "Explore TindaTrack", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }),
  ).toContainText("Portfolio");
  await page
    .getByRole("link", { name: "Back to portfolio", exact: true })
    .click();
  await expect(page).toHaveURL(/\/#work$/);
});

test("blocked session storage cannot trap the intro and mobile identity controls remain clear", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("[data-startup]")).not.toBeVisible();
  const controls = page.locator(".identity-controls");
  await expect(controls).toBeVisible();
  const bounds = await page.evaluate(() => ({
    bottom: Math.max(
      ...Array.from(
        document.querySelectorAll(".identity-layer"),
        (layer) => layer.getBoundingClientRect().bottom,
      ),
    ),
    controls: document
      .querySelector(".identity-controls")!
      .getBoundingClientRect().top,
  }));
  expect(bounds.bottom).toBeLessThan(bounds.controls);
  await page.getByRole("button", { name: "Data", exact: true }).click();
  await expect(page.locator('[data-identity-choice="2"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
