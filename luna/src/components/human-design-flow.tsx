"use client";

import { useState } from "react";
import {
  ArrowRight, CalendarDays, Check, Clock3, Globe, LoaderCircle, LockKeyhole,
  Orbit, RotateCcw, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelatedTools } from "@/components/related-tools";
import { IconField, IconSelect } from "@/components/form-field";
import { centers, type HumanDesignChart } from "@/lib/human-design";

type Interpretation = {
  summary: string;
  sections: { title: string; takeaway?: string; text: string; evidence: string[] }[];
  source: "ai" | "guide";
};

/** Múi giờ hay gặp với người dùng Việt, kèm vài nơi có cộng đồng người Việt. */
const zones: { label: string; offset: number }[] = [
  { label: "Việt Nam (UTC+7)", offset: 420 },
  { label: "Nhật, Hàn (UTC+9)", offset: 540 },
  { label: "Trung Quốc, Singapore (UTC+8)", offset: 480 },
  { label: "Úc miền đông (UTC+10)", offset: 600 },
  { label: "Tây Âu (UTC+1)", offset: 60 },
  { label: "Anh (UTC+0)", offset: 0 },
  { label: "Mỹ miền đông (UTC−5)", offset: -300 },
  { label: "Mỹ miền tây (UTC−8)", offset: -480 },
];

export function HumanDesignFlow() {
  const [chart, setChart] = useState<HumanDesignChart | null>(null);
  const [reading, setReading] = useState<Interpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastInput, setLastInput] = useState<Record<string, unknown> | null>(null);

  async function loadReading(payload: Record<string, unknown>) {
    setReadingLoading(true);
    try {
      const response = await fetch("/api/human-design/interpret", {
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
    const zone = zones.find((z) => z.label === String(data.get("zone"))) ?? zones[0];
    const body = {
      birthDate: String(data.get("birthDate") || ""),
      birthTime: String(data.get("birthTime") || ""),
      tzOffset: zone.offset,
    };
    try {
      const response = await fetch("/api/human-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Không lập được biểu đồ.");
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
  useRelatedTools(chart ? "human-design" : null);

  if (!chart) {
    return (
      <div className="flow-body human-design-flow is-configuring">
        <form className="tuvi-form tarot-setup-panel" onSubmit={submit}>
          <p className="tuvi-note mb-1">
            Human Design lấy vị trí các hành tinh tại đúng thời khắc bạn sinh ra.
            Giờ sinh càng chính xác càng tốt — Mặt Trăng đi khoảng 13° mỗi ngày
            nên lệch mười lăm phút đã có thể đổi kết quả.
          </p>

          <div className="tuvi-grid">
            <label>Ngày sinh (dương lịch)
              <IconField icon={CalendarDays} type="date" name="birthDate" required min="1900-01-01" max="2100-12-31" />
            </label>
            <label>Giờ sinh
              <IconField icon={Clock3} type="time" name="birthTime" required />
            </label>
          </div>

          <label className="mt-4 block">Múi giờ nơi sinh
            <IconSelect icon={Globe} name="zone" required placeholder="Chọn múi giờ"
              options={zones.map((z) => z.label)} defaultValue={zones[0].label} />
          </label>
          <p className="tuvi-note">
            Chọn theo nơi bạn sinh ra, không phải nơi đang sống.
          </p>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <Button className="tuvi-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? "Đang lập biểu đồ…" : "Lập biểu đồ Human Design"}
            {loading ? null : <ArrowRight size={18} />}
          </Button>
          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="inline align-[-2px] mr-1" />
            Ngày giờ sinh chỉ dùng để lập biểu đồ, không lưu lại trên máy chủ.
          </p>
        </form>

        <section className="tarot-introduction" aria-label="Tìm hiểu về Human Design">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
              <section>
                <h2>Human Design là gì?</h2>
                <p>
                  Một hệ thống ra đời năm 1987, ghép ý tưởng từ Kinh Dịch, chiêm
                  tinh, Kabbalah và hệ luân xa. Vị trí hành tinh lúc bạn sinh
                  được quy thành 64 cổng, các cổng nối nhau thành kênh, kênh
                  thắp sáng 9 trung tâm năng lượng. Hình vẽ ấy cho ra Type của
                  bạn.
                </p>
              </section>
              <section>
                <h2>Xem để làm gì?</h2>
                <p>
                  Để biết cách ra quyết định hợp với mình: nên chủ động khởi
                  xướng, chờ phản hồi, hay chờ được mời. Và để thấy đâu là phần
                  năng lượng ổn định của bạn, đâu là phần dễ bị môi trường
                  khuếch đại.
                </p>
              </section>
            </div>
            <section className="tarot-introduction-steps">
              <h2>Biểu đồ được lập thế nào?</h2>
              <ol>
                <li><strong>Lấy hai thời điểm</strong><span>Lúc sinh, và lúc Mặt Trời còn cách 88 độ trước đó.</span></li>
                <li><strong>Quy ra cổng</strong><span>Mỗi hành tinh rơi vào một trong 64 cổng.</span></li>
                <li><strong>Nối thành kênh</strong><span>Hai cổng đối nhau cùng sáng thì kênh mở.</span></li>
                <li><strong>Đọc ra Type</strong><span>Trung tâm nào sáng quyết định Type và nội quyền.</span></li>
              </ol>
            </section>
          </div>
        </section>

        <div className="tarot-afterword">
          <h3>Không có Type nào hơn Type nào</h3>
        </div>
        <div className="tarot-principles">
          <div>
            <span><Clock3 size={28} strokeWidth={1.2} /></span>
            <div><h4>Giờ sinh rất quan trọng</h4>
              <p>Lệch mười lăm phút có thể đổi hào, đổi kênh, đổi cả Type.</p></div>
          </div>
          <div>
            <span><Zap size={28} strokeWidth={1.2} /></span>
            <div><h4>Trung tâm mở không phải thiếu sót</h4>
              <p>Đó là chỗ bạn nhạy với môi trường, không phải khuyết điểm.</p></div>
          </div>
          <div>
            <span><Check size={28} strokeWidth={1.2} /></span>
            <div><h4>Quyết định vẫn ở bạn</h4>
              <p>Đây là hệ chiêm nghiệm, không phải phép đo đã được kiểm chứng.</p></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">BIỂU ĐỒ HUMAN DESIGN</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">{chart.type}</h2>
          <p className="mt-1 text-[13px] text-[#5b5276]">{chart.strategy}</p>
        </div>
        <Button variant="outline" onClick={() => { setChart(null); setReading(null); setLastInput(null); }}>
          <RotateCcw size={15} /> Lập lại
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[["Type", chart.type], ["Nội quyền", chart.authority], ["Profile", chart.profile]].map(
          ([label, value]) => (
            <div key={label} className="rounded-2xl border border-[#e0d5f0] bg-[#f6f0fd]/70 p-4">
              <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">{label}</p>
              <p className="mt-1 font-[family-name:var(--font-serif-app)] text-[20px] leading-tight text-[#3e357e]">
                {value}
              </p>
            </div>
          ),
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
        <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
          Trung tâm · {chart.definedCenters.length}/9 được định nghĩa
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {centers.map((c) => {
            const on = chart.definedCenters.includes(c);
            return (
              <span key={c}
                className={`rounded-full border px-3 py-1.5 text-[13px] ${
                  on
                    ? "border-[#8d7ac4] bg-[#e5dcf7] font-medium text-[#3e357e]"
                    : "border-[#e8ddef] bg-white/60 text-[#9a8cab]"
                }`}>
                {c}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] leading-[1.7] text-[#6a5c7a]">
          Tô đậm là trung tâm được định nghĩa — phần năng lượng ổn định của bạn.
          Phần còn lại là nơi bạn nhạy với môi trường, không phải khuyết điểm.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
        <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
          Kênh đang mở · {chart.activeChannels.length}
        </p>
        {chart.activeChannels.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {chart.activeChannels.map((ch) => (
              <span key={ch.gates.join("-")}
                className="rounded-xl border border-[#efe6f6] bg-[#faf7ff] px-3 py-1.5 text-[12px] text-[#5b5276]">
                <strong className="text-[#3e357e]">{ch.gates[0]}–{ch.gates[1]}</strong>{" "}
                {ch.centers[0]} · {ch.centers[1]}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-[#6a5c7a]">Không có kênh nào đang mở.</p>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {[["Personality · ý thức", chart.personality], ["Design · vô thức", chart.design]].map(
          ([label, list]) => (
            <div key={label as string} className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
              <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">{label as string}</p>
              <ul className="mt-2 flex list-none flex-col gap-1 p-0">
                {(list as typeof chart.personality).map((a) => (
                  <li key={a.body} className="flex justify-between gap-3 text-[13px]">
                    <span className="text-[#5b5276]">{a.body}</span>
                    <span className="text-[#3e357e]">
                      {a.gate}<span className="text-[#9a8cab]">.{a.line}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>

      <ul className="mt-4 flex list-none flex-col gap-1 p-0">
        {chart.notes.map((n) => (
          <li key={n} className="text-[12px] leading-[1.7] text-[#6a5c7a]">· {n}</li>
        ))}
        <li className="text-[12px] leading-[1.7] text-[#6a5c7a]">
          · Thời điểm Design: {chart.designAt}
        </li>
      </ul>

      {readingLoading ? (
        <div className="mt-7 flex items-center gap-3 border-t border-[#efe6f6] pt-6 text-[14px] text-[#6a5c7a]">
          <LoaderCircle className="spin" size={17} /> Đang luận giải biểu đồ…
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
            Phần luận giải AI hiện chưa khả dụng. Biểu đồ phía trên được lập tại
            chỗ từ vị trí hành tinh thật nên vẫn đầy đủ.
          </p>
          {lastInput ? (
            <Button variant="outline" className="mt-3" onClick={() => void loadReading(lastInput)}>
              <RotateCcw size={15} /> Thử luận giải lại
            </Button>
          ) : null}
        </div>
      )}


      <p className="mt-6 flex items-start gap-2 text-xs leading-[1.8] text-[#6a5c7a]">
        <Orbit size={13} className="mt-1 shrink-0" />
        <span>
          Vị trí hành tinh tính bằng astronomy-engine. Personality lấy tại giờ
          sinh, Design lấy lúc Mặt Trời còn cách 88 độ cung — không phải 88
          ngày. Human Design ra đời năm 1987, là hệ chiêm nghiệm chứ không phải
          phép đo đã được kiểm chứng.
        </span>
      </p>
    </div>
  );
}
