import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";

/** Feature đang tạm dừng — không đưa vào sitemap */
const PAUSED_PATHS = new Set(["/duyen", "/tinh-cach"]);

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES).filter((page) => !PAUSED_PATHS.has(page.path)).map((page) => ({
    url: `${SITE_URL}${page.path === "/" ? "" : page.path}`,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.priority,
  }));
}
