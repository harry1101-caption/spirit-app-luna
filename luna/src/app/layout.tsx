import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
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
  title: "Lunara — Hành trình nội tâm",
  description:
    "Khám phá bản thân qua Tarot, chiêm tinh hằng ngày và những trải nghiệm tính cách. Không gian riêng dành cho bạn.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
