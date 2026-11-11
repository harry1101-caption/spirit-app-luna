"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarHeart, Heart, LockKeyhole, RotateCcw, Send, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, FormIntro, IconField, ValidatedForm } from "@/components/form-field";
import { useRelatedTools } from "@/components/related-tools";
import { shareLink } from "@/components/hop-nhau-flow";
import { track } from "@/lib/analytics";
import { CON_GIAP_LOVE } from "@/lib/love-traits";
import {
  levelLabel,
  loveTiming,
  lunarYearOf,
  nextLoveMonth,
  parseTimingParams,
  STARS,
  STATUS_LABEL,
  type LoveStatus,
  type LoveTiming,
  type LoveYear,
  type StarKey,
} from "@/lib/love-timing";
import { cn } from "@/lib/utils";

/**
 * "Khi nào có người yêu?". Trạng thái nằm trong URL (`?y=<năm âm lịch>&s=<tình trạng>`):
 * chỉ năm sinh âm lịch, không mang ngày sinh, nên gửi link cho bạn bè cũng không lộ gì thêm.
 */

const PATH = "/khi-nao-co-nguoi-yeu";

function urlFor(lunarYear: number, status: LoveStatus) {
  return `${PATH}?${new URLSearchParams({ y: String(lunarYear), s: status })}`;
}

const noSubscribe = () => () => {};
/**
 * Năm đầu bảng đọc ở trình duyệt. Server trả `null` — gọi `new Date()` lúc prerender
 * bị cacheComponents chặn.
 */
function useCurrentYear() {
  return useSyncExternalStore(noSubscribe, () => new Date().getFullYear(), () => null);
}

export function LoveTimingFlow({ initialYear, initialStatus }: { initialYear?: string; initialStatus?: string }) {
  const [input, setInput] = useState(() => parseTimingParams(initialYear, initialStatus));
  const fromYear = useCurrentYear();
  const result = useMemo(() => (input && fromYear ? loveTiming(input.lunarYear, input.status, fromYear) : null), [input, fromYear]);
  useRelatedTools(result ? "khi-nao-co-nguoi-yeu" : null);

  useEffect(() => {
    if (initialYear) track("love_timing_result_view", { source: "link" });
  }, [initialYear]);

  function show(lunarYear: number, status: LoveStatus) {
    setInput({ lunarYear, status });
    window.history.replaceState(null, "", urlFor(lunarYear, status));
    window.scrollTo({ top: 0, behavior: "auto" });
    track("love_timing_result_view", { source: "form", status });
    track("experience_complete", { method: "khi-nao-co-nguoi-yeu" });
  }

  function restart() {
    setInput(null);
    window.history.replaceState(null, "", PATH);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (result) return <ResultView result={result} onRestart={restart} />;
  // Mở từ link kết quả: chờ trình duyệt có năm hiện tại, đừng loé form lên rồi biến mất
  if (input) return null;
  return <StartForm onSubmit={show} />;
}

// ───────────────────────── Form ─────────────────────────

function StartForm({ onSubmit }: { onSubmit: (lunarYear: number, status: LoveStatus) => void }) {
  const [status, setStatus] = useState<LoveStatus>("doc-than");
  return (
    <div className="flow-body is-configuring">
      <ValidatedForm
        className="tuvi-form tarot-setup-panel"
        onValidSubmit={(form) => {
          const year = lunarYearOf(String(new FormData(form).get("birthDate") || ""));
          if (year) onSubmit(year, status);
        }}
      >
        <FormIntro>
          Từ năm sinh, tìm ba sao tình duyên Đào Hoa, Hồng Loan, Thiên Hỷ của bạn rồi chỉ ra những năm và tháng duyên
          vượng trong bảy năm tới.
        </FormIntro>
        <label>Ngày sinh của bạn (dương lịch)
          <IconField icon={CalendarDays} type="date" name="birthDate" required min="1940-01-01" max="2025-12-31" />
        </label>
        <div className="mt-4" data-field="status">
          <span className="block text-[13px] font-medium text-[#3d2f4f]">Bạn đang</span>
          <div role="radiogroup" aria-label="Tình trạng" className="mt-2 grid grid-cols-2 gap-2">
            {(["doc-than", "dang-yeu"] as const).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={status === key}
                onClick={() => setStatus(key)}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-full border px-3 text-[14px]! font-medium transition-colors",
                  status === key ? "border-[#ac88cf] bg-[#eae0f7] text-[#221c2b]" : "border-[#e4d6f2] bg-[#f6f0fd] text-[#5b4a6b] hover:border-[#c9a9e0]",
                )}
              >
                {key === "doc-than" ? <Sparkles size={16} /> : <Heart size={16} />} {STATUS_LABEL[key]}
              </button>
            ))}
          </div>
          <FieldError name="status" />
        </div>
        <p className="tuvi-note">Đang có người thương thì kết quả nói về chuyện tiến xa: ra mắt, về chung, cưới hỏi.</p>
        <Button className="tuvi-submit" type="submit">
          Xem khi nào duyên tới <ArrowRight size={18} />
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
          Không lưu trên máy chủ. Link kết quả chỉ chứa năm sinh âm lịch.
        </p>
      </ValidatedForm>
      <HowItWorks />
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="tarot-introduction" aria-label="Cách xem khi nào có người yêu">
      <div className="tarot-introduction-body">
        <div className="tarot-introduction-context">
          <section>
            <h2>Xem bằng gì?</h2>
            <p>
              Ba sao tình duyên quen thuộc trong Tử Vi, an theo con giáp năm sinh. Đào Hoa là sức hút, Hồng Loan là duyên
              lành, Thiên Hỷ là tin vui. Năm nào, tháng nào mang đúng con giáp của một trong ba sao thì chuyện tình cảm dễ
              có chuyển động.
            </p>
          </section>
          <section>
            <h2>Năm không có sao thì sao?</h2>
            <p>
              Không phải năm xấu. Đó là năm để chăm chính mình và các mối quan hệ sẵn có, mà người hợp thường xuất hiện đúng
              lúc mình đang sống vui. Muốn xem kỹ theo cả ngày giờ sinh, thử <Link href="/tu-vi" className="underline underline-offset-2">lập lá số Tử Vi</Link>.
            </p>
          </section>
        </div>
        <section className="tarot-introduction-steps">
          <h2>Ba bước</h2>
          <ol>
            <li><strong>Nhập ngày sinh</strong><span>Tự đổi sang năm âm lịch, tính từ Lập Xuân.</span></li>
            <li><strong>Xem năm và tháng duyên vượng</strong><span>Bảy năm tới và những tháng nên để ý mỗi năm.</span></li>
            <li><strong>Gửi cho bạn bè</strong><span>Link chỉ chứa năm sinh, không lộ ngày sinh.</span></li>
          </ol>
        </section>
      </div>
    </section>
  );
}

// ───────────────────────── Kết quả ─────────────────────────

const LEVEL_STYLE: Record<LoveYear["level"], string> = {
  vuong: "border-[#e8a9c8] bg-[linear-gradient(100deg,#fdf0f6,#f3e9fb)]",
  thuan: "border-[#e4d6f2] bg-white/80",
  "vun-dap": "border-[#efe4f7] bg-white/60",
};
const BADGE_STYLE: Record<LoveYear["level"], string> = {
  vuong: "bg-[#e889b5] text-white",
  thuan: "bg-[#eae0f7] text-[#4b2a6e]",
  "vun-dap": "bg-[#f6f0fd] text-[#8a7b99]",
};

function headline(result: LoveTiming, fromYear: number) {
  const best = result.nextBest;
  if (!best) return { big: "Từng tháng một", sub: "Bảy năm tới chưa có năm sao chiếu, nhưng mỗi năm đều có tháng duyên vượng của riêng bạn." };
  const when = best.year === fromYear ? "Ngay năm nay" : `Năm ${best.year}`;
  const verb = result.status === "doc-than" ? "là năm dễ có người yêu nhất sắp tới" : "là năm đẹp nhất để hai bạn tiến xa";
  return { big: when, sub: `${best.canChi} ${verb}, nhờ sao ${best.stars.map((s) => STARS[s].name).join(" và ")}.` };
}

function ResultView({ result, onRestart }: { result: LoveTiming; onRestart: () => void }) {
  const [status, setStatus] = useState("");
  const fromYear = result.years[0].year;
  const head = headline(result, fromYear);
  // Chỉ render ở trình duyệt (kết quả cần năm hiện tại), nên đọc ngày hôm nay ở đây được
  const now = new Date();
  const soon = nextLoveMonth(result.months, now.getFullYear(), now.getMonth() + 1, now.getDate());

  async function share() {
    const url = `${window.location.origin}${urlFor(result.lunarYear, result.status)}`;
    const text = result.nextBest
      ? `Tuổi ${result.canChi}: ${head.big.toLowerCase()} là năm duyên vượng 💗 Xem năm của bạn:`
      : `Tuổi ${result.canChi}: xem những tháng duyên vượng của mình 💗`;
    const r = await shareLink(url, text);
    if (r === "copied") setStatus("Đã chép link kết quả");
    if (r === "shared") setStatus("Đã gửi!");
    track("love_timing_result_share", { method: r });
  }

  return (
    <div className="tarot-setup-panel">
      <div className="text-center">
        <p className="eyebrow">KHI NÀO CÓ NGƯỜI YÊU?</p>
        <p className="mt-2! text-[14px] text-[#6a5c7a]">Tuổi {result.canChi} · {STATUS_LABEL[result.status]}</p>
        <div className="mx-auto mt-5 flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fbe7f1,#eadcf8_60%,#dccbf2)] shadow-[0_16px_40px_#6b4b8233]">
          <CalendarHeart size={28} className="text-[#c2578c]" />
          <span className="mt-2 font-[family-name:var(--font-sans-app)] text-[36px] leading-none font-bold text-[#4b2a6e]">
            {result.nextBest ? result.nextBest.year : "12"}
          </span>
          <span className="mt-1 text-[12px] text-[#6e4a92]">{result.nextBest ? result.nextBest.canChi : "tháng đều có cơ hội"}</span>
        </div>
        <h2 className="mt-5! font-[family-name:var(--font-serif-app)]! text-[32px]! leading-tight text-[#281b44]">{head.big}</h2>
        <p className="mx-auto mt-1! max-w-[480px] text-[15px] leading-[1.7] text-[#6a5c7a]">{head.sub}</p>
        {soon ? (
          <p className="mx-auto mt-4! inline-flex max-w-[480px] flex-wrap items-center justify-center gap-x-2 rounded-full bg-[#fdf0f6] px-4 py-2 text-[14px] text-[#8a3d66]">
            <CalendarHeart size={16} />
            {soon.ongoing ? "Đang trong tháng duyên vượng" : "Tháng duyên vượng gần nhất"}:
            <strong>{soon.range} năm {soon.year}</strong>
            <span>({soon.stars.map((s) => STARS[s].name).join(", ")})</span>
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex justify-center">
        <Button onClick={() => void share()}>
          <Send size={16} /> Gửi cho bạn bè
        </Button>
      </div>
      {status ? <p className="mt-2! text-center text-[13px] text-[#2f5d38]">{status}</p> : null}

      <section className="mt-8">
        <SectionTitle step={1}>Ba sao tình duyên của bạn</SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {(Object.keys(STARS) as StarKey[]).map((k) => (
            <div key={k} className="rounded-2xl border border-[#ece2f4] bg-white/70 p-4 text-center">
              <span className="text-[28px] leading-none" aria-hidden="true">{STARS[k].emoji}</span>
              <p className="mt-2! text-[15px] font-semibold text-[#3a1f5c]">{STARS[k].name}</p>
              <p className="mt-1! text-[12px] font-medium text-[#8a6fa3]">ở cung {result.stars[k]}</p>
              <p className="mt-2! text-[13px] leading-[1.6] text-[#5b5276]">{STARS[k].short}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle step={2}>Bảy năm tới</SectionTitle>
        <p className="mt-2! text-[13px] leading-[1.7] text-[#5b5276]">
          Năm âm lịch, bắt đầu từ Lập Xuân (khoảng 4/2). Năm mang con giáp của một sao là năm duyên vượng.
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {result.years.map((y) => (
            <li key={y.year} className={cn("rounded-2xl border p-4", LEVEL_STYLE[y.level])}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[family-name:var(--font-sans-app)] text-[18px] font-bold text-[#3a1f5c]">{y.year}</span>
                <span className="text-[13px] text-[#8a7b99]">{y.canChi}</span>
                <span className={cn("ml-auto rounded-full px-3 py-1 text-[12px] font-semibold", BADGE_STYLE[y.level])}>{levelLabel(y.level)}</span>
              </div>
              {y.stars.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {y.stars.map((s) => (
                    <span key={s} className="rounded-full bg-white/80 px-2 py-0.5 text-[12px] text-[#6e4a92]">{STARS[s].emoji} {STARS[s].name}</span>
                  ))}
                </div>
              ) : null}
              <p className={cn("mt-2! text-[13px] leading-[1.7]", y.level === "vun-dap" ? "text-[#8a7b99]" : "text-[#4a4257]")}>{y.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <SectionTitle step={3}>Tháng duyên vượng mỗi năm</SectionTitle>
        <p className="mt-2! text-[13px] leading-[1.7] text-[#5b5276]">
          Lặp lại hằng năm, kể cả năm không có sao. Ngày là xấp xỉ theo tiết khí, có thể lệch một ngày.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {result.months.map((m) => (
            <div key={m.branch} className="rounded-2xl border border-[#ece2f4] bg-white/70 p-4">
              <p className="text-[15px] font-semibold text-[#3a1f5c]">{m.range}</p>
              <p className="mt-1! text-[12px] text-[#8a7b99]">Tháng {m.branch}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {m.stars.map((s) => (
                  <span key={s} className="rounded-full bg-[#f6f0fd] px-2 py-0.5 text-[12px] text-[#6e4a92]">{STARS[s].emoji} {STARS[s].short}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle step={4}>Ai dễ hợp duyên với bạn</SectionTitle>
        <div className="mt-3 rounded-2xl border border-[#e4d6f2] bg-[#f8f3fd] p-4">
          <p className="flex flex-wrap items-center gap-2 text-[14px] text-[#3a1f5c]">
            <UsersRound size={16} className="text-[#6e4a92]" /> Tuổi hợp:
            {result.matches.map((c) => (
              <span key={c} className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-[#4b2a6e]">{c}</span>
            ))}
          </p>
          <p className="mt-3! text-[13px] leading-[1.7] text-[#5b5276]">
            <strong className="text-[#3a1f5c]">Tuổi {result.conGiap} khi yêu:</strong> {CON_GIAP_LOVE[result.conGiap]}
          </p>
        </div>
      </section>

      <div className="mt-8 rounded-[24px] bg-[linear-gradient(100deg,#fcf5f9,#f3e9fb)] p-5 text-center">
        <p className="text-[15px] font-medium text-[#3a1f5c]">Đã có người trong lòng?</p>
        <p className="mt-1! text-[13px] text-[#6a5c7a]">Xem hai bạn hợp nhau bao nhiêu, hoặc bói thử qua tên.</p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Button nativeButton={false} render={<Link href="/hop-nhau" />}><Heart size={16} /> Xem độ hợp đôi</Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/boi-ten" />}>Bói tình duyên qua tên</Button>
        </div>
        <button type="button" onClick={onRestart} className="mt-4 inline-flex items-center gap-1 text-[13px]! text-[#6a5c7a] underline underline-offset-4">
          <RotateCcw size={14} /> Xem cho ngày sinh khác
        </button>
      </div>

      <p className="mt-6! text-center text-[12px] text-[#8a7b99]">Để tham khảo và vui, không phải lời phán. Duyên tới nhanh nhất khi mình chịu ra ngoài gặp người.</p>
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
