import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { OG_IMAGE, SITE_NAME, SITE_URL, siteJsonLd } from "@/lib/seo";
const sans = Be_Vietnam_Pro({
  variable: "--font-sans-app",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});
const serif = Cormorant_Garamond({
  variable: "--font-serif-app",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Từng trang tự đặt title riêng (src/lib/seo.ts); template thêm hậu tố thương hiệu
  title: { default: "Lunara — Hành trình nội tâm", template: `%s · ${SITE_NAME}` },
  description:
    "Xem Tarot cùng AI, lập lá số Tử Vi, tra Thần số học và hơn 15 trải nghiệm tâm linh khác. Diễn giải dễ hiểu, không phán xét.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Lunara — Hành trình nội tâm" }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <JsonLd data={siteJsonLd} />
        {children}
      </body>
    </html>
  );
}
