import Link from "next/link";
import { ArrowRight, Moon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ARTICLE_CARD_LINK, ARTICLE_CTA_BOX, ARTICLE_H2 as H2, ARTICLE_H3 as H3, ARTICLE_NOTE, ARTICLE_P as P,
} from "@/components/article-styles";
import {
  RELATION_INFO, SIGNS, YEAR, YEAR_CAN_CHI, YEAR_END, YEAR_NAP_AM, YEAR_START, birthYears, type YearlySign,
} from "@/content/yearly-horoscope-2027";

/**
 * Trang "Tử vi 2027 tuổi …" và trang tổng /tu-vi-2027. Server component: toàn bộ
 * chữ có trong HTML cho Google đọc. Cuối trang luôn dẫn về /tu-vi để lập lá số riêng.
 */

function TuViCta() {
  return (
    <div className={ARTICLE_CTA_BOX}>
      <p className="text-[17px]! font-medium! text-[#3a1f5c]!">Cùng tuổi nhưng mỗi người một lá số</p>
      <p className="mt-2! text-[14px]! leading-[1.7]! text-[#6a5c7a]!">
        Tử vi theo con giáp là lời chung cho cả một tuổi. Nhập ngày giờ sinh để Lunara lập lá số 12 cung và xem riêng năm {YEAR} của bạn.
      </p>
      <Link href="/tu-vi" className={cn(buttonVariants(), "mt-4 h-12 gap-2 rounded-full px-6 text-[15px]")}>
        Lập lá số Tử Vi của bạn <ArrowRight size={18} />
      </Link>
    </div>
  );
}

function SignGrid({ exclude }: { exclude?: string }) {
  return (
    <ul className="mt-4 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
      {SIGNS.filter((s) => s.slug !== exclude).map((s) => (
        <li key={s.slug}>
          <Link href={`/tu-vi-2027/${s.slug}`} className={ARTICLE_CARD_LINK}>
            <span className="block font-[family-name:var(--font-serif-app)] text-[17px] text-[#3e357e]">Tuổi {s.branch}</span>
            <span className="mt-1 block text-[13px] leading-[1.6] text-[#735f80]">{RELATION_INFO[s.relation].label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function YearlySignView({ sign }: { sign: YearlySign }) {
  const relation = RELATION_INFO[sign.relation];
  const years = birthYears(sign.branch);
  return (
    <>
      <div className="page-heading tarot-title-only">
        <nav aria-label="Đường dẫn" className="mb-3 text-[13px] text-[#8a7b99]">
          <Link href="/tu-vi-2027" className="underline-offset-2 hover:underline">Tử vi {YEAR}</Link>
          <span aria-hidden="true"> › </span>
          <span>Tuổi {sign.branch}</span>
        </nav>
        <h1>Tử vi {YEAR} tuổi {sign.branch}</h1>
      </div>

      <article className="tarot-setup-panel">
        <p className="text-[17px]! leading-[1.7]! font-medium! text-[#3a1f5c]!">{sign.takeaway}</p>
        <p className={P}>{sign.intro}</p>

        <h2 className={H2}>Tuổi {sign.branch} và năm {YEAR_CAN_CHI}: {relation.label.toLowerCase()}</h2>
        <p className={P}>{relation.text}</p>

        {sign.areas.map((a) => (
          <section key={a.title} className="mt-6">
            <h3 className={H3}>{a.title}</h3>
            <p className={`${P} mt-2!`}>{a.text}</p>
          </section>
        ))}

        <h2 className={H2}>Ba việc nhỏ nên làm trong năm</h2>
        <ul className="mt-3 flex list-none flex-col gap-2 p-0">
          {sign.tips.map((t) => (
            <li key={t} className="flex gap-3 text-[15px] leading-[1.7] text-[#5b5276]">
              <Moon size={16} className="mt-1 shrink-0 text-[#ad8fd2]" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>

        <h2 className={H2}>Một câu để tự hỏi</h2>
        <p className={P}>{sign.question}</p>

        <h2 className={H2}>Người tuổi {sign.branch} sinh năm nào?</h2>
        <p className={P}>
          Tuổi tính theo năm âm lịch. Ai sinh vào tháng 1 hoặc đầu tháng 2 dương lịch nên kiểm tra lại ngày Tết năm đó, vì có thể vẫn thuộc tuổi của năm trước.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[14px] text-[#5b5276]">
            <thead>
              <tr className="border-b border-[#e8ddef] text-[#4d2d68]">
                <th className="py-2 pr-4 font-medium">Năm sinh</th>
                <th className="py-2 pr-4 font-medium">Can chi</th>
                <th className="py-2 font-medium">Mệnh</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y.year} className="border-b border-[#f1eaf6]">
                  <td className="py-2 pr-4">{y.year}</td>
                  <td className="py-2 pr-4">{y.canChi}</td>
                  <td className="py-2">{y.napAm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TuViCta />

        <p className={ARTICLE_NOTE}>
          Tử vi theo tuổi để chiêm nghiệm, không dự đoán chuyện gì chắc chắn sẽ xảy ra. Đừng dựa vào đây để quyết định việc sức khoẻ, tài chính hay pháp lý.
        </p>
      </article>

      <nav aria-label="Tử vi các tuổi khác" className="tarot-setup-panel mt-5!">
        <h2 className="font-[family-name:var(--font-serif-app)] text-[22px]! font-medium! text-[#4d2d68]!">Tử vi {YEAR} các tuổi khác</h2>
        <SignGrid exclude={sign.slug} />
      </nav>
    </>
  );
}

export function YearlyIndexView() {
  return (
    <>
      <div className="page-heading tarot-title-only">
        <h1>Tử vi {YEAR} năm {YEAR_CAN_CHI} cho 12 con giáp</h1>
      </div>
      <article className="tarot-setup-panel">
        <p className={`${P} mt-0!`}>
          Năm {YEAR} là năm {YEAR_CAN_CHI}, bắt đầu từ Tết ngày {YEAR_START} và kết thúc ngày {YEAR_END} dương lịch. Mệnh năm là {YEAR_NAP_AM}, tức &ldquo;nước sông trên trời&rdquo;: hình ảnh mưa lành, mềm và thấm từ từ.
        </p>
        <p className={P}>
          Mùi là con dê, hiền và bền. Năm Mùi thường hợp với những việc vun đắp chậm mà chắc: chăm sóc gia đình, học thêm, sửa lại nhà cửa, củng cố công việc đang có. Đây không phải năm của những cú đánh cược lớn.
        </p>
        <h2 className={H2}>Chọn tuổi của bạn</h2>
        <SignGrid />
        <h2 className={H2}>Con giáp nào hợp, con giáp nào xung với năm Mùi?</h2>
        <p className={P}>
          Hợi và Mão cùng nhóm tam hợp với Mùi, Ngọ là cặp lục hợp, nên năm nay khá thuận cho ba tuổi này. Sửu xung với Mùi, Tuất hình, Tý hại; với các tuổi này, năm Mùi nhiều chuyển động và cần mềm mỏng hơn, nhưng không phải năm xui. Tuổi Mùi gặp năm tuổi.
        </p>
        <TuViCta />
        <p className={ARTICLE_NOTE}>
          Tử vi theo tuổi để chiêm nghiệm, không dự đoán chuyện gì chắc chắn sẽ xảy ra.
        </p>
      </article>
    </>
  );
}

/** Danh sách 12 tuổi đặt dưới công cụ /tu-vi để Google và người đọc đi tiếp. */
export function YearlyHoroscopeLinks() {
  return (
    <nav aria-label={`Tử vi ${YEAR} theo tuổi`} className="tarot-introduction mt-12!">
      <div className="tarot-introduction-body">
        <h2>
          <Link href="/tu-vi-2027" className="underline-offset-4 hover:underline">Tử vi {YEAR} năm {YEAR_CAN_CHI} theo tuổi</Link>
        </h2>
        <ul className="mt-4 grid list-none grid-cols-3 gap-x-6 gap-y-2 p-0 sm:grid-cols-4">
          {SIGNS.map((s) => (
            <li key={s.slug}>
              <Link href={`/tu-vi-2027/${s.slug}`} className="text-[14px] text-[#5b3f7a] underline-offset-2 hover:underline">
                Tuổi {s.branch}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
