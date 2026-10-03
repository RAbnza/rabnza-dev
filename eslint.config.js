import eslint from "@eslint/js";
import astro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "test-results/",
      "playwright-report/",
      "artifacts/",
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,

  ...astro.configs.recommended,
);
