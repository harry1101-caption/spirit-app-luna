import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { FortuneStickView } from "@/components/fortune-stick-article";
import { FORTUNE_STICKS, fortuneStick, stickDescription, stickTitle } from "@/content/fortune-sticks";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/** Dựng sẵn 100 trang lúc build — nội dung tĩnh. */
export function generateStaticParams() {
  return FORTUNE_STICKS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = fortuneStick(slug);
  if (!s) notFound(); // slug lạ: trả 404 thật, không để thành soft 404 sau Suspense
  const path = `/xin-xam/${s.slug}`;
  const title = stickTitle(s);
  const description = stickDescription(s);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "vi_VN",
      siteName: SITE_NAME,
      url: path,
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  };
}

/**
 * Khung trang (LunaApp) không phụ thuộc slug nên nằm ngoài; phần đọc `params` bọc
 * trong Suspense để chuyển trang giữa các slug vẫn tức thì. Slug có trong
 * generateStaticParams vẫn được dựng sẵn đủ HTML lúc build.
 */
export default function FortuneStickPage({ params }: Props) {
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <LunaApp
        initialTab="article"
        article={
          <Suspense fallback={<div className="tarot-setup-panel min-h-[640px]" aria-busy="true" />}>
            <FortuneStickContent params={params} />
          </Suspense>
        }
      />
    </>
  );
}

async function FortuneStickContent({ params }: Props) {
  const { slug } = await params;
  const s = fortuneStick(slug);
  if (!s) notFound();
  const url = `${SITE_URL}/xin-xam/${s.slug}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: stickTitle(s),
              description: stickDescription(s),
              url,
              inLanguage: "vi",
              mainEntityOfPage: url,
              publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Xin xăm Quan Âm", item: `${SITE_URL}/xin-xam` },
                { "@type": "ListItem", position: 2, name: `Xăm số ${s.so}`, item: url },
              ],
            },
          ],
        }}
      />
      <FortuneStickView stick={s} />
    </>
  );
}
