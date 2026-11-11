import LunaApp from "@/components/luna-app";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata, toolJsonLd } from "@/lib/seo";

export const metadata = pageMetadata("duyen");

export default function DatingPage() {
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <JsonLd data={toolJsonLd("duyen")} />
      <LunaApp initialTab="duyen" dating={{ view: "home" }} />
    </>
  );
}
