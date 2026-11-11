import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { YearlyIndexView } from "@/components/yearly-horoscope-article";
import { PAGES, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("tu-vi-2027");

export default function YearlyHoroscopeIndexPage() {
  const page = PAGES["tu-vi-2027"];
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: page.title,
          description: page.description,
          url: `${SITE_URL}${page.path}`,
          inLanguage: "vi",
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <LunaApp initialTab="article" article={<YearlyIndexView />} />
    </>
  );
}
