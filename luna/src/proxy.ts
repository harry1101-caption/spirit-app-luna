import { NextResponse, type NextRequest } from "next/server";
import { DREAM_ARTICLES } from "@/content/dream-articles";
import { SIGNS } from "@/content/yearly-horoscope-2027";
import { STICK_COUNT } from "@/lib/xin-xam";

/**
 * Trả 404 thật cho slug không tồn tại ở các trang bài tra cứu.
 *
 * Các page này đọc `params` trong <Suspense> (để chuyển trang tức thì với
 * cacheComponents), nên notFound() bên trong chạy sau khi đã gửi status 200 —
 * Google sẽ coi là soft 404. `dynamicParams = false` không dùng được khi bật
 * cacheComponents, vì vậy chặn ở đây, trước khi render.
 */
const known: Record<string, Set<string>> = {
  "giac-mo": new Set(DREAM_ARTICLES.map((a) => a.slug)),
  "tu-vi-2027": new Set(SIGNS.map((s) => s.slug)),
  "xin-xam": new Set(Array.from({ length: STICK_COUNT }, (_, i) => `xam-so-${i + 1}`)),
};

export function proxy(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  if (known[section]?.has(decodeURIComponent(slug))) return NextResponse.next();
  // Đường dẫn không có route → Next trả trang not-found kèm status 404
  return NextResponse.rewrite(new URL("/_slug-not-found", request.url));
}

export const config = {
  matcher: ["/giac-mo/:slug", "/tu-vi-2027/:slug", "/xin-xam/:slug"],
};
