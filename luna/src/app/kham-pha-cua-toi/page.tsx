import type { Metadata } from "next";
import LunaApp from "@/components/luna-app";

// Trang riêng của từng người (kết quả đã lưu) → không cho index, không đưa vào sitemap
export const metadata: Metadata = {
  title: "Khám phá của tôi",
  description: "Những kết quả bạn đã lưu trên Lunara.",
  alternates: { canonical: "/kham-pha-cua-toi" },
  robots: { index: false, follow: true },
};

export default function KhamPhaCuaToiPage() {
  return <LunaApp initialTab="history" />;
}
