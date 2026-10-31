"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Check, Hash, LoaderCircle, LockKeyhole, RotateCcw, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelatedTools } from "@/components/related-tools";
import { IconField, FormIntro, ValidatedForm } from "@/components/form-field";
import { numberMeanings, type ThanSoHocChart } from "@/lib/than-so-hoc";
import { track } from "@/lib/analytics";

type Interpretation = {
  summary: string;
  sections: { title: string; takeaway?: string; text: string; evidence: string[] }[];
  source: "ai" | "guide";
};

export function ThanSoHocFlow() {
  const [chart, setChart] = useState<ThanSoHocChart | null>(null);
  const [reading, setReading] = useState<Interpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastInput, setLastInput] = useState<Record<string, unknown> | null>(null);

  /** Luận giải chạy sau khi các con số đã hiện, nên hỏng cũng không mất kết quả. */
  async function loadReading(payload: Record<string, unknown>) {
    setReadingLoading(true);
    try {
      const response = await fetch("/api/than-so-hoc/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setReading(response.ok ? data.interpretation : null);
      track(response.ok ? "than_so_hoc_interpret_complete" : "than_so_hoc_interpret_fail");
    } catch {
      setReading(null);
      track("than_so_hoc_interpret_fail");
    } finally {
      setReadingLoading(false);
    }
  }

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    setLoading(true);
    setError("");
    track("than_so_hoc_submit");
    const body = {
      fullName: String(data.get("fullName") || "").trim(),
      birthDate: String(data.get("birthDate") || ""),
      readingYear: new Date().getFullYear(),
    };
    try {
      const response = await fetch("/api/than-so-hoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Không tính được các con số.");
      setChart(payload.chart);
      track("than_so_hoc_result_view");
      track("experience_complete", { method: "than-so-hoc" });
      setLastInput(body);
      setReading(null);
      window.scrollTo({ top: 0, behavior: "auto" });
      void loadReading(body);
    } catch (err) {
      setError((err as Error).message);
      track("than_so_hoc_error");
    } finally {
      setLoading(false);
    }
  }

  // Gợi ý feature liên quan render ngoài thẻ, do RelatedToolsSlot ở luna-app.
  useRelatedTools(chart ? "than-so-hoc" : null);

  if (!chart) {
    return (
      <div className="flow-body than-so-hoc-flow is-configuring">
        <ValidatedForm className="tuvi-form tarot-setup-panel" onValidSubmit={(form) => void submit(form)}>
          <FormIntro>
            Thần số học quy họ tên và ngày sinh thành những con số. Hãy nhập
            đúng họ tên khai sinh — ba trong sáu con số được tính từ tên.
          </FormIntro>

          <label>Họ và tên khai sinh
            <IconField icon={UserRound} name="fullName" required maxLength={80} placeholder="Nguyễn Văn An" />
          </label>
          <p className="tuvi-note">
            Tên có dấu vẫn được — dấu sẽ được bỏ trước khi quy ra số vì bảng
            Pythagoras chỉ có A–Z.
          </p>

          <label className="mt-4 block">Ngày sinh (dương lịch)
            <IconField icon={CalendarDays} type="date" name="birthDate" required min="1900-01-01" max="2100-12-31" />
          </label>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <Button className="tuvi-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? "Đang tính…" : "Xem các con số của tôi"}
            {loading ? null : <ArrowRight size={18} />}
          </Button>
          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="inline align-[-2px] mr-1" />
            Họ tên và ngày sinh chỉ dùng để tính, không lưu lại trên máy chủ.
          </p>
        </ValidatedForm>

        <section className="tarot-introduction" aria-label="Tìm hiểu về Thần số học">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
              <section>
                <h2>Thần số học là gì?</h2>
                <p>
                  Mỗi chữ cái trong tên được gán một con số từ 1 đến 9 theo bảng
                  Pythagoras, còn ngày sinh thì được cộng và rút gọn lại. Từ hai
                  nguồn ấy ra sáu con số cốt lõi — mỗi con số soi một mặt khác
                  nhau của bạn. Riêng 11, 22 và 33 được giữ nguyên, gọi là số
                  bậc thầy.
                </p>
              </section>
              <section>
                <h2>Xem để làm gì?</h2>
                <p>
                  Để có thêm một cách gọi tên những khuynh hướng của mình: điều
                  gì khiến bạn thấy đúng với bản thân, điều gì người khác nhìn
                  thấy trước, và năm nay nghiêng về nhịp nào. Đây là công cụ
                  chiêm nghiệm, không phải một phép đo đã được kiểm chứng.
                </p>
              </section>
            </div>
            <section className="tarot-introduction-steps">
              <h2>Các con số được tính ra sao?</h2>
              <ol>
                <li>
                  <strong>Bỏ dấu họ tên</strong>
                  <span>Bảng Pythagoras chỉ có A–Z nên Đ thành D.</span>
                </li>
                <li>
                  <strong>Quy chữ thành số</strong>
                  <span>A đến I là 1–9, rồi lặp lại từ J và từ S.</span>
                </li>
                <li>
                  <strong>Rút gọn</strong>
                  <span>Cộng dồn tới khi còn một chữ số, trừ 11, 22, 33.</span>
                </li>
                <li>
                  <strong>Đọc theo nhóm</strong>
                  <span>Nhóm từ ngày sinh và nhóm từ họ tên nói hai chuyện khác nhau.</span>
                </li>
              </ol>
            </section>
          </div>
        </section>

        <div className="tarot-afterword">
          <h3>Những con số gợi mở, không phán xét</h3>
        </div>
        <div className="tarot-principles">
          <div>
            <span><Hash size={28} strokeWidth={1.2} /></span>
            <div>
              <h4>Mọi phép tính đều hiện ra</h4>
              <p>Bạn thấy rõ từng bước cộng và rút gọn, không có hộp đen.</p>
            </div>
          </div>
          <div>
            <span><Sparkles size={28} strokeWidth={1.2} /></span>
            <div>
              <h4>Tên khai sinh là gốc</h4>
              <p>Đổi tên gọi thường ngày sẽ ra con số khác, nên dùng tên khai sinh.</p>
            </div>
          </div>
          <div>
            <span><Check size={28} strokeWidth={1.2} /></span>
            <div>
              <h4>Quyết định vẫn ở bạn</h4>
              <p>Giữ lại điều hữu ích và tự chọn bước tiếp theo.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fromDate = chart.numbers.filter((n) => n.from === "Ngày sinh");
  const fromName = chart.numbers.filter((n) => n.from === "Họ tên");
  const maxTally = Math.max(...Object.values(chart.letterTally), 1);

  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">THẦN SỐ HỌC</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">
            Những con số của {chart.input.fullName}
          </h2>
          <p className="mt-1 text-[12px] text-[#6a5c7a]">
            Tên quy ra chữ cái: {chart.normalizedName}
          </p>
        </div>
        <Button variant="outline" onClick={() => { track("than_so_hoc_restart"); setChart(null); setReading(null); setLastInput(null); }}>
          <RotateCcw size={15} /> Tính lại
        </Button>
      </div>

      {[["Từ ngày sinh", fromDate], ["Từ họ tên", fromName]].map(([label, group]) => (
        <div key={label as string} className="mt-6">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">{label as string}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(group as typeof chart.numbers).map((n) => (
              <div key={n.key} className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13px] font-medium text-[#795493]">{n.label}</p>
                  <p className="font-[family-name:var(--font-serif-app)] text-[30px] leading-none text-[#3e357e]">
                    {n.value}
                  </p>
                </div>
                {n.isMaster ? (
                  <p className="mt-1 text-xs font-medium text-[#b0915f]">Số bậc thầy</p>
                ) : null}
                <p className="mt-2 text-[13px] leading-[1.6] text-[#281b44]">
                  {numberMeanings[n.value]?.title}
                </p>
                <p className="mt-1 text-[12px] leading-[1.6] text-[#6b6287]">
                  {numberMeanings[n.value]?.text}
                </p>
                <p className="mt-2 border-t border-[#efe6f6] pt-2 text-xs leading-[1.6] text-[#6a5c7a]">
                  {n.steps}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
            Chữ số trong tên
          </p>
          <div className="mt-3 flex items-end gap-2">
            {Object.entries(chart.letterTally).map(([digit, count]) => (
              <div key={digit} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-[#6b6287]">{count}</span>
                <span
                  className={`w-full rounded-t ${count ? "bg-[#a98fd0]" : "bg-[#efe6f6]"}`}
                  style={{ height: `${Math.max((count / maxTally) * 56, 4)}px` }}
                />
                <span className={`text-[12px] ${count ? "text-[#3e357e]" : "text-[#9a8cab]"}`}>
                  {digit}
                </span>
              </div>
            ))}
          </div>
          {chart.missing.length ? (
            <p className="mt-3 text-[12px] leading-[1.6] text-[#6a5c7a]">
              Không xuất hiện: {chart.missing.join(", ")} — thường được xem là
              những bài học còn để ngỏ.
            </p>
          ) : (
            <p className="mt-3 text-[12px] text-[#6a5c7a]">Tên có đủ cả chín chữ số.</p>
          )}
        </div>
        <div className="rounded-2xl border border-[#e0d5f0] bg-[#f6f0fd]/70 p-4">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
            Năm cá nhân {chart.personalYear.year}
          </p>
          <p className="mt-1 font-[family-name:var(--font-serif-app)] text-[32px] leading-none text-[#3e357e]">
            {chart.personalYear.value}
          </p>
          <p className="mt-2 text-[13px] leading-[1.6] text-[#281b44]">
            {numberMeanings[chart.personalYear.value]?.title}
          </p>
          <p className="mt-2 text-xs leading-[1.6] text-[#6a5c7a]">
            {chart.personalYear.steps}
          </p>
        </div>
      </div>

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
          Đang luận giải các con số…
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
            Phần luận giải AI hiện chưa khả dụng. Các con số phía trên được tính
            tại chỗ nên vẫn đầy đủ và chính xác.
          </p>
          {lastInput ? (
            <Button variant="outline" className="mt-3" onClick={() => { track("than_so_hoc_interpret_retry"); void loadReading(lastInput); }}>
              <RotateCcw size={15} /> Thử luận giải lại
            </Button>
          ) : null}
        </div>
      )}


      <p className="mt-6 text-xs leading-[1.8] text-[#6a5c7a]">
        Quy ước đã dùng: bảng Pythagoras A–Z; tên bỏ dấu trước khi quy số; Y
        tính là nguyên âm; số bậc thầy 11, 22, 33 giữ nguyên; Số Đường Đời rút
        gọn tháng, ngày, năm riêng rồi mới cộng. Thần số học là công cụ chiêm
        nghiệm, không phải phép đo tính cách đã được kiểm chứng.
      </p>
    </div>
  );
}
