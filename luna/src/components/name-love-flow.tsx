"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart, LockKeyhole, RotateCcw, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormIntro, IconField, ValidatedForm } from "@/components/form-field";
import { useRelatedTools } from "@/components/related-tools";
import { shareLink } from "@/components/hop-nhau-flow";
import { track } from "@/lib/analytics";
import { cleanName, nameLove, OUTCOMES, PYRAMID_WORD, SHARED_NUMBER, SOUL_LOVE, type NameLoveResult } from "@/lib/name-love";
import { cn } from "@/lib/utils";

/**
 * "Bói tình duyên qua tên". Trạng thái nằm trong URL (`?a=…&b=…`, chỉ là hai cái tên),
 * không lưu server: link nào cũng mở lại được kết quả, gửi cho người ấy là thấy ngay.
 */

const PATH = "/boi-ten";

function urlFor(a: string, b: string) {
  return `${PATH}?${new URLSearchParams({ a, b })}`;
}

export function NameLoveFlow({ initialA, initialB }: { initialA?: string; initialB?: string }) {
  const [pair, setPair] = useState<{ a: string; b: string } | null>(() => {
    const a = cleanName(initialA);
    const b = cleanName(initialB);
    return a && b ? { a, b } : null;
  });
  const result = useMemo(() => (pair ? nameLove(pair.a, pair.b) : null), [pair]);
  useRelatedTools(result ? "boi-ten" : null);

  useEffect(() => {
    if (initialA && initialB) track("name_love_result_view", { source: "link" });
  }, [initialA, initialB]);

  function show(a: string, b: string) {
    setPair({ a, b });
    window.history.replaceState(null, "", urlFor(a, b));
    window.scrollTo({ top: 0, behavior: "auto" });
    track("name_love_result_view", { source: "form" });
    track("experience_complete", { method: "boi-ten" });
  }

  function restart() {
    setPair(null);
    window.history.replaceState(null, "", PATH);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (result) return <ResultView result={result} onRestart={restart} />;
  return <StartForm onSubmit={show} />;
}

// ───────────────────────── Form ─────────────────────────

function StartForm({ onSubmit }: { onSubmit: (a: string, b: string) => void }) {
  return (
    <div className="flow-body is-configuring">
      <ValidatedForm
        className="tuvi-form tarot-setup-panel"
        onValidSubmit={(form) => {
          const data = new FormData(form);
          const a = cleanName(data.get("aName"));
          const b = cleanName(data.get("bName"));
          if (a && b) onSubmit(a, b);
        }}
      >
        <FormIntro>
          Trò bói tên quen thuộc thời đi học: gạch chữ trùng, xếp tháp &ldquo;YÊU THƯƠNG&rdquo; và tính Số Linh hồn. Chỉ cần
          tên hai người, không cần ngày sinh.
        </FormIntro>
        <label>Tên của bạn
          <IconField icon={UserRound} name="aName" required minLength={2} maxLength={60} placeholder="Nguyễn Minh Anh" />
        </label>
        <label className="mt-4 block">Tên người ấy
          <IconField icon={Heart} name="bName" required minLength={2} maxLength={60} placeholder="Trần Gia Huy" />
        </label>
        <p className="tuvi-note">Ghi đủ họ tên cho kết quả chuẩn nhất. Tên thân mật hay biệt danh cũng chơi được.</p>
        <Button className="tuvi-submit" type="submit">
          Xem duyên qua tên <ArrowRight size={18} />
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
          Không lưu trên máy chủ. Tính ngay trên máy của bạn.
        </p>
      </ValidatedForm>
      <HowItWorks />
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="tarot-introduction" aria-label="Cách bói tình duyên qua tên">
      <div className="tarot-introduction-body">
        <div className="tarot-introduction-context">
          <section>
            <h2>Bói tên tính bằng gì?</h2>
            <p>
              Ba trò quen thuộc gộp lại. Gạch những chữ cái hai tên có chung, đếm số chữ còn lại để tìm ra hai bạn là
              Tri kỷ, Người yêu hay Về chung một nhà. Xếp tháp số từ chữ &ldquo;YÊU THƯƠNG&rdquo; để ra phần trăm. Và Số
              Linh hồn trong Thần số học cho biết trái tim mỗi người muốn gì.
            </p>
          </section>
          <section>
            <h2>Có chính xác không?</h2>
            <p>
              Đây là trò chơi để vui và để có cớ nói chuyện với người ấy. Muốn xem kỹ hơn theo ngày sinh, thử{" "}
              <Link href="/hop-nhau" className="underline underline-offset-2">Xem độ hợp đôi</Link>.
            </p>
          </section>
        </div>
        <section className="tarot-introduction-steps">
          <h2>Ba bước</h2>
          <ol>
            <li><strong>Nhập tên hai người</strong><span>Có dấu hay không dấu đều được.</span></li>
            <li><strong>Xem kết quả</strong><span>Gạch chữ, tháp số và Số Linh hồn hiện ra từng bước.</span></li>
            <li><strong>Gửi cho người ấy</strong><span>Link mở ra đúng kết quả của hai bạn.</span></li>
          </ol>
        </section>
      </div>
    </section>
  );
}

// ───────────────────────── Kết quả ─────────────────────────

function ResultView({ result, onRestart }: { result: NameLoveResult; onRestart: () => void }) {
  const [status, setStatus] = useState("");
  const { a, b, cross, pyramid } = result;

  async function share() {
    const url = `${window.location.origin}${urlFor(a.name, b.name)}`;
    const text = `Bói tên: ${a.firstName} & ${b.firstName} là "${cross.outcome.title}", hợp ${pyramid.percent}% ${cross.outcome.emoji} Xem chi tiết:`;
    const r = await shareLink(url, text);
    if (r === "copied") setStatus("Đã chép link kết quả");
    if (r === "shared") setStatus("Đã gửi!");
    track("name_love_result_share", { method: r });
  }

  return (
    <div className="tarot-setup-panel">
      <div className="text-center">
        <p className="eyebrow">BÓI TÌNH DUYÊN QUA TÊN</p>
        <p className="mt-2! font-[family-name:var(--font-serif-app)] text-[24px] text-[#281b44]">
          {a.firstName} <Heart size={18} className="mx-1 inline align-[-1px] text-[#e889b5]" fill="#e889b5" /> {b.firstName}
        </p>
        <div className="mx-auto mt-5 flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fbe7f1,#eadcf8_60%,#dccbf2)] shadow-[0_16px_40px_#6b4b8233]">
          <span className="text-[48px] leading-none" aria-hidden="true">{cross.outcome.emoji}</span>
          <span className="mt-2 font-[family-name:var(--font-sans-app)] text-[32px] leading-none font-bold text-[#4b2a6e]">{pyramid.percent}%</span>
        </div>
        <h2 className="mt-5! font-[family-name:var(--font-serif-app)]! text-[32px]! leading-tight text-[#281b44]">{cross.outcome.title}</h2>
        <p className="mt-1! text-[15px] text-[#6a5c7a]">{cross.outcome.tagline}</p>
        <p className="mx-auto mt-4! max-w-[520px] text-[15px] leading-[1.7] text-[#4a4257]">{cross.outcome.text}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={() => void share()}>
          <Send size={16} /> Gửi kết quả cho người ấy
        </Button>
      </div>
      {status ? <p className="mt-2! text-center text-[13px] text-[#2f5d38]">{status}</p> : null}

      <CrossOutBoard result={result} />
      <PyramidBoard result={result} />
      <SoulBoard result={result} />

      <div className="mt-8 rounded-[24px] bg-[linear-gradient(100deg,#fcf5f9,#f3e9fb)] p-5 text-center">
        <p className="text-[15px] font-medium text-[#3a1f5c]">Thử với tên khác?</p>
        <p className="mt-1! text-[13px] text-[#6a5c7a]">Crush, người yêu, hay thử luôn biệt danh của hai bạn.</p>
        <Button
          className="mt-4"
          onClick={() => {
            track("name_love_try_another");
            onRestart();
          }}
        >
          <RotateCcw size={16} /> Bói với tên khác
        </Button>
      </div>

      <p className="mt-6! text-center text-[12px] text-[#8a7b99]">
        Trò chơi để vui, không phải lời phán. Muốn xem theo ngày sinh?{" "}
        <Link href="/hop-nhau" className="underline underline-offset-2">Xem độ hợp đôi</Link>.
      </p>
    </div>
  );
}

function SectionTitle({ step, children }: { step: number; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-[family-name:var(--font-serif-app)]! text-[21px]! text-[#281b44]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3eafb] font-[family-name:var(--font-sans-app)] text-[14px] font-semibold text-[#6e4a92]">{step}</span>
      {children}
    </h3>
  );
}

/** Hai hàng chữ cái, chữ trùng bị gạch; dưới là vòng sáu ô bị loại dần. */
function CrossOutBoard({ result }: { result: NameLoveResult }) {
  const { a, b, cross } = result;
  const order = new Map(cross.eliminated.map((k, i) => [k, i]));
  return (
    <section className="mt-8">
      <SectionTitle step={1}>Gạch chữ trùng</SectionTitle>
      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[#ece2f4] bg-white/70 p-4">
        {[
          [a.firstName, cross.a],
          [b.firstName, cross.b],
        ].map(([label, marks]) => (
          <div key={label as string}>
            <span className="text-[12px] font-medium text-[#8a7b99]">{label as string}</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {(marks as typeof cross.a).map((m, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg font-[family-name:var(--font-sans-app)] text-[15px] font-semibold",
                    m.crossed ? "bg-[#f6f0fd] text-[#c4b5d4] line-through decoration-[#e889b5] decoration-2" : "bg-[#eae0f7] text-[#3a1f5c]",
                  )}
                >
                  {m.char}
                </span>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[13px] leading-[1.7] text-[#5b5276]">
          Còn lại <strong className="text-[#3a1f5c]">{cross.remaining} chữ</strong>. Đếm vòng qua sáu ô, tới ô thứ {cross.remaining} thì
          loại ô đó, đếm tiếp tới khi còn một:
        </p>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {OUTCOMES.map((o) => {
            const step = order.get(o.key)!;
            const won = o.key === cross.outcome.key;
            return (
              <li
                key={o.key}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px]",
                  won ? "border-[#ac88cf] bg-[#eae0f7] font-semibold text-[#3a1f5c]" : "border-[#efe4f7] bg-white text-[#a497b3]",
                )}
              >
                <span aria-hidden="true">{o.emoji}</span>
                <span className={cn("min-w-0 flex-1 truncate", !won && "line-through")}>{o.title}</span>
                {won ? <Check size={16} className="text-[#6e4a92]" /> : <span className="text-[11px]">#{step + 1}</span>}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Tháp số: hàng đầu là số lần mỗi chữ của "YEUTHUONG" xuất hiện, cộng từng cặp tới khi còn hai số. */
function PyramidBoard({ result }: { result: NameLoveResult }) {
  const { pyramid } = result;
  const last = pyramid.rows[pyramid.rows.length - 1];
  return (
    <section className="mt-8">
      <SectionTitle step={2}>Tháp &ldquo;YÊU THƯƠNG&rdquo;</SectionTitle>
      <div className="mt-3 rounded-2xl border border-[#ece2f4] bg-white/70 p-4">
        <p className="text-[13px] leading-[1.7] text-[#5b5276]">
          Đếm mỗi chữ của {PYRAMID_WORD.split("").join(" ")} trong tên hai bạn, rồi cộng từng cặp số đứng cạnh nhau (lấy hàng đơn
          vị) tới khi còn hai số.
        </p>
        <div className="mt-3 flex justify-center gap-1">
          {pyramid.counts.map((c, i) => (
            <span key={i} className="w-8 text-center font-[family-name:var(--font-sans-app)] text-[12px] font-semibold text-[#8a6fa3]">{c.char}</span>
          ))}
        </div>
        <div className="mt-1 flex flex-col items-center gap-1">
          {pyramid.rows.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((d, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full font-[family-name:var(--font-sans-app)] text-[14px] font-semibold",
                    r === pyramid.rows.length - 1 ? "bg-[linear-gradient(135deg,#e889b5,#6e4a92)] text-white" : "bg-[#f6f0fd] text-[#4b2a6e]",
                  )}
                >
                  {d}
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className="mt-4! text-center text-[13px] leading-[1.7] text-[#5b5276]">
          Hàng cuối ra <strong className="text-[#3a1f5c]">{last.join("")}</strong> → độ hợp theo tên{" "}
          <strong className="text-[#3a1f5c]">{pyramid.percent}%</strong>
        </p>
        <p className="mt-1! text-center text-[15px] font-medium text-[#3a1f5c]">{result.tier}</p>
      </div>
    </section>
  );
}

/** Số Linh hồn của mỗi người và con số chung. */
function SoulBoard({ result }: { result: NameLoveResult }) {
  const { a, b, shared } = result;
  return (
    <section className="mt-8">
      <SectionTitle step={3}>Trái tim mỗi người muốn gì</SectionTitle>
      <p className="mt-2! text-[13px] leading-[1.7] text-[#5b5276]">
        Số Linh hồn trong Thần số học, cộng từ các nguyên âm trong họ tên: điều mỗi người cần để thấy được yêu.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[a, b].map((p) => {
          const m = SOUL_LOVE[p.soul];
          return (
            <div key={p.name} className="rounded-2xl border border-[#ece2f4] bg-white/70 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f3eafb] font-[family-name:var(--font-sans-app)] text-[22px] font-bold text-[#6e4a92]">{p.soul}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] text-[#8a7b99]">{p.firstName}</span>
                  <span className="block text-[15px] font-semibold text-[#3a1f5c]">{m.title}</span>
                </span>
              </div>
              <p className="mt-3! text-[13px] leading-[1.7] text-[#5b5276]">{m.text}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-2xl border border-[#e4d6f2] bg-[#f8f3fd] p-4">
        <h4 className="flex items-center gap-2 text-[15px]! font-semibold text-[#3a1f5c]">
          <Sparkles size={16} className="text-[#6e4a92]" /> Con số chung của hai bạn: {shared}
        </h4>
        <p className="mt-2! text-[13px] leading-[1.7] text-[#5b5276]">{SHARED_NUMBER[shared]}</p>
      </div>
    </section>
  );
}
