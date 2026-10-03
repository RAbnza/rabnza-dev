import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Component test: run the actual contact module against the rendered form with
// injected test identifiers. All provider requests are intercepted; no mail is sent.
const source = readFileSync("src/lib/contact.ts", "utf8").replaceAll(
  /import\.meta\.env\.PUBLIC_EMAILJS_[A-Z_]+/g,
  '""',
);
const code = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText;
async function configure(page: Page) {
  await page.goto("/#contact");
  await page.evaluate(async (code) => {
    const module = await import(
      `data:text/javascript,${encodeURIComponent(code)}`
    );
    module.setupContactForm({
      service: "test-service",
      template: "test-template",
      publicKey: "test-public-key",
    });
  }, code);
}
async function fill(page: Page) {
  await page.getByLabel("Name", { exact: true }).fill("Portfolio test");
  await page.getByLabel("Email", { exact: true }).fill("test@example.com");
  await page
    .getByLabel("Message", { exact: true })
    .fill("A test message that is intercepted and never delivered.");
}
test("unconfigured form is honest and direct email remains available", async ({
  page,
}) => {
  await page.goto("/#contact");
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await expect(page.locator("[data-form-status]")).toContainText(
    "being connected",
  );
  await expect(page.locator(".email-link")).toHaveAttribute(
    "href",
    "mailto:abainzarendel11@gmail.com",
  );
});
test("contact validation, send payload, success and duplicate suppression", async ({
  page,
}) => {
  let sent = 0;
  await page.route(
    "https://api.emailjs.com/api/v1.0/email/send",
    async (route) => {
      sent++;
      const payload = route.request().postDataJSON();
      expect(payload.template_params.reply_to).toBe("test@example.com");
      expect(payload.template_params.message).toContain("intercepted");
      expect(payload).not.toHaveProperty("accessToken");
      await route.fulfill({
        status: 200,
        body: "OK",
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    },
  );
  await configure(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("Name", { exact: true })).toBeFocused();
  await expect(page.locator("#name-error")).toContainText("Please enter");
  expect(sent).toBe(0);
  await fill(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("[data-form-status]")).toContainText(
    "Message sent",
  );
  expect(sent).toBe(1);
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue("");
  await fill(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("[data-form-status]")).toContainText(
    "wait a moment",
  );
  expect(sent).toBe(1);
});
test("failed delivery preserves text and honeypot blocks provider requests", async ({
  page,
}) => {
  let sent = 0;
  await page.route(
    "https://api.emailjs.com/api/v1.0/email/send",
    async (route) => {
      sent++;
      await route.fulfill({
        status: 503,
        body: "Unavailable",
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    },
  );
  await configure(page);
  await fill(page);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("[data-form-status]")).toContainText(
    "could not be confirmed",
  );
  await expect(page.getByLabel("Message", { exact: true })).not.toHaveValue("");
  await page
    .locator('[name="website"]')
    .evaluate((input: HTMLInputElement) => (input.value = "bot.example"));
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("[data-form-status]")).toContainText(
    "use the email link",
  );
  expect(sent).toBe(1);
});
