import Link from "next/link";
import { ARTICLE_CARD_LINK, ARTICLE_H2 as H2, ARTICLE_NOTE, ARTICLE_P as P } from "@/components/article-styles";
import { DREAM_ARTICLES } from "@/content/dream-articles";
import { FORTUNE_STICKS } from "@/content/fortune-sticks";
import { RELATION_INFO, SIGNS, YEAR, YEAR_CAN_CHI } from "@/content/yearly-horoscope-2027";

/**
 * Trang tổng /tra-cuu: mọi bài tra cứu SEO trên một trang, chia theo loại.
 * Server component — toàn bộ link có trong HTML để Google đi theo.
 * Thêm loại bài mới (vd. ý nghĩa lá Tarot): thêm một <section id> ở đây và một mục
 * trong lib/library.ts cho trang chủ.
 */
export function LibraryIndexView() {
  return (
    <>
      <div className="page-heading tarot-title-only">
        <h1>Tra cứu</h1>
      </div>
      <article className="tarot-setup-panel">
        <p className={`${P} mt-0!`}>
          Những câu người ta hay tìm nhất, viết sẵn bằng lời thường: tử vi năm {YEAR} cho từng tuổi, ý nghĩa các giấc mơ quen
          thuộc và lời giải đủ 100 quẻ xăm Quan Âm.
        </p>
        <nav aria-label="Mục lục" className="mt-4 flex flex-wrap gap-2">
          {[
            ["#tu-vi-2027", `Tử vi ${YEAR}`],
            ["#giac-mo", "Giải mã giấc mơ"],
            ["#xin-xam", "Xăm Quan Âm"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="rounded-full border border-[#e4d6f2] bg-[#f8f3fd] px-3 py-1 text-[13px] text-[#5b3f7a] hover:border-[#c9a9e0]">
              {label}
            </a>
          ))}
        </nav>

        <section id="tu-vi-2027" className="scroll-mt-28">
          <h2 className={H2}>
            <Link href="/tu-vi-2027" className="hover:underline hover:underline-offset-4">Tử vi {YEAR} năm {YEAR_CAN_CHI} theo tuổi</Link>
          </h2>
          <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
            {SIGNS.map((s) => (
              <li key={s.slug}>
                <Link href={`/tu-vi-2027/${s.slug}`} className={ARTICLE_CARD_LINK}>
                  <span className="block font-[family-name:var(--font-serif-app)] text-[17px] text-[#3e357e]">Tuổi {s.branch}</span>
                  <span className="mt-1 block text-[13px] leading-[1.6] text-[#735f80]">{RELATION_INFO[s.relation].label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="giac-mo" className="scroll-mt-28">
          <h2 className={H2}>Nằm mơ thấy gì?</h2>
          <p className={P}>
            Không có giấc mơ của bạn trong danh sách? <Link href="/giac-mo" className="underline underline-offset-2">Kể lại giấc mơ</Link> để
            Lunara đọc riêng cho bạn.
          </p>
          <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3">
            {DREAM_ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link href={`/giac-mo/${a.slug}`} className={ARTICLE_CARD_LINK}>
                  <span className="block text-[15px] font-medium text-[#3e357e]">{a.title.replace(/ có ý nghĩa gì\??$/, "")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="xin-xam" className="scroll-mt-28">
          <h2 className={H2}>Giải 100 quẻ xăm Quan Âm</h2>
          <p className={P}>
            Muốn tự rút một quẻ? <Link href="/xin-xam" className="underline underline-offset-2">Xin xăm online</Link>.
          </p>
          <ul className="mt-4 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-5">
            {FORTUNE_STICKS.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/xin-xam/${s.slug}`}
                  className="block rounded-xl border border-[#e8ddef] bg-white/60 px-3 py-2 transition-colors hover:border-[#cdb4e3]"
                >
                  <span className="block text-[14px] font-medium whitespace-nowrap text-[#3e357e]">Xăm số {s.so}</span>
                  <span className="block text-[12px] whitespace-nowrap text-[#8a7b99]">{s.grade}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className={ARTICLE_NOTE}>Nội dung để chiêm nghiệm, không dự đoán chuyện gì chắc chắn sẽ xảy ra.</p>
      </article>
    </>
  );
}
