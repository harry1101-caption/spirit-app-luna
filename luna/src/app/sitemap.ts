import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES).map((page) => ({
    url: `${SITE_URL}${page.path === "/" ? "" : page.path}`,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.priority,
  }));
}
