import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

export const metadata = pageMetadata("kinh-dich");

export default function KinhDichPage() {
  return (
    <>
      {/* Ảnh nền đầu trang là phần tử LCP nhưng nằm trong CSS → báo trình duyệt tải sớm.
          React 19 tự đưa thẻ này lên <head>. */}
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd data={toolJsonLd("kinh-dich")} />
      <LunaApp initialTab="kinh-dich" />
    </>
  );
}
