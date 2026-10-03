import { siteOrigin, isIndexable } from "@/data/site";
export function GET() {
  return new Response(
    isIndexable
      ? `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
