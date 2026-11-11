import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

export const metadata = pageMetadata("tarot");

/**
 * `?chu-de=love|work` đến từ khối "Chọn một chủ đề để bắt đầu" ở trang chủ.
 * Phải đi qua URL chứ không phải React state, vì điều hướng sang đây là tải lại
 * cả trang nên state đặt trước đó đã mất.
 *
 * `instant = false` là bắt buộc: `cacheComponents` đang bật, mà đọc
 * `searchParams` ngoài <Suspense> thì Next chặn ngay lúc sinh trang tĩnh. Bọc
 * Suspense ở đây không giúp gì vì phần động chính là toàn bộ app shell. Đổi lại
 * trang này render theo yêu cầu thay vì tĩnh — chấp nhận được, vì nó vốn phụ
 * thuộc query string.
 */
export const instant = false;

export default async function TarotPage({
  searchParams,
}: {
  searchParams: Promise<{ "chu-de"?: string }>;
}) {
  const { "chu-de": topic } = await searchParams;
  return (
    <>
      {/* Ảnh nền đầu trang là phần tử LCP nhưng nằm trong CSS → báo trình duyệt tải sớm.
          React 19 tự đưa thẻ này lên <head>. */}
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd data={toolJsonLd("tarot")} />
      <LunaApp initialFlow="tarot" initialTopic={topic} />
    </>
  );
}
