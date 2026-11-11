import Link from "next/link";
import { ArrowRight, BookOpen, Moon, ScrollText, Sparkles } from "lucide-react";
import { LIBRARY_SECTIONS } from "@/lib/library";

const ICONS = { "tu-vi-2027": Sparkles, "giac-mo": Moon, "xin-xam": ScrollText } as const;

/**
 * Section "Tra cứu" trên trang chủ: mỗi loại bài một thẻ, vài link nổi bật và link tới
 * trang tổng. Mục đích chính là link nội bộ từ trang chủ tới các trang bài SEO.
 */
export function HomeLibrary() {
  return (
    <section id="tra-cuu" className="experiences-section page-container mt-[46px]!" aria-labelledby="home-library-title">
      <div className="experience-section-heading">
        <div>
          <h2 id="home-library-title">Tra cứu nhanh</h2>
          <p>Tử vi năm mới, giấc mơ đêm qua, quẻ xăm vừa rút: đọc ngay, không cần nhập gì</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {LIBRARY_SECTIONS.map((s) => {
          const Icon = ICONS[s.id as keyof typeof ICONS] ?? BookOpen;
          return (
            <article key={s.id} className="flex flex-col rounded-[24px] border border-[#ece2f4] bg-white/70 p-5 shadow-[0_8px_24px_#6b4b8214]">
              <h3 className="flex items-center gap-2 font-[family-name:var(--font-serif-app)]! text-[21px]! text-[#322050]">
                <Icon size={20} strokeWidth={1.4} className="text-[#a77e5d]" aria-hidden="true" />
                <Link href={s.href} className="hover:underline hover:underline-offset-4">{s.title}</Link>
              </h3>
              <p className="mt-2! text-[13px] leading-[1.6] text-[#8c75a1]">{s.description}</p>
              <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
                {s.featured.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-block rounded-full border border-[#e4d6f2] bg-[#f8f3fd] px-3 py-1 text-[13px] text-[#5b3f7a] transition-colors hover:border-[#c9a9e0] hover:bg-white"
                    >
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={s.href} className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-medium text-[#6e4a92] hover:underline hover:underline-offset-4">
                Xem tất cả <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
