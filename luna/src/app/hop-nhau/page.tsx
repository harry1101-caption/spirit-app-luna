import type { Metadata } from "next";
import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd, SITE_NAME } from "@/lib/seo";
import { compatibility, decodePerson, firstName } from "@/lib/hop-nhau";

type Props = { searchParams: Promise<{ m?: string; b?: string }> };

/**
 * Link mời và link kết quả có ảnh xem trước riêng — trên Zalo/Messenger, đây là thứ
 * quyết định người nhận có bấm hay không. Trang gốc /hop-nhau dùng metadata SEO chung.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { m, b } = await searchParams;
  const base = pageMetadata("hop-nhau");
  const a = decodePerson(m);
  if (!a) return base;
  const partner = decodePerson(b);
  let score: number | null = null;
  try {
    score = partner ? compatibility(a, partner).score : null;
  } catch {
    score = null;
  }
  const title = partner && score !== null
    ? `${firstName(a.name)} & ${firstName(partner.name)} hợp nhau ${score}%`
    : `${firstName(a.name)} muốn biết hai bạn hợp nhau bao nhiêu %`;
  const description = partner ? "Xem chi tiết điểm hợp, chỗ dễ lệch và việc nên làm cùng nhau." : "Nhập ngày sinh của bạn để mở kết quả. Không cần tài khoản.";
  const image = `/hop-nhau/og?${new URLSearchParams({ m: m!, ...(partner && b ? { b } : {}) })}`;
  return {
    ...base,
    title,
    description,
    // Link cá nhân không cần index; canonical giữ về trang gốc
    robots: { index: false, follow: true },
    openGraph: { ...base.openGraph, title: `${title} · ${SITE_NAME}`, description, images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/** Như /tarot: trang đọc `searchParams` cho cả app shell, nên render theo yêu cầu (cacheComponents). */
export const instant = false;

export default async function HopNhauPage({ searchParams }: Props) {
  const { m, b } = await searchParams;
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd data={toolJsonLd("hop-nhau")} />
      <LunaApp initialTab="hop-nhau" hopNhau={{ m, b }} />
    </>
  );
}
