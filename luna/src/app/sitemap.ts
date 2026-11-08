import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "@/lib/seo";
import { DREAM_ARTICLES } from "@/content/dream-articles";

/** Feature đang tạm dừng — không đưa vào sitemap */
const PAUSED_PATHS = new Set(["/duyen", "/tinh-cach"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = Object.values(PAGES).filter((page) => !PAUSED_PATHS.has(page.path)).map((page) => ({
    url: `${SITE_URL}${page.path === "/" ? "" : page.path}`,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.priority,
  }));
  // Trang tra cứu "Nằm mơ thấy …"
  const dreams: MetadataRoute.Sitemap = DREAM_ARTICLES.map((a) => ({
    url: `${SITE_URL}/giac-mo/${a.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...pages, ...dreams];
}
