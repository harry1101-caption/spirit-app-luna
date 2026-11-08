import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { DreamArticleView } from "@/components/dream-article";
import { DREAM_ARTICLES, dreamArticle } from "@/content/dream-articles";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/** Dựng sẵn mọi trang lúc build — nội dung tĩnh, không đọc gì lúc request. */
export function generateStaticParams() {
  return DREAM_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = dreamArticle(slug);
  if (!a) return { title: "Giải mã giấc mơ", robots: { index: false } };
  const path = `/giac-mo/${a.slug}`;
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "vi_VN",
      siteName: SITE_NAME,
      url: path,
      title: `${a.title} · ${SITE_NAME}`,
      description: a.description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: a.title }],
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.description, images: [OG_IMAGE] },
  };
}

export default async function DreamArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = dreamArticle(slug);
  if (!a) notFound();
  const url = `${SITE_URL}/giac-mo/${a.slug}`;
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: a.title,
              description: a.description,
              url,
              inLanguage: "vi",
              mainEntityOfPage: url,
              publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Giải mã giấc mơ", item: `${SITE_URL}/giac-mo` },
                { "@type": "ListItem", position: 2, name: a.title, item: url },
              ],
            },
          ],
        }}
      />
      <LunaApp initialTab="article" article={<DreamArticleView article={a} />} />
    </>
  );
}
