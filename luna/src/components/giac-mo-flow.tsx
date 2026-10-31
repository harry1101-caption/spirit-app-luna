"use client";

import { useState } from "react";
import { ArrowRight, Check, LoaderCircle, LockKeyhole, Moon, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelatedTools } from "@/components/related-tools";
import { Textarea } from "@/components/ui/textarea";
import { IconField, IconSelect } from "@/components/form-field";
import { CalendarClock, Smile } from "lucide-react";
import { dreamMoods, dreamRecurrences, type GiacMoChart } from "@/lib/giac-mo";

type Interpretation = {
  summary: string;
  sections: { title: string; takeaway?: string; text: string; evidence: string[] }[];
  source: "ai" | "guide";
};

export function GiacMoFlow() {
  const [chart, setChart] = useState<GiacMoChart | null>(null);
  const [reading, setReading] = useState<Interpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);
  const [error, setError] = useState("");
  const [dream, setDream] = useState("");
  const [lastInput, setLastInput] = useState<Record<string, unknown> | null>(null);

  async function loadReading(payload: Record<string, unknown>) {
    setReadingLoading(true);
    try {
      const response = await fetch("/api/giac-mo/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setReading(response.ok ? data.interpretation : null);
    } catch {
      setReading(null);
    } finally {
      setReadingLoading(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    const body = {
      dream: dream.trim(),
      mood: String(data.get("mood") || ""),
      recurrence: String(data.get("recurrence") || ""),
      context: String(data.get("context") || "").trim(),
    };
    try {
      const response = await fetch("/api/giac-mo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Chưa đọc được giấc mơ này.");
      setChart(payload.chart);
      setLastInput(body);
      setReading(null);
      window.scrollTo({ top: 0, behavior: "auto" });
      void loadReading(body);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Gợi ý feature liên quan render ngoài thẻ, do RelatedToolsSlot ở luna-app.
  useRelatedTools(chart ? "giac-mo" : null);

  if (!chart) {
    return (
      <div className="flow-body giac-mo-flow is-configuring">
        <form className="tuvi-form tarot-setup-panel" onSubmit={submit}>
          <p className="tuvi-note mb-1">
            Kể lại giấc mơ bằng lời của bạn, càng nhiều chi tiết càng tốt. Không
            cần ngày sinh hay họ tên — giấc mơ không đọc theo dữ liệu đó.
          </p>

          <label>
            Giấc mơ của bạn
            <Textarea
              name="dream"
              required
              maxLength={2000}
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              placeholder="Tôi mơ thấy mình đang đi trên một cây cầu dài, phía dưới là nước…"
              className="min-h-[150px]"
            />
          </label>
          <p className="tuvi-note">{dream.trim().length}/2000 ký tự · tối thiểu 10</p>

          <div className="tuvi-grid">
            <label>
              Khi tỉnh dậy bạn thấy thế nào?
              <IconSelect icon={Smile} name="mood" placeholder="Chọn cảm xúc" options={[...dreamMoods]} />
            </label>
            <label>
              Giấc mơ này có lặp lại không?
              <IconSelect icon={CalendarClock} name="recurrence" placeholder="Chọn mức độ" options={[...dreamRecurrences]} />
            </label>
          </div>

          <label className="mt-4 block">
            Dạo này bạn đang bận tâm điều gì?
            <IconField icon={Sparkles} name="context" maxLength={300} placeholder="Ví dụ: đang chuẩn bị đổi việc" />
          </label>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <Button className="tuvi-submit" type="submit" disabled={loading || dream.trim().length < 10}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? "Đang đọc giấc mơ…" : "Giải mã giấc mơ"}
            {loading ? null : <ArrowRight size={18} />}
          </Button>
          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="inline align-[-2px] mr-1" />
            Nội dung giấc mơ được gửi tới dịch vụ AI để diễn giải, và không lưu
            lại trên máy chủ. Chỉ lưu khi bạn chủ động bấm lưu.
          </p>
        </form>

        <section className="tarot-introduction" aria-label="Tìm hiểu về giải mã giấc mơ">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
              <section>
                <h2>Giải mã giấc mơ là gì?</h2>
                <p>
                  Không phải tra một cuốn sách đoán điềm. Ở đây, giấc mơ được
                  đọc như một thứ ngôn ngữ hình ảnh của chính bạn: những biểu
                  tượng quen thuộc trong lời kể được nhận ra, rồi đặt cạnh cảm
                  xúc khi tỉnh và những gì đang diễn ra trong đời bạn.
                </p>
              </section>
              <section>
                <h2>Xem để làm gì?</h2>
                <p>
                  Để gọi tên thứ mình đang mang mà chưa thành lời. Giấc mơ hay
                  lặp lại thường chỉ vào một chuyện chưa được gỡ. Đây là chỗ để
                  chiêm nghiệm, không phải lời tiên đoán về điều sắp xảy ra.
                </p>
              </section>
            </div>
            <section className="tarot-introduction-steps">
              <h2>Giấc mơ được đọc ra sao?</h2>
              <ol>
                <li>
                  <strong>Kể lại giấc mơ</strong>
                  <span>Bằng lời của bạn, không cần mạch lạc.</span>
                </li>
                <li>
                  <strong>Nhận biểu tượng</strong>
                  <span>Những hình ảnh quen thuộc được dò ngay tại chỗ.</span>
                </li>
                <li>
                  <strong>Ghép với cảm xúc</strong>
                  <span>Cùng một biểu tượng, tỉnh dậy sợ hay yên là hai nghĩa.</span>
                </li>
                <li>
                  <strong>Đặt cạnh đời thực</strong>
                  <span>Giấc mơ chỉ có nghĩa khi soi vào điều bạn đang sống.</span>
                </li>
              </ol>
            </section>
          </div>
        </section>

        <div className="tarot-afterword">
          <h3>Giấc mơ không báo trước, nó phản chiếu</h3>
        </div>
        <div className="tarot-principles">
          <div>
            <span><Moon size={28} strokeWidth={1.2} /></span>
            <div>
              <h4>Không phải điềm báo</h4>
              <p>Mơ thấy cái chết hầu như không nói về cái chết thật.</p>
            </div>
          </div>
          <div>
            <span><Sparkles size={28} strokeWidth={1.2} /></span>
            <div>
              <h4>Bạn là người hiểu rõ nhất</h4>
              <p>Ý nghĩa ở đây là gợi mở; cảm nhận của bạn mới là thứ quyết định.</p>
            </div>
          </div>
          <div>
            <span><Check size={28} strokeWidth={1.2} /></span>
            <div>
              <h4>Không phải chẩn đoán</h4>
              <p>Đây là nội dung chiêm nghiệm, không thay thế chuyên gia tâm lý.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">GIẤC MƠ CỦA BẠN</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">
            {chart.symbols.length
              ? `${chart.symbols.length} biểu tượng được nhận ra`
              : "Một giấc mơ riêng của bạn"}
          </h2>
        </div>
        <Button variant="outline" onClick={() => { setChart(null); setReading(null); setLastInput(null); }}>
          <RotateCcw size={15} /> Kể giấc mơ khác
        </Button>
      </div>

      <blockquote className="mt-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-4 text-[14px] leading-[1.8] text-[#5b5276] italic">
        “{chart.input.dream}”
      </blockquote>
      <p className="mt-2 text-[12px] text-[#6a5c7a]">
        {[chart.input.mood && `Tỉnh dậy: ${chart.input.mood}`,
          chart.input.recurrence,
          chart.input.context && `Bối cảnh: ${chart.input.context}`]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {chart.symbols.length ? (
        <div className="mt-6">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
            Biểu tượng trong giấc mơ
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {chart.symbols.map((s) => (
              <div key={s.key} className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-[family-name:var(--font-serif-app)] text-[19px] text-[#3e357e]">
                    {s.label}
                  </p>
                  <span className="rounded-full border border-[#e0d5f0] bg-[#f6f0fd] px-2 py-0.5 text-xs text-[#795493]">
                    {s.theme}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#5b5276]">{s.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {chart.notes.length ? (
        <ul className="mt-4 flex list-none flex-col gap-1 p-0">
          {chart.notes.map((n) => (
            <li key={n} className="text-[12px] leading-[1.7] text-[#6a5c7a]">· {n}</li>
          ))}
        </ul>
      ) : null}

      {readingLoading ? (
        <div className="mt-7 flex items-center gap-3 border-t border-[#efe6f6] pt-6 text-[14px] text-[#6a5c7a]">
          <LoaderCircle className="spin" size={17} />
          Đang đọc giấc mơ của bạn…
        </div>
      ) : reading?.source === "ai" ? (
        <div className="mt-7 border-t border-[#efe6f6] pt-6">
          <p className="text-[15px] leading-[1.8] text-[#5b5276]">{reading.summary}</p>
          {reading.sections.map((s) => (
            <section key={s.title} className="mt-5">
              <h3 className="font-[family-name:var(--font-serif-app)] text-[19px] text-[#281b44]">{s.title}</h3>
              {s.takeaway ? <p className="mt-1.5 text-[15px] leading-[1.7] font-medium text-[#3e357e]">{s.takeaway}</p> : null}
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5b5276]">{s.text}</p>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-7 border-t border-[#efe6f6] pt-6">
          <p className="text-[13px] leading-[1.8] text-[#6a5c7a]">
            Phần diễn giải AI hiện chưa khả dụng. Ý nghĩa các biểu tượng phía
            trên được tra tại chỗ nên vẫn đọc được.
          </p>
          {lastInput ? (
            <Button variant="outline" className="mt-3" onClick={() => void loadReading(lastInput)}>
              <RotateCcw size={15} /> Thử diễn giải lại
            </Button>
          ) : null}
        </div>
      )}


      <p className="mt-6 text-xs leading-[1.8] text-[#6a5c7a]">
        Ý nghĩa biểu tượng ở đây là nội dung chiêm nghiệm do dự án biên soạn,
        không phải kết luận tâm lý học và không có bảng tra đúng sai. Giấc mơ
        không báo trước điều sắp xảy ra.
      </p>
    </div>
  );
}
