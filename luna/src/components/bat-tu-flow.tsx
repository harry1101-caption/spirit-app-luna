"use client";

import { useState } from "react";
import { ArrowRight, CalendarClock, CalendarDays, Check, Clock3, LoaderCircle, LockKeyhole, RotateCcw, Scale, UserRound, VenusAndMars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelatedTools } from "@/components/related-tools";
import { Checkbox } from "@/components/ui/checkbox";
import { IconField, IconSelect } from "@/components/form-field";
import { elements, type BatTuChart } from "@/lib/bat-tu";

type Interpretation = {
  summary: string;
  sections: { title: string; takeaway?: string; text: string; evidence: string[] }[];
  source: "ai" | "guide";
};

const elementTone: Record<string, string> = {
  Mộc: "bg-[#6f9b73]",
  Hỏa: "bg-[#c0705f]",
  Thổ: "bg-[#b4925c]",
  Kim: "bg-[#8e8fa6]",
  Thủy: "bg-[#5f7fa8]",
};

export function BatTuFlow() {
  const [chart, setChart] = useState<BatTuChart | null>(null);
  const [reading, setReading] = useState<Interpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);
  const [error, setError] = useState("");
  const [unknownHour, setUnknownHour] = useState(false);
  const [lastInput, setLastInput] = useState<Record<string, unknown> | null>(null);

  /** Luận giải chạy sau khi lá số đã hiện, nên hỏng cũng không mất lá số. */
  async function loadReading(payload: Record<string, unknown>) {
    setReadingLoading(true);
    try {
      const response = await fetch("/api/bat-tu/interpret", {
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
      name: String(data.get("name") || "").trim() || undefined,
      birthDate: String(data.get("birthDate") || ""),
      birthTime: unknownHour ? null : String(data.get("birthTime") || ""),
      gender: String(data.get("gender") || "Nam"),
    };
    try {
      const response = await fetch("/api/bat-tu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Không lập được lá số.");
      setChart(payload.chart);
      setLastInput(body);
      setReading(null);
      window.scrollTo({ top: 0, behavior: "auto" });
      void loadReading(body); // không await: lá số hiện ngay, luận giải tới sau
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Gợi ý feature liên quan render ngoài thẻ, do RelatedToolsSlot ở luna-app.
  useRelatedTools(chart ? "bat-tu" : null);

  if (!chart) {
    return (
      <div className="flow-body bat-tu-flow is-configuring">
      <form className="tuvi-form tarot-setup-panel" onSubmit={submit}>
        <p className="tuvi-note mb-1">
          Bát Tự lập từ ngày giờ sinh dương lịch. Lá số đổi trụ tại tiết khí,
          không theo tháng âm lịch — nên bạn chỉ cần nhập đúng ngày dương.
        </p>

        <label>Họ và tên
          <IconField icon={UserRound} name="name" maxLength={80} placeholder="Nguyễn Văn An" />
        </label>

        <div className="tuvi-grid">
          <label>Ngày sinh (dương lịch)
            <IconField icon={CalendarDays} type="date" name="birthDate" required min="1900-02-05" max="2100-01-01" />
          </label>
          <label>Giờ sinh
            <IconField icon={Clock3} type="time" name="birthTime" required={!unknownHour} disabled={unknownHour} />
          </label>
        </div>

        <div className="tuvi-fortune-options" role="group">
          <div className="tuvi-fortune-option">
            <Checkbox id="bat-tu-unknown-hour" checked={unknownHour} onCheckedChange={(v) => setUnknownHour(Boolean(v))} />
            <label htmlFor="bat-tu-unknown-hour">Tôi không rõ giờ sinh</label>
          </div>
          <p className="tuvi-note">
            Lá số sẽ chỉ có 3 trụ. Trụ Giờ và phần luận liên quan tới giờ sẽ không khả dụng.
          </p>
        </div>

        <label className="mt-4 block">Giới tính
          <IconSelect icon={VenusAndMars} name="gender" required placeholder="Chọn giới tính" options={["Nam", "Nữ"]} defaultValue="Nam" />
        </label>
        <p className="tuvi-note">
          Giới tính cần cho hướng chạy Đại Vận (thuận hay nghịch), không dùng vào việc khác.
        </p>

        {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

        <Button className="tuvi-submit" type="submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={18} /> : null}
          {loading ? "Đang lập lá số…" : "Lập lá số Bát Tự"}
          {loading ? null : <ArrowRight size={18} />}
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="inline align-[-2px] mr-1" />
          Ngày giờ sinh chỉ dùng để lập lá số, không lưu lại trên máy chủ.
        </p>
      </form>

      <section className="tarot-introduction" aria-label="Tìm hiểu về Bát Tự">
        <div className="tarot-introduction-body">
          <div className="tarot-introduction-context">
            <section>
              <h2>Bát Tự là gì?</h2>
              <p>
                Bát Tự nghĩa là “tám chữ”. Ngày giờ sinh của bạn được quy thành
                bốn trụ — Năm, Tháng, Ngày, Giờ — mỗi trụ gồm một Thiên Can và
                một Địa Chi, cộng lại vừa đúng tám chữ. Hệ này còn gọi là Tứ Trụ
                hoặc Tử Bình, theo tên người hệ thống hoá nó là Từ Tử Bình.
              </p>
            </section>
            <section>
              <h2>Khác gì Tử Vi?</h2>
              <p>
                Tử Vi xếp hơn một trăm ngôi sao vào mười hai cung, muốn xem lĩnh
                vực nào thì mở cung ấy. Bát Tự không có sao nào cả — nó đọc sự
                cân bằng Ngũ Hành quanh Nhật Chủ. Hai hệ trả lời cùng câu hỏi
                bằng hai bộ máy khác hẳn, nên thường dùng để đối chiếu nhau.
              </p>
            </section>
          </div>
          <section className="tarot-introduction-steps">
            <h2>Lá số được đọc theo thứ tự nào?</h2>
            <ol>
              <li>
                <strong>Dựng bốn trụ</strong>
                <span>Quy ngày giờ sinh thành tám chữ Can Chi.</span>
              </li>
              <li>
                <strong>Tìm Nhật Chủ</strong>
                <span>Can của trụ Ngày chính là bạn.</span>
              </li>
              <li>
                <strong>Cân Ngũ Hành</strong>
                <span>Xem hành nào thừa, hành nào vắng mặt.</span>
              </li>
              <li>
                <strong>Trải Đại Vận</strong>
                <span>Mỗi mười năm một trụ, thuận hay nghịch.</span>
              </li>
            </ol>
          </section>
        </div>
      </section>

      <div className="tarot-afterword">
        <h3>Tám chữ không định sẵn đời bạn</h3>
      </div>
      <div className="tarot-principles">
        <div>
          <span><Scale size={28} strokeWidth={1.2} /></span>
          <div>
            <h4>Đọc theo cân bằng</h4>
            <p>Ý nghĩa nằm ở chỗ thiếu và thừa, không ở từng chữ riêng lẻ.</p>
          </div>
        </div>
        <div>
          <span><CalendarClock size={28} strokeWidth={1.2} /></span>
          <div>
            <h4>Mốc là tiết khí</h4>
            <p>Năm đổi tại Lập Xuân, tháng đổi tại tiết — không theo âm lịch.</p>
          </div>
        </div>
        <div>
          <span><Check size={28} strokeWidth={1.2} /></span>
          <div>
            <h4>Quyết định vẫn ở bạn</h4>
            <p>Lá số là một góc nhìn để chiêm nghiệm, không phải lời phán.</p>
          </div>
        </div>
      </div>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(chart.elementCount), 1);
  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">LÁ SỐ BÁT TỰ</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">
            {chart.input.name ? `Lá số của ${chart.input.name}` : "Tứ trụ của bạn"}
          </h2>
        </div>
        <Button variant="outline" onClick={() => { setChart(null); setReading(null); setLastInput(null); }}>
          <RotateCcw size={15} /> Lập lại
        </Button>
      </div>

      {/* Bốn trụ */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {chart.pillars.map((p) => (
          <div key={p.label} className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4 text-center">
            <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Trụ {p.label}</p>
            <p className="mt-2 font-[family-name:var(--font-serif-app)] text-[26px] leading-tight text-[#3e357e]">
              {p.stem}
            </p>
            <p className="font-[family-name:var(--font-serif-app)] text-[26px] leading-tight text-[#6a4ac4]">
              {p.branch}
            </p>
            <p className="mt-2 text-[12px] text-[#6b6287]">
              {p.stemElement} {p.stemYinYang} · {p.branchElement}
            </p>
            <p className="mt-1 min-h-[18px] text-[12px] font-medium text-[#795493]">
              {p.god ?? "Nhật Chủ"}
            </p>
            <p className="mt-2 border-t border-[#efe6f6] pt-2 text-xs leading-[1.6] text-[#6a5c7a]">
              Tàng Can: {p.hiddenStems.map((h) => h.stem).join(", ")}
            </p>
          </div>
        ))}
      </div>

      {/* Nhật Chủ + ngũ hành */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="rounded-2xl border border-[#e0d5f0] bg-[#f6f0fd]/70 p-4">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Nhật Chủ</p>
          <p className="mt-1 font-[family-name:var(--font-serif-app)] text-[24px] text-[#3e357e]">
            {chart.dayMaster.stem} · {chart.dayMaster.element} {chart.dayMaster.yinYang}
          </p>
          <p className="mt-2 text-[13px] leading-[1.7] text-[#6b6287]">
            Can của trụ Ngày đại diện cho chính bạn; bảy chữ còn lại đọc trong
            tương quan với nó.
          </p>
        </div>
        <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
            Ngũ hành trên {chart.hourKnown ? 8 : 6} chữ
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {elements.map((e) => (
              <div key={e} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-[13px] text-[#6b6287]">{e}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f0ebf7]">
                  <span
                    className={`block h-full rounded-full ${elementTone[e]}`}
                    style={{ width: `${(chart.elementCount[e] / maxCount) * 100}%` }}
                  />
                </span>
                <span className="w-4 shrink-0 text-right text-[13px] text-[#6b6287]">
                  {chart.elementCount[e]}
                </span>
              </div>
            ))}
          </div>
          {chart.missingElements.length ? (
            <p className="mt-3 text-[12px] text-[#6a5c7a]">
              Không xuất hiện: {chart.missingElements.join(", ")}
            </p>
          ) : null}
        </div>
      </div>

      {/* Đại Vận */}
      <div className="mt-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
        <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
          Đại Vận · đi {chart.luck.direction.toLowerCase()} · khởi {chart.luck.startAge} tuổi {chart.luck.startMonths} tháng
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {chart.luck.pillars.map((lp) => (
            <div key={lp.startAge} className="min-w-[88px] flex-1 rounded-xl border border-[#efe6f6] bg-[#faf7ff] p-2 text-center">
              <p className="text-xs text-[#6a5c7a]">{lp.startAge}–{lp.endAge}</p>
              <p className="mt-1 font-[family-name:var(--font-serif-app)] text-[16px] text-[#3e357e]">
                {lp.stem} {lp.branch}
              </p>
            </div>
          ))}
        </div>
      </div>

      {chart.notes.length ? (
        <ul className="mt-4 flex list-none flex-col gap-1 p-0">
          {chart.notes.map((n) => (
            <li key={n} className="text-[12px] leading-[1.7] text-[#6a5c7a]">· {n}</li>
          ))}
        </ul>
      ) : null}

      {/* Luận giải */}
      {readingLoading ? (
        <div className="mt-7 flex items-center gap-3 border-t border-[#efe6f6] pt-6 text-[14px] text-[#6a5c7a]">
          <LoaderCircle className="spin" size={17} />
          Đang luận giải lá số…
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
            Phần luận giải AI hiện chưa khả dụng. Lá số phía trên được lập tại chỗ
            bằng toán lịch nên vẫn đầy đủ và chính xác.
          </p>
          {lastInput ? (
            <Button variant="outline" className="mt-3" onClick={() => void loadReading(lastInput)}>
              <RotateCcw size={15} /> Thử luận giải lại
            </Button>
          ) : null}
        </div>
      )}


      <p className="mt-6 text-xs leading-[1.8] text-[#6a5c7a]">
        Quy ước đã dùng: trụ Năm đổi tại Lập Xuân; trụ Tháng đổi tại 12 tiết khí;
        giờ Tý muộn từ 23:00 tính sang ngày mới; dùng giờ đồng hồ UTC+7, chưa
        hiệu chỉnh giờ mặt trời thật theo kinh độ nơi sinh.
      </p>
    </div>
  );
}
