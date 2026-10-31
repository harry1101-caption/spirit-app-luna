"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight, Check, Coins, LoaderCircle, LockKeyhole, RotateCcw, Scroll, Sparkles,
} from "lucide-react";
import { FieldMessage, FormIntro, TEXTAREA } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRelatedTools } from "@/components/related-tools";
import {
  checkQuestion, linePositions, notes, ritualSteps, sampleQuestions, tossMeaning, trigrams,
  type CoinFace, type Hexagram, type KinhDichCast, type LineState,
} from "@/lib/kinh-dich";
import { track } from "@/lib/analytics";
import { deviceSeed } from "@/lib/seeded";

type Interpretation = {
  summary: string;
  sections: { title: string; takeaway?: string; text: string; evidence: string[] }[];
  source: "ai" | "guide";
};

const TOSS_MS = 700;

/**
 * Sáu hào vẽ từ trên xuống (hào 6 ở trên cùng). Hào động tô vàng kèm dấu
 * ○ (dương động) hoặc × (âm động) như cách ghi quẻ truyền thống.
 */
function HexagramLines({ lines, size = "md" }: { lines: (LineState | null)[]; size?: "sm" | "md" }) {
  const width = size === "sm" ? "w-[64px]" : "w-[112px]";
  const height = size === "sm" ? "h-2" : "h-3";
  return (
    <div className={`flex flex-col-reverse ${size === "sm" ? "gap-1" : "gap-2"}`} aria-hidden="true">
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          {line ? (
            <div className={`flex ${width} ${line.yang ? "" : "justify-between"}`}>
              {(line.yang ? [0] : [0, 1]).map((part) => (
                <span
                  key={part}
                  className={`${height} rounded-[3px] ${line.yang ? "w-full" : "w-[42%]"} ${
                    line.moving ? "bg-[#c2a05f]" : "bg-[#5d3f77]"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className={`${width} ${height} rounded-[3px] border border-dashed border-[#d9cce6]`} />
          )}
          {size === "md" ? (
            <span className={`w-3 text-[12px] leading-none text-[#b08a45] ${line?.moving ? "" : "invisible"}`}>
              {line?.yang ? "○" : "×"}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Coin({ face, spin, delay }: { face: CoinFace | null; spin: boolean; delay: number }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <motion.span
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 ${
          face === "sấp" ? "border-[#a894c4] bg-[#e6ddf1]" : "border-[#c9a45f] bg-[#f2e3bd]"
        }`}
        animate={spin ? { y: [0, -36, 0], rotateY: [0, 540, 1080] } : { y: 0, rotateY: 0 }}
        // 1080° trùng 0°, nên về vị trí cũ tức thì thay vì quay ngược lại ba vòng.
        transition={spin ? { duration: TOSS_MS / 1000, delay, ease: [0.3, 0, 0.3, 1] } : { duration: 0 }}
        aria-hidden="true"
      >
        <span className={`h-4 w-4 rounded-[3px] border-2 ${face === "sấp" ? "border-[#a894c4]" : "border-[#c9a45f]"} bg-[#faf7fd]`} />
      </motion.span>
      <small className={`text-xs ${face && !spin ? "text-[#6b6287]" : "text-transparent"}`}>{face ?? "–"}</small>
    </span>
  );
}

function HexagramCard({ label, hexagram, lines, note }: {
  label: string;
  hexagram: Hexagram;
  lines: LineState[];
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-5">
      <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">{label}</p>
      <div className="mt-3 flex items-start gap-5">
        <HexagramLines lines={lines} />
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-serif-app)] text-[24px] leading-tight text-[#3e357e]">
            {hexagram.chu} · {hexagram.ten}
          </p>
          <p className="mt-1 text-[13px] text-[#5b5276]">
            Quẻ {hexagram.so} · {hexagram.tenDayDu}
          </p>
          <p className="mt-1 text-[12px] text-[#6a5c7a]">
            {trigrams[hexagram.tren].image} trên {trigrams[hexagram.duoi].image.toLowerCase()}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {hexagram.tuKhoa.map((word) => (
          <span key={word} className="rounded-full bg-[#f3edf9] px-2.5 py-1 text-[12px] text-[#5d3f77]">{word}</span>
        ))}
      </div>
      <p className="mt-3 text-[13.5px] leading-[1.75] text-[#281b44]">{hexagram.y}</p>
      {note ? <p className="mt-2 text-[12px] leading-[1.6] text-[#6a5c7a]">{note}</p> : null}
    </div>
  );
}

/**
 * Xem Kinh Dịch: nêu câu hỏi → gieo ba đồng xu sáu lần → xem quẻ.
 *
 * Quẻ được gieo phía server ngay lần bấm đầu tiên (khoá theo câu hỏi, máy và
 * ngày); mỗi lần bấm sau chỉ lật ra đúng ba đồng xu đã gieo cho hào kế tiếp.
 */
export function KinhDichFlow() {
  const [question, setQuestion] = useState("");
  const [cast, setCast] = useState<KinhDichCast | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [tossing, setTossing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [reading, setReading] = useState<Interpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);
  const [error, setError] = useState("");
  /** Lỗi của ô câu hỏi, hiện ngay dưới ô — tách khỏi `error` là lỗi máy chủ (quy tắc form chung, form-field.tsx). */
  const [questionError, setQuestionError] = useState("");
  const [payload, setPayload] = useState<Record<string, string> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  useRelatedTools(showResult ? "kinh-dich" : null);

  async function loadReading(body: Record<string, string>) {
    setReadingLoading(true);
    try {
      const response = await fetch("/api/kinh-dich/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      setReading(response.ok ? data.interpretation : null);
      track(response.ok && data.interpretation?.source === "ai" ? "kinh_dich_interpret_complete" : "kinh_dich_interpret_fail");
    } catch {
      setReading(null);
      track("kinh_dich_interpret_fail");
    } finally {
      setReadingLoading(false);
    }
  }

  function reveal(next: number) {
    if (reduced) {
      setRevealed(next);
      return;
    }
    setTossing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRevealed(next);
      setTossing(false);
    }, TOSS_MS + 100);
  }

  async function toss() {
    if (tossing || loading) return;
    if (cast) return reveal(revealed + 1);
    const check = checkQuestion(question);
    if (!check.ok) {
      setQuestionError(check.error);
      document.getElementById("kinh-dich-question")?.focus();
      return;
    }
    setQuestionError("");
    setError("");
    setLoading(true);
    track("kinh_dich_submit");
    const body = { question: question.trim(), device: deviceSeed(), day: new Date().toISOString().slice(0, 10) };
    try {
      const response = await fetch("/api/kinh-dich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chưa gieo được quẻ.");
      setCast(data.cast);
      setPayload(body);
      reveal(1);
    } catch (err) {
      setError((err as Error).message);
      track("kinh_dich_error");
    } finally {
      setLoading(false);
    }
  }

  function openResult() {
    if (!cast || !payload) return;
    setShowResult(true);
    setReading(null);
    track("kinh_dich_result_view");
    track("experience_complete", { method: "kinh-dich" });
    window.scrollTo({ top: 0, behavior: "auto" });
    void loadReading(payload);
  }

  function restart() {
    track("kinh_dich_restart");
    setCast(null);
    setRevealed(0);
    setShowResult(false);
    setReading(null);
    setPayload(null);
    setQuestion("");
    setError("");
    setQuestionError("");
  }

  if (!showResult || !cast) {
    const last = cast && revealed ? cast.tosses[revealed - 1] : null;
    const lines = Array.from({ length: 6 }, (_, i) => (cast && i < revealed ? cast.lines[i] : null));
    return (
      <div className="flow-body is-configuring">
        <div className="tuvi-form tarot-setup-panel">
          <FormIntro>
            Nghĩ rõ một việc đang bận lòng rồi viết thành một câu hỏi mở. Mỗi
            câu hỏi trong ngày chỉ ứng một quẻ.
          </FormIntro>

          <label className="mt-2 block">
            Bạn muốn hỏi điều gì?
            <Textarea
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setQuestionError("");
                // Đổi câu hỏi giữa chừng thì gieo lại từ đầu cho câu mới.
                if (cast) {
                  setCast(null);
                  setRevealed(0);
                }
              }}
              maxLength={300}
              placeholder="Việc gì đang khiến bạn phân vân?"
              className={`${TEXTAREA} mt-2 ${questionError ? "border-[#c4566a]!" : ""}`}
              id="kinh-dich-question"
              aria-invalid={questionError ? true : undefined}
              aria-describedby={questionError ? "kinh-dich-question-error" : undefined}
            />
            {questionError ? <FieldMessage id="kinh-dich-question-error">{questionError}</FieldMessage> : null}
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
                    setCast(null);
                    setRevealed(0);
                    document.getElementById("kinh-dich-question")?.focus();
                  }}
                >
                  <span>{q}</span>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <div className="mt-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-5">
            <div className="flex items-center gap-2.5 text-[#5d3f77]">
              <Coins size={19} strokeWidth={1.5} aria-hidden="true" />
              <strong className="text-[15px] font-medium">Gieo ba đồng xu, sáu lần</strong>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.75] text-[#6b6287]">
              Mỗi lần gieo cho ra một hào, dựng từ dưới lên. Ngửa tính 3, sấp
              tính 2; tổng 6 hoặc 9 là hào động.
            </p>

            <div className="mt-4 grid items-center gap-6 rounded-xl bg-[#faf7fd] px-4 py-5 sm:grid-cols-[1fr_auto]">
              <div className="flex justify-center gap-5">
                {[0, 1, 2].map((c) => (
                  <Coin key={c} face={last && !tossing ? last.coins[c] : null} spin={tossing} delay={c * 0.06} />
                ))}
              </div>
              <div className="flex justify-center sm:pr-4">
                <HexagramLines lines={lines} />
              </div>
            </div>

            <p aria-live="polite" className="mt-3 min-h-6 text-center text-[13px] text-[#5b5276]">
              {last && !tossing
                ? `Lần ${revealed}: ${last.coins.filter((f) => f === "ngửa").length} ngửa, ${last.coins.filter((f) => f === "sấp").length} sấp = ${last.value} · ${tossMeaning[last.value]}`
                : ""}
            </p>

            {revealed === 6 && !tossing ? (
              <Button className="tuvi-submit" onClick={openResult} type="button">
                Xem quẻ <ArrowRight size={18} />
              </Button>
            ) : (
              <Button className="tuvi-submit" onClick={toss} disabled={tossing || loading} type="button">
                {loading || tossing ? <LoaderCircle className="spin" size={18} /> : null}
                {loading ? "Đang gieo…" : tossing ? "Đang gieo…" : `Gieo lần ${revealed + 1}`}
                {loading || tossing ? null : <ArrowRight size={18} />}
              </Button>
            )}
          </div>

          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
            Câu hỏi chỉ dùng để gieo quẻ và luận giải, không lưu lại trên máy chủ.
          </p>
        </div>

        <section className="tarot-introduction" aria-label="Tìm hiểu về Kinh Dịch">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
              <section>
                <h2>Kinh Dịch là gì?</h2>
                <p>
                  Một bộ sách cổ của phương Đông, dùng 64 quẻ để mô tả những
                  thế của sự việc: lúc khởi đầu, lúc thịnh, lúc vướng, lúc
                  chuyển. Mỗi quẻ gồm sáu hào âm hoặc dương, ghép từ hai quẻ
                  đơn như Trời, Đất, Nước, Lửa.
                </p>
              </section>
              <section>
                <h2>Gieo quẻ để làm gì?</h2>
                <p>
                  Không phải để biết trước tương lai. Quẻ cho bạn một khung
                  nhìn về tình thế đang có, và hào động cho thấy chỗ nào đang
                  chuyển. Soi khung đó vào việc của mình giúp bạn nghĩ rõ hơn.
                </p>
              </section>
            </div>
            <section className="tarot-introduction-steps">
              <h2>Gieo quẻ gồm những bước nào?</h2>
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
          <h3>Không có quẻ xấu tuyệt đối</h3>
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
                <h4>{["Mỗi ngày một quẻ", "Quẻ nói thế, không nói người", "Để chiêm nghiệm"][i]}</h4>
                <p>{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { primary, nuclear, changed } = cast;
  const changedLines = cast.lines.map((l) => ({ yang: l.moving ? !l.yang : l.yang, moving: false }));
  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">KINH DỊCH</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">
            Quẻ {primary.tenDayDu}
          </h2>
          <p className="mt-1 text-[13px] text-[#5b5276]">
            {cast.movingLines.length
              ? `${cast.movingLines.length} hào động, biến sang quẻ ${changed?.tenDayDu}`
              : "Không có hào động, quẻ đang tĩnh"}
          </p>
        </div>
        <Button variant="outline" onClick={restart} type="button">
          <RotateCcw size={15} /> Hỏi việc khác
        </Button>
      </div>

      <div className={`mt-6 grid gap-4 ${changed ? "lg:grid-cols-2" : ""}`}>
        <HexagramCard label="Quẻ chủ · tình thế hiện tại" hexagram={primary} lines={cast.lines} />
        {changed ? (
          <HexagramCard label="Quẻ biến · hướng việc chuyển tới" hexagram={changed} lines={changedLines} />
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="rounded-2xl border border-[#e0d5f0] bg-[#f6f0fd]/70 p-4">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Quẻ hỗ · diễn biến bên trong</p>
          <div className="mt-3 flex items-center gap-4">
            <HexagramLines size="sm" lines={nuclear.lines.map((yang) => ({ yang, moving: false }))} />
            <div>
              <p className="font-[family-name:var(--font-serif-app)] text-[19px] leading-tight text-[#3e357e]">
                {nuclear.chu} · {nuclear.ten}
              </p>
              <p className="mt-1 text-[12px] text-[#6a5c7a]">{nuclear.tenDayDu}</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-[1.7] text-[#281b44]">{nuclear.y}</p>
        </div>
        <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Hào động</p>
          {cast.movingLines.length ? (
            <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
              {cast.movingLines.map((n) => (
                <li key={n} className="text-[13px] leading-[1.7] text-[#281b44]">
                  <span className="text-[#b08a45]">{cast.lines[n - 1].yang ? "○" : "×"}</span> {linePositions[n - 1]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] leading-[1.7] text-[#281b44]">
              Sáu hào đều tĩnh. Tình thế đang ổn định; đọc quẻ chủ là đủ.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-[1.75] text-[#6b6287]">
        Câu bạn hỏi: <em className="not-italic text-[#3e357e]">“{cast.question}”</em>
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
            Phần luận giải AI hiện chưa khả dụng. Ý chính của quẻ chủ, quẻ hỗ
            và quẻ biến phía trên vẫn đầy đủ.
          </p>
          {payload ? (
            <Button variant="outline" className="mt-3" onClick={() => { track("kinh_dich_interpret_retry"); void loadReading(payload); }}>
              <RotateCcw size={15} /> Thử luận giải lại
            </Button>
          ) : null}
        </div>
      )}

      <p className="mt-6 text-xs leading-[1.8] text-[#6a5c7a]">
        Tên quẻ và cấu trúc hào theo Kinh Dịch; phần ý chính là lời diễn giải
        của Lunara, không phải nguyên văn quái từ. Kinh Dịch là nội dung chiêm
        nghiệm, không phải lời tiên đoán.
      </p>
    </div>
  );
}
