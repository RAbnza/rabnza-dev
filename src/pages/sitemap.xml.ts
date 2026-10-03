import { getCollection } from "astro:content";
import { siteOrigin, isIndexable } from "@/data/site";
export async function GET() {
  const projects = await getCollection(
    "projects",
    ({ data }) => data.publication.published,
  );
  const paths = [
    "/",
    "/projects/",
    "/resume/",
    ...projects.map((project) => `/projects/${project.id}/`),
  ];
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll('"', "&quot;");
  const urls = isIndexable
    ? paths
        .map(
          (path) =>
            `<url><loc>${escape(new URL(path, siteOrigin).href)}</loc></url>`,
        )
        .join("")
    : "";
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
