import type { Metadata } from "next";
import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd, SITE_NAME } from "@/lib/seo";
import { canChiOfYear, parseTimingParams } from "@/lib/love-timing";

type Props = { searchParams: Promise<{ y?: string; s?: string }> };

/** Link kết quả có tiêu đề riêng theo tuổi để người nhận thấy ngay đây là của ai. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { y, s } = await searchParams;
  const base = pageMetadata("khi-nao-co-nguoi-yeu");
  const input = parseTimingParams(y, s);
  if (!input) return base;
  const title = `Tuổi ${canChiOfYear(input.lunarYear)}: khi nào có người yêu?`;
  const description = "Năm và tháng tình duyên vượng theo sao Đào Hoa, Hồng Loan, Thiên Hỷ. Bấm để xem, hoặc nhập ngày sinh của bạn.";
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

export default async function LoveTimingPage({ searchParams }: Props) {
  const { y, s } = await searchParams;
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd data={toolJsonLd("khi-nao-co-nguoi-yeu")} />
      <LunaApp initialTab="khi-nao-co-nguoi-yeu" loveTiming={{ y, s }} />
    </>
  );
}
