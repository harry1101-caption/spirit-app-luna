"use client";

import { useState } from "react";
import {
  ArrowRight, Check, LoaderCircle, LockKeyhole, RotateCcw, Scroll, Sparkles,
} from "lucide-react";
import { FieldMessage, FormIntro, TEXTAREA } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRelatedTools } from "@/components/related-tools";
import {
  checkQuestion, gradeMeaning, notes, ritualSteps, sampleQuestions, type Grade,
} from "@/lib/xin-xam";
import { KeoToss } from "@/components/keo-toss";
import { track } from "@/lib/analytics";
import { deviceSeed } from "@/lib/seeded";

type Stick = { so: number; cap: Grade; tho: string[]; dienTich: string };
type Chart = { stick: number; question: string; day: string; card: Stick };
type Interpretation = {
  hanViet: string[];
  nghia: string[];
  summary: string;
  sections: { title: string; takeaway?: string; text: string; evidence: string[] }[];
  source: "ai" | "guide";
};

/**
 * Xin Xăm Quan Âm.
 *
 * Màn hình đi theo đúng nghi thức: nêu câu hỏi → gieo keo xin phép → nhận quẻ.
 * Gieo keo đặt TRƯỚC khi lộ quẻ là có chủ ý; nếu cho thấy quẻ rồi mới gieo thì
 * nó thành nút trang trí, còn ở đây nó thật sự chặn đường.
 */
export function XinXamFlow() {
  const [question, setQuestion] = useState("");
  const [chart, setChart] = useState<Chart | null>(null);
  const [reading, setReading] = useState<Interpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);
  const [error, setError] = useState("");
  /** Lỗi của ô câu hỏi, hiện ngay dưới ô — tách khỏi `error` là lỗi máy chủ (quy tắc form chung, form-field.tsx). */
  const [questionError, setQuestionError] = useState("");

  useRelatedTools(chart ? "xin-xam" : null);

  async function loadReading(payload: Record<string, unknown>) {
    setReadingLoading(true);
    try {
      const response = await fetch("/api/xin-xam/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setReading(response.ok ? data.interpretation : null);
      track(response.ok ? "xin_xam_interpret_complete" : "xin_xam_interpret_fail");
    } catch {
      setReading(null);
      track("xin_xam_interpret_fail");
    } finally {
      setReadingLoading(false);
    }
  }

  async function receiveStick() {
    setLoading(true);
    setError("");
    track("xin_xam_submit");
    const body = {
      question: question.trim(),
      device: deviceSeed(),
      day: new Date().toISOString().slice(0, 10),
    };
    try {
      const response = await fetch("/api/xin-xam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Chưa rút được quẻ.");
      setChart(payload.chart);
      track("xin_xam_result_view");
      track("experience_complete", { method: "xin-xam" });
      setReading(null);
      window.scrollTo({ top: 0, behavior: "auto" });
      void loadReading(body);
    } catch (err) {
      setError((err as Error).message);
      track("xin_xam_error");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    track("xin_xam_restart");
    setChart(null);
    setReading(null);
    setQuestion("");
    setError("");
    setQuestionError("");
  }

  if (!chart) {
    return (
      <div className="flow-body is-configuring">
        <div className="tuvi-form tarot-setup-panel">
          <FormIntro>
            Nghĩ rõ một việc đang bận lòng rồi viết thành một câu hỏi gọn. Mỗi
            câu hỏi trong ngày chỉ ứng một quẻ.
          </FormIntro>

          <label className="mt-2 block">
            Bạn muốn hỏi điều gì?
            <Textarea
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setQuestionError("");
              }}
              maxLength={300}
              placeholder="Chuyện gì đang khiến bạn phân vân?"
              className={`${TEXTAREA} mt-2 ${questionError ? "border-[#c4566a]!" : ""}`}
              id="xin-xam-question"
              aria-invalid={questionError ? true : undefined}
              aria-describedby={questionError ? "xin-xam-question-error" : undefined}
            />
            {questionError ? <FieldMessage id="xin-xam-question-error">{questionError}</FieldMessage> : null}
          </label>

          {/* Dùng lại .tarot-question-suggestions của Tarot cho cùng kiểu chip. */}
          <div className="tarot-question-suggestions mt-5!">
            <p>
              Chưa biết hỏi gì?
            </p>
            <div className="sm:grid-cols-2!">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setQuestion(q);
                    setQuestionError("");
                    document.getElementById("xin-xam-question")?.focus();
                  }}
                >
                  <span>{q}</span>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <KeoToss
            onBeforeToss={() => {
              const check = checkQuestion(question);
              if (!check.ok) {
                setQuestionError(check.error);
                document.getElementById("xin-xam-question")?.focus();
                return false;
              }
              setQuestionError("");
              return true;
            }}
            onAccepted={receiveStick}
            busy={loading}
          />

          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
            Câu hỏi chỉ dùng để rút quẻ và luận giải, không lưu lại trên máy chủ.
          </p>
        </div>

        <section className="tarot-introduction" aria-label="Tìm hiểu về xin xăm">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
              <section>
                <h2>Xin xăm là gì?</h2>
                <p>
                  Một lối hỏi ý xưa ở chùa: nêu một việc đang phân vân, rút một
                  thẻ trong ống xăm, rồi đọc bài thơ bốn câu trên thẻ ấy mà ngẫm
                  xem nó soi vào việc của mình thế nào. Bộ xăm Quan Âm có 100
                  thẻ, mỗi thẻ một bài thất ngôn tứ tuyệt và một điển tích.
                </p>
              </section>
              <section>
                <h2>Xin để làm gì?</h2>
                <p>
                  Không phải để biết trước chuyện gì sẽ xảy ra. Bài thơ cho một
                  hình ảnh, và chính việc bạn soi hình ảnh ấy vào hoàn cảnh của
                  mình mới là phần có ích — nó buộc bạn nói rõ ra điều đang
                  vướng.
                </p>
              </section>
            </div>
            <section className="tarot-introduction-steps">
              <h2>Nghi thức gồm những gì?</h2>
              <ol>
                {ritualSteps.map((step, i) => (
                  <li key={step}>
                    <strong>Bước {i + 1}</strong>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>

        <div className="tarot-afterword">
          <h3>Quẻ Hạ không phải điềm gở</h3>
        </div>
        <div className="tarot-principles">
          {notes.map((note, i) => (
            <div key={note}>
              <span>
                {[<Scroll key="a" size={28} strokeWidth={1.2} />,
                  <Sparkles key="b" size={28} strokeWidth={1.2} />,
                  <Check key="c" size={28} strokeWidth={1.2} />][i]}
              </span>
              <div>
                <h4>{["Mỗi ngày một quẻ", "Cấp quẻ nói việc, không nói người", "Để chiêm nghiệm"][i]}</h4>
                <p>{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { card } = chart;
  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">XĂM QUAN ÂM</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">
            Quẻ số {card.so}
          </h2>
          <p className="mt-1 text-[13px] text-[#5b5276]">
            {card.cap} · {gradeMeaning[card.cap]}
          </p>
        </div>
        <Button variant="outline" onClick={restart} type="button">
          <RotateCcw size={15} /> Hỏi việc khác
        </Button>
      </div>

      {/* Nguyên văn chữ Hán luôn hiện cạnh bản dịch: phần phiên âm và diễn nghĩa
          là do AI làm, nên phải để người biết chữ còn đối chiếu được. */}
      <div className="mt-6 rounded-2xl border border-[#e0d5f0] bg-[#f8f4fd]/70 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Nguyên văn</p>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {card.tho.map((line, i) => (
                <p key={i} className="font-[family-name:var(--font-serif-app)] text-[19px] leading-[1.6] text-[#3e357e]">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Hán–Việt</p>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {(reading?.hanViet?.length ? reading.hanViet : card.tho.map(() => "…")).map((line, i) => (
                <p key={i} className="text-[15px] leading-[1.6] text-[#5b5276] italic">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {reading?.nghia?.length ? (
          <ol className="mt-5 flex list-none flex-col gap-2 border-t border-[#e0d5f0] p-0 pt-4">
            {reading.nghia.map((line, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] leading-[1.75] text-[#5b5276]">
                <span aria-hidden="true" className="shrink-0 text-[#a894c4]">{i + 1}.</span>
                {line}
              </li>
            ))}
          </ol>
        ) : null}

        {card.dienTich ? (
          <p className="mt-4 text-[13px] text-[#6b6287]">
            Điển tích: <strong className="font-medium text-[#3e357e]">{card.dienTich}</strong>
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-[13px] leading-[1.75] text-[#6b6287]">
        Câu bạn hỏi: <em className="not-italic text-[#3e357e]">“{chart.question}”</em>
      </p>

      {readingLoading ? (
        <div className="mt-7 flex items-center gap-3 border-t border-[#efe6f6] pt-6 text-[14px] text-[#6a5c7a]">
          <LoaderCircle className="spin" size={17} /> Đang luận giải quẻ…
        </div>
      ) : reading?.source === "ai" ? (
        <div className="mt-7 border-t border-[#efe6f6] pt-6">
          <p className="text-[15px] leading-[1.8] text-[#5b5276]">{reading.summary}</p>
          {reading.sections.map((s) => (
            <section key={s.title} className="mt-5">
              <h3 className="font-[family-name:var(--font-serif-app)] text-[19px] text-[#281b44]">{s.title}</h3>
              {s.takeaway ? (
                <p className="mt-1.5 text-[15px] leading-[1.7] font-medium text-[#3e357e]">{s.takeaway}</p>
              ) : null}
              <p className="mt-2 text-[14px] leading-[1.8] text-[#5b5276]">{s.text}</p>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-7 border-t border-[#efe6f6] pt-6">
          <p className="text-[13px] leading-[1.8] text-[#6a5c7a]">
            Phần luận giải AI hiện chưa khả dụng. Bài thơ và cấp quẻ phía trên
            là nguyên văn của thẻ nên vẫn đầy đủ.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs leading-[1.8] text-[#6a5c7a]">
        Bài thơ là nguyên văn chữ Hán của bộ xăm Quan Âm. Phần phiên âm Hán–Việt
        và diễn nghĩa do AI thực hiện, có thể sai đôi chỗ ở chữ cổ — nguyên văn
        để ngay bên cạnh để bạn đối chiếu. Xăm là nội dung chiêm nghiệm, không
        phải lời tiên đoán.
      </p>
    </div>
  );
}
