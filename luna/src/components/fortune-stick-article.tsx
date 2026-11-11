import Link from "next/link";
import { ArrowLeft, ArrowRight, Moon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ARTICLE_CTA_BOX, ARTICLE_H2 as H2, ARTICLE_H3 as H3, ARTICLE_NOTE, ARTICLE_P as P,
} from "@/components/article-styles";
import { FORTUNE_STICKS, type FortuneStick } from "@/content/fortune-sticks";

/**
 * Trang "Xăm số N Quan Âm". Server component: toàn bộ chữ có trong HTML cho
 * Google đọc. Cuối trang dẫn về /xin-xam để người đọc tự xin một quẻ cho câu hỏi của mình.
 */
export function FortuneStickView({ stick }: { stick: FortuneStick }) {
  const i = FORTUNE_STICKS.findIndex((s) => s.so === stick.so);
  const prev = FORTUNE_STICKS[i - 1];
  const next = FORTUNE_STICKS[i + 1];
  return (
    <>
      <div className="page-heading tarot-title-only">
        <nav aria-label="Đường dẫn" className="mb-3 text-[13px] text-[#8a7b99]">
          <Link href="/xin-xam" className="underline-offset-2 hover:underline">Xin xăm Quan Âm</Link>
          <span aria-hidden="true"> › </span>
          <span>Xăm số {stick.so}</span>
        </nav>
        <h1>Xăm số {stick.so} Quan Âm</h1>
      </div>

      <article className="tarot-setup-panel">
        <p className="text-[15px]! text-[#8a7b99]!">
          Quẻ <strong className="font-medium text-[#4d2d68]">{stick.grade}</strong>
          {stick.dienTich ? <> · Điển tích: {stick.dienTich}</> : null}
        </p>
        <p className={P}>{stick.summary}</p>

        <h2 className={H2}>Bài thơ quẻ số {stick.so}</h2>
        <ol className="mt-4 flex list-none flex-col gap-4 p-0">
          {stick.poem.map((line, k) => (
            <li key={k} className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
              <span lang="zh-Hant" className="block text-[18px] tracking-[0.12em] text-[#3e357e]">{line}</span>
              <span className="mt-1 block text-[15px] font-medium text-[#4d2d68]">{stick.hanViet[k]}</span>
              <span className="mt-1 block text-[14px] leading-[1.7] text-[#6a5c7a]">{stick.nghia[k]}</span>
            </li>
          ))}
        </ol>

        {stick.dienTich && stick.dienTichText ? (
          <>
            <h2 className={H2}>Điển tích {stick.dienTich}</h2>
            <p className={P}>{stick.dienTichText}</p>
          </>
        ) : null}

        <h2 className={H2}>Quẻ {stick.grade} nghĩa là gì?</h2>
        <p className={P}>
          {stick.gradeMeaning} Cấp quẻ chỉ nói việc đang thuận hay vướng ở thời điểm hỏi, không phán về con người hay số phận của bạn.
        </p>

        <h2 className={H2}>Lời giải theo từng việc</h2>
        {stick.areas.map((a) => (
          <section key={a.title} className="mt-5">
            <h3 className={H3}>{a.title}</h3>
            <p className={`${P} mt-2!`}>{a.text}</p>
          </section>
        ))}

        <h2 className={H2}>Một câu để tự hỏi</h2>
        <p className="mt-3! flex gap-3 text-[15px]! leading-[1.7]! text-[#5b5276]!">
          <Moon size={16} className="mt-1 shrink-0 text-[#ad8fd2]" aria-hidden="true" />
          {stick.question}
        </p>

        <div className={ARTICLE_CTA_BOX}>
          <p className="text-[17px]! font-medium! text-[#3a1f5c]!">Bạn đang có một câu hỏi riêng?</p>
          <p className="mt-2! text-[14px]! leading-[1.7]! text-[#6a5c7a]!">
            Thành tâm đặt câu hỏi, lắc ống xăm và gieo keo. Lunara giải quẻ bạn nhận được theo đúng chuyện bạn đang bận lòng.
          </p>
          <Link href="/xin-xam" className={cn(buttonVariants(), "mt-4 h-12 gap-2 rounded-full px-6 text-[15px]")}>
            Xin xăm cho câu hỏi của bạn <ArrowRight size={18} />
          </Link>
        </div>

        <p className={ARTICLE_NOTE}>
          Xăm là nội dung để chiêm nghiệm, không phải lời tiên đoán. Đừng dựa vào đây để quyết định việc sức khoẻ, tài chính hay pháp lý.
        </p>
      </article>

      <nav aria-label="Quẻ trước và sau" className="mt-5 flex justify-between gap-3">
        {prev ? (
          <Link href={`/xin-xam/${prev.slug}`} className="flex items-center gap-2 text-[14px] text-[#5b3f7a] underline-offset-2 hover:underline">
            <ArrowLeft size={16} /> Xăm số {prev.so}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/xin-xam/${next.slug}`} className="flex items-center gap-2 text-[14px] text-[#5b3f7a] underline-offset-2 hover:underline">
            Xăm số {next.so} <ArrowRight size={16} />
          </Link>
        ) : null}
      </nav>
    </>
  );
}

/** Lưới 100 quẻ đặt dưới công cụ /xin-xam để Google và người đọc tra từng quẻ. */
export function FortuneStickIndex() {
  return (
    <nav aria-label="Giải 100 quẻ xăm Quan Âm" className="tarot-introduction mt-12!">
      <div className="tarot-introduction-body">
        <h2>Giải 100 quẻ xăm Quan Âm</h2>
        <ul className="mt-4 grid list-none grid-cols-5 gap-2 p-0 sm:grid-cols-10">
          {FORTUNE_STICKS.map((s) => (
            <li key={s.so}>
              <Link
                href={`/xin-xam/${s.slug}`}
                title={`Xăm số ${s.so}: ${s.grade}`}
                className="flex h-10 items-center justify-center rounded-xl border border-[#e8ddef] bg-white/60 text-[14px] text-[#5b3f7a] transition-colors hover:border-[#cdb4e3]"
              >
                {s.so}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
