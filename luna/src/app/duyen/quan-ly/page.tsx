import type { Metadata } from "next";
import LunaApp from "@/components/luna-app";

// Trang riêng của chủ hồ sơ → không index
export const metadata: Metadata = {
  title: "Ai hợp với bạn",
  description: "Danh sách những người đã ghép với hồ sơ duyên của bạn.",
  alternates: { canonical: "/duyen/quan-ly" },
  robots: { index: false, follow: false },
};

export default function DatingManagePage() {
  return <LunaApp initialTab="duyen" dating={{ view: "manage" }} />;
}
