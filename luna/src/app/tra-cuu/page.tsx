import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { LibraryIndexView } from "@/components/library-index";
import { PAGES, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("tra-cuu");

export default function LibraryPage() {
  const page = PAGES["tra-cuu"];
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: page.title,
          description: page.description,
          url: `${SITE_URL}${page.path}`,
          inLanguage: "vi",
          publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        }}
      />
      <LunaApp initialTab="article" article={<LibraryIndexView />} />
    </>
  );
}
