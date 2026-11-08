import Link from "next/link";
import { ArrowRight, Moon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DREAM_ARTICLES, dreamArticle, type DreamArticle } from "@/content/dream-articles";

/**
 * Một trang tra cứu "Nằm mơ thấy …". Server component: toàn bộ chữ có sẵn trong
 * HTML cho Google đọc. Cuối trang luôn dẫn về công cụ /giac-mo để người đọc tự giải mã.
 *
 * Kiểu chữ dùng `!` vì h2/p trong .experience-page có style riêng nằm ngoài cascade layer.
 */
const H2 = "mt-8! font-[family-name:var(--font-serif-app)] text-[26px]! leading-tight! font-medium! text-[#4d2d68]!";
const P = "mt-3! text-[15px]! leading-[1.8]! text-[#5b5276]!";

export function DreamArticleView({ article }: { article: DreamArticle }) {
  const related = article.related.map(dreamArticle).filter(Boolean) as DreamArticle[];
  return (
    <>
      <div className="page-heading tarot-title-only">
        <nav aria-label="Đường dẫn" className="mb-3 text-[13px] text-[#8a7b99]">
          <Link href="/giac-mo" className="underline-offset-2 hover:underline">Giải mã giấc mơ</Link>
          <span aria-hidden="true"> › </span>
          <span>{article.name}</span>
        </nav>
        <h1>{article.title}</h1>
      </div>

      <article className="tarot-setup-panel">
        {article.intro.map((p) => (
          <p key={p} className={`${P} first:mt-0!`}>{p}</p>
        ))}

        <h2 className={H2}>Những giấc mơ thấy {article.name.toLowerCase()} thường gặp</h2>
        {article.situations.map((s) => (
          <section key={s.title} className="mt-5">
            <h3 className="font-[family-name:var(--font-serif-app)] text-[20px]! leading-snug! font-medium! text-[#3e357e]!">{s.title}</h3>
            <p className={`${P} mt-2!`}>{s.text}</p>
          </section>
        ))}

        <h2 className={H2}>Cảm xúc khi tỉnh dậy nói gì?</h2>
        <p className={P}>{article.feelings}</p>

        <h2 className={H2}>Vài câu hỏi để tự ngẫm</h2>
        <ul className="mt-3 flex list-none flex-col gap-2 p-0">
          {article.questions.map((q) => (
            <li key={q} className="flex gap-3 text-[15px] leading-[1.7] text-[#5b5276]">
              <Moon size={16} className="mt-1 shrink-0 text-[#ad8fd2]" aria-hidden="true" />
              {q}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-[24px] bg-[linear-gradient(100deg,#fcf5f9,#f3e9fb)] p-6 text-center">
          <p className="text-[17px]! font-medium! text-[#3a1f5c]!">Giấc mơ của bạn có chi tiết riêng?</p>
          <p className="mt-2! text-[14px]! leading-[1.7]! text-[#6a5c7a]!">
            Kể lại giấc mơ bằng lời của bạn, Lunara nhận ra các biểu tượng và giải mã riêng theo cảm xúc và đời sống của bạn.
          </p>
          <Link href="/giac-mo" className={cn(buttonVariants(), "mt-4 h-12 gap-2 rounded-full px-6 text-[15px]")}>
            Giải mã giấc mơ của bạn <ArrowRight size={18} />
          </Link>
        </div>

        <p className="mt-6! text-[12px]! leading-[1.8]! text-[#8a7b99]!">
          Giấc mơ không phải điềm báo và không cho biết điều gì sẽ xảy ra. Nội dung ở đây để chiêm nghiệm, không thay thế lời khuyên của chuyên gia tâm lý.
        </p>
      </article>

      {related.length ? (
        <nav aria-label="Giấc mơ liên quan" className="tarot-setup-panel mt-5!">
          <h2 className="font-[family-name:var(--font-serif-app)] text-[22px]! font-medium! text-[#4d2d68]!">Giấc mơ liên quan</h2>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/giac-mo/${r.slug}`}
                  className="block h-full rounded-2xl border border-[#e8ddef] bg-white/60 p-4 transition-colors hover:border-[#cdb4e3]"
                >
                  <span className="block font-[family-name:var(--font-serif-app)] text-[17px] text-[#3e357e]">{r.title.replace(" có ý nghĩa gì?", "")}</span>
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-[1.6] text-[#735f80]">{r.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </>
  );
}

/** Danh sách mọi trang tra cứu — đặt dưới công cụ /giac-mo để Google và người đọc đi tiếp. */
export function DreamArticleIndex() {
  return (
    <nav aria-label="Giấc mơ thường gặp" className="tarot-introduction mt-12!">
      <div className="tarot-introduction-body">
        <h2>Giấc mơ thường gặp</h2>
        <ul className="mt-4 grid list-none grid-cols-2 gap-x-6 gap-y-2 p-0 sm:grid-cols-3">
          {DREAM_ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link href={`/giac-mo/${a.slug}`} className="text-[14px] text-[#5b3f7a] underline-offset-2 hover:underline">
                Mơ thấy {a.name.toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
