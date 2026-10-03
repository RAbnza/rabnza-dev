export const siteConfig = {
  name: "Rendel Abainza",
  title: "Rendel Abainza — Developer Portfolio",
  description:
    "Portfolio of Rendel Abainza, a developer focused on thoughtful interfaces and dependable systems.",
} as const;

// Set the owner-confirmed origin at build time; previews remain unindexed.
const configuredOrigin = import.meta.env.PUBLIC_SITE_URL;
export const siteOrigin = configuredOrigin
  ? new URL(configuredOrigin).origin
  : undefined;
export const isIndexable =
  Boolean(siteOrigin) && import.meta.env.VERCEL_ENV !== "preview";
