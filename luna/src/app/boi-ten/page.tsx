import type { Metadata } from "next";
import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd, SITE_NAME } from "@/lib/seo";
import { cleanName, nameLove } from "@/lib/name-love";

type Props = { searchParams: Promise<{ a?: string; b?: string }> };

/** Link kết quả có tiêu đề riêng để người nhận trên Zalo/Messenger thấy ngay hai cái tên. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { a, b } = await searchParams;
  const base = pageMetadata("boi-ten");
  const nameA = cleanName(a);
  const nameB = cleanName(b);
  if (!nameA || !nameB) return base;
  const r = nameLove(nameA, nameB);
  const title = `${r.a.firstName} & ${r.b.firstName}: ${r.cross.outcome.title} ${r.cross.outcome.emoji} hợp ${r.pyramid.percent}%`;
  const description = "Bói tình duyên qua tên: gạch chữ trùng, tháp YÊU THƯƠNG và Số Linh hồn. Bấm để xem chi tiết.";
  return {
    ...base,
    title,
    description,
    // Link cá nhân không cần index; canonical giữ về trang gốc
    robots: { index: false, follow: true },
    openGraph: { ...base.openGraph, title: `${title} · ${SITE_NAME}`, description },
    twitter: { ...base.twitter, title, description },
  };
}

/** Như /hop-nhau: trang đọc `searchParams` cho cả app shell, nên render theo yêu cầu. */
export const instant = false;

export default async function NameLovePage({ searchParams }: Props) {
  const { a, b } = await searchParams;
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd data={toolJsonLd("boi-ten")} />
      <LunaApp initialTab="boi-ten" nameLove={{ a, b }} />
    </>
  );
}
