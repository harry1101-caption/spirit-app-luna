import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LunaApp from "@/components/luna-app";
import { getDatingProfile } from "@/lib/dating-server";
import { firstName } from "@/lib/hop-nhau";
import { LOOKING_LABEL } from "@/lib/dating-shared";
import { SITE_NAME } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

/** Hồ sơ đọc theo slug lúc request (cacheComponents) — giống /tarot đọc query string. */
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getDatingProfile(slug);
  if (!p) return { title: "Hồ sơ duyên", robots: { index: false } };
  const title = `Ai hợp với ${firstName(p.name)} nhất?`;
  const description = `${LOOKING_LABEL[p.looking_for]}. Nhập ngày sinh để xem bạn hợp với ${firstName(p.name)} bao nhiêu %.`;
  const image = `/duyen/${slug}/og`;
  return {
    title,
    description,
    alternates: { canonical: `/duyen/${slug}` },
    // Hồ sơ cá nhân: không đưa lên Google
    robots: { index: false, follow: true },
    openGraph: { type: "website", locale: "vi_VN", siteName: SITE_NAME, url: `/duyen/${slug}`, title: `${title} · ${SITE_NAME}`, description, images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function DatingProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getDatingProfile(slug);
  if (!profile) notFound();
  return (
    <>
      <link rel="preload" as="image" href="/images/tarot-sanctuary.webp" fetchPriority="high" />
      <LunaApp initialTab="duyen" dating={{ view: "profile", profile }} />
    </>
  );
}
