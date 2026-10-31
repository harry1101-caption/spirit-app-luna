"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CalendarClock,
  Clock3,
  Heart,
  BriefcaseBusiness,
  UserRound,
  VenusAndMars,
  Leaf,
  Eye,
  Moon,
  LockKeyhole,
  Pencil,
  Bookmark,
  Check,
  ChevronLeft,
  Layers,
  LoaderCircle,
  RotateCcw,
  Scale,
  Share2,
  Sparkles,
  Sun,
  Target,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RelatedTools, useRelatedTools } from "@/components/related-tools";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  cards,
  dimensions,
  drawCards,
  drawOrientations,
  questions,
  scoreAnswers,
  today,
  zodiac,
  zodiacFromDate,
  zodiacSymbols,
  type InterpretationInput,
  type Report,
} from "@/lib/engine";
import { track } from "@/lib/analytics";
import { TuViChartView } from "@/components/tuvi-chart";
import { ReadingSetup } from "@/components/reading-setup";
import { IconField, IconSelect as TuViSelect } from "@/components/form-field";
import { tuViTimeSlots, type TuViChart, type TuViInput } from "@/lib/tuvi";
import { vi } from "date-fns/locale";
import { lenormandCards } from "@/lib/lenormand";
const tarotQuestionSuggestions: Record<string, string[]> = {
  "Tình cảm": [
    "Tôi cần lưu ý điều gì trong chuyện tình cảm của mình trong 3 tháng tới?",
    "Tôi có thể làm gì để cải thiện sự kết nối trong mối quan hệ hiện tại trong tháng tới?",
    "Tôi cần hiểu điều gì về nhu cầu tình cảm của bản thân trong giai đoạn này?",
  ],
  "Công việc & học tập": [
    "Tôi cần cân nhắc điều gì về định hướng công việc hoặc học tập trong 3 tháng tới?",
    "Tôi có thể phát huy thế mạnh nào để tiến bộ trong tháng tới?",
    "Tôi nên chuẩn bị điều gì trước một thay đổi quan trọng trong công việc hoặc học tập?",
  ],
  "Tài chính": [
    "Tôi cần nhìn nhận điều gì về cách quản lý tài chính của mình trong 3 tháng tới?",
    "Tôi nên ưu tiên điều gì để xây dựng cảm giác an toàn tài chính hơn?",
    "Tôi cần cân nhắc điều gì trước một quyết định chi tiêu hoặc đầu tư quan trọng?",
  ],
  "Gia đình & quan hệ": [
    "Tôi cần hiểu điều gì để kết nối tốt hơn với gia đình và những người xung quanh?",
    "Tôi có thể làm gì để cải thiện một mối quan hệ đang khiến mình bận lòng?",
    "Tôi cần đặt ranh giới nào trong các mối quan hệ ở giai đoạn này?",
  ],
  "Bản thân": [
    "Tôi cần hiểu điều gì về bản thân trong giai đoạn này?",
    "Tôi có thể phát huy điểm mạnh nào để trở nên tự tin hơn?",
    "Tôi cần nhìn nhận lại điều gì để sống đúng với mong muốn của mình hơn?",
  ],
  "Tinh thần": [
    "Tôi cần làm gì để chăm sóc đời sống tinh thần của mình tốt hơn trong tháng tới?",
    "Tôi có thể thay đổi thói quen nào để cảm thấy cân bằng hơn trong 3 tháng tới?",
    "Tôi cần lắng nghe cảm xúc nào đang bị mình bỏ quên trong giai đoạn này?",
  ],
  "Quyết định": [
    "Tôi cần cân nhắc điều gì trước quyết định đang khiến mình phân vân?",
    "Điều gì đang ảnh hưởng nhiều nhất đến cách tôi đưa ra lựa chọn lúc này?",
    "Tôi cần thêm góc nhìn nào để chọn hướng đi phù hợp với mình hơn?",
  ],
  "Tổng quan": [
    "Tôi nên ưu tiên điều gì để cuộc sống nhẹ nhàng hơn trong tháng tới?",
    "Tôi cần cân nhắc điều gì trước những thay đổi trong cuộc sống trong 3 tháng tới?",
    "Tôi có thể chủ động làm gì để xây dựng nhịp sống phù hợp hơn trong giai đoạn này?",
  ],
};

const tarotTopics = [
  { label: "Tình cảm", icon: Heart },
  { label: "Công việc & học tập", icon: BriefcaseBusiness },
  { label: "Tài chính", icon: Banknote },
  { label: "Gia đình & quan hệ", icon: UsersRound },
  { label: "Bản thân", icon: Leaf },
  { label: "Tinh thần", icon: Moon },
  { label: "Quyết định", icon: Scale },
  { label: "Tổng quan", icon: Sun },
] as const;

function normalizeTarotTopic(topic?: string) {
  if (topic === "Tình yêu") return "Tình cảm";
  if (topic === "Công việc") return "Công việc & học tập";
  if (topic === "Bản thân & tinh thần") return "Bản thân";
  if (topic === "Cuộc sống") return "Tổng quan";
  return topic && topic in tarotQuestionSuggestions ? topic : "Tình cảm";
}

function TuViBirthDate({ value, onChange, currentYear }: { value: string; onChange: (date: string) => void; currentYear: number | null }) {
  const [open, setOpen] = useState(false);
  const [year, month, day] = value.split("-").map(Number);
  const selected = value ? new Date(year, month - 1, day) : undefined;
  const today = currentYear ? new Date() : undefined;
  return <div className="tuvi-birth-date">
    <label id="tuvi-birth-date-label">Ngày sinh</label>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger type="button" className="tuvi-date-trigger" aria-labelledby="tuvi-birth-date-label" aria-required="true">
        <CalendarDays className="tuvi-control-icon" size={17} aria-hidden="true" />
        <span className={selected ? "" : "is-placeholder"}>{selected ? `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}` : "Chọn ngày sinh"}</span>
      </PopoverTrigger>
      <PopoverContent className="tuvi-calendar-popover" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
            setOpen(false);
          }}
          locale={vi}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0, 1)}
          endMonth={today}
          disabled={{ after: today ?? new Date(1900, 0, 1) }}
          defaultMonth={selected ?? new Date((currentYear ?? 2000) - 25, 0, 1)}
        />
      </PopoverContent>
    </Popover>
  </div>;
}

export function TuViFlow() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [chart, setChart] = useState<TuViChart | null>(null);
  const [formValues, setFormValues] = useState<TuViInput | null>(null);
  const [showDecadeFortune, setShowDecadeFortune] = useState(true);
  const [showAnnualFortune, setShowAnnualFortune] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Current year belongs to the visiting session, not prerender time.
    setCurrentYear(new Date().getFullYear());
  }, []);

  async function createChart(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!birthDate) {
      setError("Hãy chọn ngày sinh dương lịch.");
      return;
    }
    const values = new FormData(event.currentTarget);
    const input: TuViInput = {
      fullName: String(values.get("fullName") || "").trim(),
      birthDate,
      birthTime: String(values.get("birthTime") || ""),
      gender: String(values.get("gender") || "") as TuViInput["gender"],
      readingYear: Number(values.get("readingYear")),
      showDecadeFortune,
      showAnnualFortune,
      occupation: String(values.get("occupation") || "") as TuViInput["occupation"],
      relationship: String(values.get("relationship") || "") as TuViInput["relationship"],
    };
    setFormValues(input);
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/tuvi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể lập lá số lúc này.");
      setChart(data as TuViChart);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lập lá số lúc này.");
    } finally {
      setLoading(false);
    }
  }

  if (chart?.formatVersion === 2) return <TuViChartView chart={chart} onEdit={() => setChart(null)} />;
  return (
    <section className="experience-page experience-page-tarot tuvi-page pt-[35px]! max-[1250px]:pt-[45px]! min-[1600px]:pt-[45px]!" aria-labelledby="tuvi-title">
      <div className="tarot-page-background left-1/2! right-auto! w-screen! -translate-x-1/2!" aria-hidden="true" />
      <div className="page-heading tarot-title-only">
        <h1 id="tuvi-title">Hiểu mình qua những vì sao</h1>
      </div>
      <div className="experience-surface">
      <div className="flow-body tuvi-flow is-configuring">
      <form className="tuvi-form tarot-setup-panel" onSubmit={createChart}>
        <label>Họ và tên<span className="tuvi-input-wrap"><UserRound className="tuvi-control-icon" size={17} aria-hidden="true" /><Input required name="fullName" placeholder="Nguyễn Văn An" defaultValue={formValues?.fullName} className="tuvi-input-with-icon" /></span></label>
        <div className="tuvi-grid">
          <TuViBirthDate value={birthDate} onChange={(date) => { setBirthDate(date); setError(""); }} currentYear={currentYear} />
          <label>Giờ sinh
            <TuViSelect required name="birthTime" placeholder="Chọn khung giờ" options={tuViTimeSlots} defaultValue={formValues?.birthTime} icon={Clock3} />
          </label>
        </div>
        <p className="tuvi-note">Ngày sinh theo dương lịch · Giờ sinh tính theo điểm giữa khung 30 phút.</p>
        <div className="tuvi-grid">
          <label>Giới tính<TuViSelect required name="gender" placeholder="Chọn giới tính" options={["Nam", "Nữ"]} defaultValue={formValues?.gender} icon={VenusAndMars} /></label>
          <label>Năm xem<TuViSelect key={currentYear ?? "loading"} name="readingYear" placeholder={currentYear ? String(currentYear) : "Đang tải năm…"} defaultValue={formValues?.readingYear ? String(formValues.readingYear) : currentYear ? String(currentYear) : undefined} options={currentYear ? [currentYear, currentYear + 1, currentYear + 2].map(String) : []} icon={CalendarClock} /></label>
        </div>
        <div className="tuvi-grid">
          <label>Công việc<TuViSelect required name="occupation" placeholder="Chọn hiện tại" options={["Đi làm", "Đi học"]} defaultValue={formValues?.occupation} icon={BriefcaseBusiness} /></label>
          <label>Quan hệ<TuViSelect required name="relationship" placeholder="Chọn tình trạng" options={["Độc thân", "Đang hẹn hò", "Đã kết hôn"]} defaultValue={formValues?.relationship} icon={Heart} /></label>
        </div>
        <div className="tuvi-fortune-options" role="group" aria-labelledby="tuvi-fortune-label">
          <p id="tuvi-fortune-label">Tùy chọn hiển thị vận hạn</p>
          <div className="tuvi-fortune-row">
            <div className="tuvi-fortune-option"><Checkbox id="tuvi-decade-fortune" name="showDecadeFortune" checked={showDecadeFortune} onCheckedChange={setShowDecadeFortune} /><label htmlFor="tuvi-decade-fortune">An lưu đại vận</label></div>
            <div className="tuvi-fortune-option"><Checkbox id="tuvi-annual-fortune" name="showAnnualFortune" checked={showAnnualFortune} onCheckedChange={setShowAnnualFortune} /><label htmlFor="tuvi-annual-fortune">An lưu tiểu vận</label></div>
          </div>
        </div>
        <Button className="tuvi-submit" type="submit" disabled={loading || !currentYear}>{loading ? <LoaderCircle className="spin" size={18} /> : null}{loading ? "Đang lập lá số…" : "Lập lá số"}{!loading ? <ArrowRight size={18} /> : null}</Button>
        {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}
        <p className="tuvi-provider-note">Ngày, giờ sinh, giới tính và năm lập được gửi tới Huyền Minh để an sao. Họ tên và thông tin cá nhân khác không gửi tới dịch vụ này.</p>
      </form>

      <section className="tarot-introduction" aria-label="Tìm hiểu về Tử Vi">
        <div className="tarot-introduction-body">
          <div className="tarot-introduction-context">
            <section>
              <h2>Tử Vi là gì?</h2>
              <p>
                Từ ngày giờ sinh, Tử Vi Đẩu Số dựng một lá số chia thành mười
                hai cung — Mệnh, Tài Bạch, Quan Lộc, Phu Thê, Phúc Đức… Mỗi
                cung soi một mảng của đời sống. Hơn một trăm ngôi sao được an
                vào các cung, mỗi sao mạnh yếu khác nhau tuỳ chỗ nó đóng.
              </p>
            </section>
            <section>
              <h2>Xem để làm gì?</h2>
              <p>
                Để nhìn rõ hơn khuynh hướng của chính mình: đâu là thế mạnh tự
                nhiên, đâu là chỗ hay vướng, giai đoạn nào thuận và giai đoạn
                nào nên giữ sức. Lá số không nói trước điều sẽ xảy ra — nó mô
                tả chất liệu bạn đang có và gợi ý cách dùng chất liệu ấy.
              </p>
            </section>
          </div>
          <section className="tarot-introduction-steps">
            <h2>Lá số được lập thế nào?</h2>
            <ol>
              <li>
                <strong>Nhập ngày giờ sinh</strong>
                <span>Theo dương lịch, giờ càng chính xác càng tốt.</span>
              </li>
              <li>
                <strong>An sao vào cung</strong>
                <span>Chính tinh và phụ tinh được xếp vào mười hai cung.</span>
              </li>
              <li>
                <strong>Đọc theo lĩnh vực</strong>
                <span>Mở cung ứng với điều bạn muốn hiểu rõ.</span>
              </li>
              <li>
                <strong>Xét vận hạn</strong>
                <span>Đại hạn mười năm và tiểu hạn từng năm.</span>
              </li>
            </ol>
          </section>
        </div>
      </section>

      <div className="tarot-afterword">
        <h3>Lá số mở ra góc nhìn, không khép lại lựa chọn</h3>
      </div>
      <div className="tarot-principles">
        <div>
          <span><Layers size={28} strokeWidth={1.2} /></span>
          <div>
            <h4>Đọc theo cung</h4>
            <p>Mỗi cung soi một lĩnh vực, không đánh giá tốt xấu tổng thể.</p>
          </div>
        </div>
        <div>
          <span><Clock3 size={28} strokeWidth={1.2} /></span>
          <div>
            <h4>Giờ sinh rất quan trọng</h4>
            <p>Lệch một khung giờ có thể đổi cung Mệnh và cả cách luận.</p>
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
      </div>
    </section>
  );
}
export function TarotFlow({
  onSubmit,
  loading,
  previous,
  initialTopic,
  initialQuestion,
}: {
  previous?: Report;
  /** Chủ đề chọn sẵn khi vào từ khối "Chọn một chủ đề để bắt đầu". */
  initialTopic?: string;
  initialQuestion?: string;
  onSubmit: (input: InterpretationInput) => void;
  loading: boolean;
}) {
  // `previous` (lượt trải bài cũ) được ưu tiên hơn chủ đề gợi ý, vì lúc xem
  // sâu hơn thì phải bám đúng lượt trước chứ không phải điểm vào ban đầu.
  const [topic, setTopic] = useState(() =>
    normalizeTarotTopic(previous?.subtitle ?? initialTopic),
  );
  const [question, setQuestion] = useState(previous?.context || initialQuestion || "");
  const [deepQuestions, setDeepQuestions] = useState(() => previous?.followUpQuestions || ["", "", "", "", ""]);
  const count = 3;
  const [deck, setDeck] = useState<number[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [useReversed, setUseReversed] = useState(false);
  const [orientations, setOrientations] = useState<boolean[]>([]);
  const [revealOpen, setRevealOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Shuffle only in the browser; Next.js prerender must stay deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck(drawCards(9));
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    };
  }, []);
  function shuffleDeck() {
    if (isShuffling || selectedSlots.length > 0) return;
    if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    setIsShuffling(true);
    shuffleTimerRef.current = setTimeout(() => {
      setDeck(drawCards(9));
      shuffleTimerRef.current = setTimeout(() => {
        setIsShuffling(false);
        shuffleTimerRef.current = null;
      }, 640);
    }, 600);
  }
  function restartSetup() {
    setStarted(false);
    setSelectedSlots([]);
    setDrawn([]);
    setRevealOpen(false);
    setOrientations([]);
    setDeck(drawCards(9));
  }
  const reversedOption = (
    <div className="reversed-option">
      <label htmlFor="tarot-reversed">
        Dùng lá ngược
        <small>
          {previous
            ? "Tùy chọn. Lá ngược gợi điều cần nhìn vào bên trong, không đồng nghĩa với điềm xấu."
            : "Tùy chọn · Không đồng nghĩa với điềm xấu."}
        </small>
      </label>
      <Switch
        id="tarot-reversed"
        checked={useReversed}
        onCheckedChange={setUseReversed}
      />
    </div>
  );
  return (
    <div
      className={`flow-body tarot-reading-flow ${started ? "has-started" : "is-configuring"}`}
    >
      {!started ? (
        <div className="tarot-setup-panel">
          {previous ? <div className="tarot-deep-form">
            <p className="tarot-deep-intro">Chỉnh 5 câu hỏi theo điều bạn muốn hiểu rõ hơn. Cả 3 lá mới sẽ được dùng để trả lời từng câu.</p>
            {deepQuestions.map((value, index) => <div className="tarot-deep-field" key={index}>
              <label htmlFor={`deep-question-${index}`}>Câu hỏi {index + 1}</label>
              <Textarea id={`deep-question-${index}`} value={value} maxLength={300} minLength={5} required onChange={event => setDeepQuestions(current => current.map((item, i) => i === index ? event.target.value : item))} />
            </div>)}
          </div> : null}
          {previous ? (
          <div className="tarot-setup-actions is-deep-actions">
          {reversedOption}
          <div className="tarot-begin-row">
            <Button
              className="tarot-begin-button"
              disabled={deepQuestions.some(q => q.trim().length < 5)}
              onClick={() => setStarted(true)}
            >
              Rút 3 lá để đào sâu
              <ArrowRight size={18} />
            </Button>
            <span className="tarot-handwritten">
              Hãy giữ tâm trí
              <br />
              rộng mở nhé <Heart size={13} />
            </span>
          </div>
          </div>
          ) : (
          <ReadingSetup
            fieldLabel="Điều bạn muốn lắng nghe"
            topics={tarotTopics}
            topicColumns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            topic={topic}
            onTopicChange={(label) => {
              setTopic(label);
              track("tarot_topic_select", { topic: label });
            }}
            questionId="tarot-question"
            question={question}
            onQuestionChange={setQuestion}
            placeholder="Tôi + muốn hiểu điều gì + về vấn đề nào + trong khoảng thời gian nào."
            suggestionsLabel={`Thử một câu hỏi về ${topic.toLowerCase()}`}
            suggestions={tarotQuestionSuggestions[topic]}
            option={reversedOption}
            submitLabel="Bắt đầu trải bài"
            submitDisabled={!question.trim()}
            onSubmit={() => setStarted(true)}
          />
          )}
          {previous ? (
            <p className="tarot-private-note">
              <LockKeyhole size={14} strokeWidth={1.4} />
              Riêng tư · Chỉ lưu khi bạn chọn “Lưu kết quả”
            </p>
          ) : null}
        </div>
      ) : (
        <div className="tarot-selection-panel">
          <div className="tarot-selection-summary">
            <span>
              <Heart size={15} />
              {topic}
            </span>
            <span>{count} lá bài</span>
            <span>{useReversed ? "Có lá ngược" : "Chỉ lá xuôi"}</span>
            <button disabled={loading} onClick={restartSetup}>
              <Pencil size={13} />
              Chọn lại
            </button>
          </div>
          {!drawn.length ? (
            <div className="deck-area">
              <div className="deck-instruction">
                <span>Lắng nghe trực giác của bạn</span>
                <p>Chọn {count} lá bài mà bạn cảm thấy được kết nối.</p>
                <small>
                  Đã chọn {selectedSlots.length} / {count} lá
                </small>
              </div>
              <div
                className={`tarot-fan ${isShuffling ? "is-shuffling" : ""}`}
                aria-busy={isShuffling}
              >
                {deck.map((id, i) => (
                  <button
                    key={`tarot-slot-${i}`}
                    className={
                      selectedSlots.includes(i) ? "fan-card chosen" : "fan-card"
                    }
                    style={{ "--fan-index": i } as CSSProperties}
                    disabled={isShuffling || selectedSlots.includes(i)}
                    aria-label={`Chọn lá bài ${i + 1}`}
                    onClick={() => {
                      const next = [...selectedSlots, i];
                      setSelectedSlots(next);
                      if (next.length === count) {
                        setDrawn(next.map((slot) => deck[slot]));
                        setOrientations(
                          useReversed
                            ? drawOrientations(count)
                            : Array(count).fill(false),
                        );
                        setRevealOpen(true);
                      }
                    }}
                  >
                    <Image
                      src="/images/tarot-back.webp"
                      alt=""
                      width={140}
                      height={211}
                    />
                    {selectedSlots.includes(i) ? (
                      <span>
                        <Check size={16} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              <button
                className={`skip-button tarot-shuffle-button ${isShuffling ? "is-shuffling" : ""}`}
                disabled={isShuffling || selectedSlots.length > 0}
                onClick={shuffleDeck}
              >
                <RotateCcw size={15} />
                {isShuffling ? "Đang xào bài..." : "Trộn lại bộ bài"}
              </button>
            </div>
          ) : (
            <div className="deck-instruction">
              <span>Ba lá bài của bạn đã được mở</span>
              <p>Giữ nguyên bộ bài để thử lại nếu kết nối bị gián đoạn.</p>
              <Button disabled={loading} onClick={() => setRevealOpen(true)}>Xem lại và diễn giải</Button>
            </div>

          )}
          <p className="tarot-attribution">
            Bộ Rider–Waite–Smith 78 lá · Minh họa: Pamela Colman Smith. Chín lá
            trước mặt được lấy ngẫu nhiên từ bộ bài đã xáo.
            <br />
            <a href="/images/tarot/CREDITS.md" target="_blank" rel="noreferrer">
              Nguồn ảnh & ghi công
            </a>
          </p>
        </div>
      )}
      {revealOpen && drawn.length === 3 ? <AutomaticTarotReveal
        input={{type: "tarot", topic, question, cards: drawn, reversed: orientations,
          ...(previous ? {deepQuestions: deepQuestions.map(q => q.trim()), previousReading: {
            question: previous.context || "", summary: previous.summary, sections: previous.sections,
            cards: previous.cards || [], reversed: previous.reversed || [false, false, false],
          }} : {}),
        }}
        onSubmit={onSubmit}
        onFinished={() => setRevealOpen(false)}
      /> : null}
      {!previous && !started ? (
        <section className="tarot-introduction" aria-label="Hiểu Tarot trước khi trải bài">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
            <section aria-labelledby="tarot-meaning-title">
              <h2 id="tarot-meaning-title">Tarot là gì?</h2>
              <p>Tarot dùng hình ảnh và biểu tượng trên lá bài để gợi mở một góc nhìn về điều bạn đang trải qua. Mỗi lá bài là lời mời nhìn lại cảm xúc, hoàn cảnh và những lựa chọn trước mắt; không quyết định tương lai thay bạn.</p>
            </section>
            <section aria-labelledby="tarot-when-title">
              <h2 id="tarot-when-title">Khi nào nên tìm đến Tarot?</h2>
              <p>Khi bạn đang phân vân trước một lựa chọn, muốn hiểu một mối quan hệ, hoặc cần một khoảng lặng để lắng nghe mình rõ hơn. Bạn không cần đợi đến khi có chuyện lớn mới bắt đầu.</p>
            </section>
            </div>
            <section className="tarot-introduction-steps" aria-labelledby="tarot-how-title">
              <h2 id="tarot-how-title">Trải bài sao cho phù hợp?</h2>
              <ol>
                <li><strong>Chậm lại</strong><span>Nhận diện điều đang khiến bạn bận lòng.</span></li>
                <li><strong>Mở một câu hỏi</strong><span>Tập trung vào điều bạn muốn hiểu hoặc có thể chủ động.</span></li>
                <li><strong>Chọn lá</strong><span>Để trực giác dẫn bạn đến ba lá bài.</span></li>
                <li><strong>Chiêm nghiệm</strong><span>Giữ lại góc nhìn hữu ích và tự chọn bước tiếp theo.</span></li>
              </ol>
            </section>
          </div>
        </section>
      ) : null}
      <div className="tarot-afterword">
        <h3>Lắng nghe trực giác của bạn</h3>
        {started ? <p>Chậm lại một chút, để những biểu tượng mở ra một góc nhìn mới.</p> : null}
      </div>
      <div className="tarot-principles">
        {[
          {
            Icon: Leaf,
            title: "Không có đúng sai",
            text: "Mỗi lá bài là một góc nhìn, không phải một phán xét.",
          },
          {
            Icon: Eye,
            title: "Kết nối với bản thân",
            text: "Những câu hỏi chân thành dẫn đến câu trả lời sâu sắc.",
          },
          {
            Icon: Moon,
            title: "Mỗi lần trải bài là một hành trình",
            text: "Hãy để trực giác dẫn lối bạn.",
          },
        ].map(({ Icon, title, text }) => (
          <div key={title}>
            <span>
              <Icon size={28} strokeWidth={1.2} />
            </span>
            <div>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function AutomaticTarotReveal({input, onSubmit, onFinished}: {
  input: InterpretationInput;
  onSubmit: (input: InterpretationInput) => void;
  onFinished: () => void;
}) {
  const snapshot = useRef({input, onSubmit, onFinished});
  const [revealed, setRevealed] = useState(0);
  const submitted = useRef(false);
  useEffect(() => {
    let active = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [0, 1, 2].map(index => window.setTimeout(() => {
      setRevealed(index + 1);
      track("tarot_card_reveal", {card: snapshot.current.input.cards![index]});
    }, reduced ? 0 : 450 + index * 550));
    timers.push(window.setTimeout(async () => {
      if (submitted.current) return;
      submitted.current = true;
      try { await snapshot.current.onSubmit(snapshot.current.input); }
      finally { if (active) snapshot.current.onFinished(); }
    }, reduced ? 150 : 2700));
    return () => { active = false; timers.forEach(window.clearTimeout); };
  }, []);
  return <Dialog open>
    <DialogContent className="luna-dialog tarot-auto-modal" showCloseButton={false} data-lenis-prevent>
      <DialogHeader>
        <DialogTitle>Những lá bài dành cho bạn</DialogTitle>
        <DialogDescription>Chậm lại một nhịp. Ba lá bài đang mở ra câu chuyện của bạn.</DialogDescription>
      </DialogHeader>
      <div className="tarot-auto-cards">
        {input.cards!.map((id, index) => <div key={id} className="tarot-auto-card">
          <div className={`tarot-auto-flip ${revealed > index ? "is-revealed" : ""}`}>
            <div className="tarot-auto-back"><Image src="/images/tarot-back.webp" alt="Mặt sau lá bài" width={240} height={410}/></div>
            <div className="tarot-auto-front"><Image className={input.reversed?.[index] ? "reversed-image" : ""} src={cards[id].image} alt={cards[id].vi} width={240} height={410}/></div>
          </div>
          <div className={`tarot-auto-caption ${revealed > index ? "is-visible" : ""}`}>
            {!input.deepQuestions ? <small>{["Quá khứ", "Hiện tại", "Tương lai"][index]}</small> : <small>Lá {index + 1}</small>}
            <strong>{cards[id].vi}</strong><span>{input.reversed?.[index] ? "Lá ngược" : "Lá xuôi"}</span>
          </div>
        </div>)}
      </div>
      <p className="tarot-auto-status" role="status" aria-live="polite"><LoaderCircle className="spin" size={17}/>{revealed === 3 ? "AI đang kết nối các lá bài với câu chuyện của bạn…" : "Đang mở những lá bài của bạn…"}</p>
    </DialogContent>
  </Dialog>;
}

export function DailyFlow({
  sign,
  onSubmit,
  error,
  loading,
}: {
  sign: string;
  onSubmit: (sign: string) => void;
  error?: string;
  loading: boolean;
}) {
  const [selected, setSelected] = useState(sign);
  const [birth, setBirth] = useState("");
  // today() gọi new Date(); chạy lúc prerender sẽ làm Next báo lỗi
  // blocking-prerender-current-time-client, nên chỉ lấy sau khi mount.
  const [maxDate, setMaxDate] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ngày hiện tại chỉ có ở client
    setMaxDate(today());
  }, []);
  return (
    <div className="flow-body daily-flow is-configuring">
      <form
        className="tuvi-form tarot-setup-panel"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(selected);
        }}
      >
        <p className="tuvi-note mb-1">
          Chọn cung hoàng đạo của bạn, hoặc nhập ngày sinh để hệ thống tự xác
          định cung. Đây là chiêm tinh phương Tây, không phải Tử Vi Việt Nam.
        </p>

        <label>Cung hoàng đạo</label>
        <div className="zodiac-grid">
          {zodiac.map((s, i) => (
            <button
              type="button"
              key={s}
              className={s === selected ? "selected" : ""}
              onClick={() => {
                setSelected(s);
                setBirth("");
              }}
            >
              <span>{zodiacSymbols[i]}</span>
              {s}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          Hoặc nhập ngày sinh
          <IconField
            icon={CalendarDays}
            type="date"
            name="birthDate"
            max={maxDate || undefined}
            value={birth}
            onChange={(e) => {
              setBirth(e.target.value);
              if (e.target.value) setSelected(zodiacFromDate(e.target.value));
            }}
          />
        </label>

        {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

        <Button className="tuvi-submit" type="submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={18} /> : null}
          {loading ? "Đang chuẩn bị lời nhắn…" : `Xem thông điệp cho ${selected}`}
          {loading ? null : <ArrowRight size={18} />}
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="inline align-[-2px] mr-1" />
          Ngày sinh chỉ dùng để xác định cung, không lưu lại trên máy chủ.
        </p>
      </form>

      <section className="tarot-introduction" aria-label="Tìm hiểu về Chiêm tinh">
        <div className="tarot-introduction-body">
          <div className="tarot-introduction-context">
            <section>
              <h2>Chiêm tinh là gì?</h2>
              <p>
                Chiêm tinh phương Tây chia vòng hoàng đạo thành mười hai cung.
                Cung của bạn được xác định theo vị trí Mặt Trời vào ngày sinh —
                đó là lý do chỉ cần ngày tháng, không cần giờ. Mỗi cung gắn với
                một nguyên tố và một nhịp năng lượng riêng.
              </p>
            </section>
            <section>
              <h2>Xem để làm gì?</h2>
              <p>
                Để có một lời nhắn gọn cho ngày hôm nay, đọc theo nhịp của cung
                bạn: nên dồn sức vào đâu, nên chậm lại ở đâu. Nội dung giữ
                nguyên suốt cả ngày, không đổi mỗi lần tải lại — để bạn đọc một
                lần rồi mang theo.
              </p>
            </section>
          </div>
          <section className="tarot-introduction-steps">
            <h2>Thông điệp được tạo thế nào?</h2>
            <ol>
              <li>
                <strong>Chọn cung</strong>
                <span>Bấm trực tiếp, hoặc nhập ngày sinh để tự xác định.</span>
              </li>
              <li>
                <strong>Gắn với ngày</strong>
                <span>Mỗi cung mỗi ngày là một lời nhắn riêng.</span>
              </li>
              <li>
                <strong>Đọc bốn mục</strong>
                <span>Tình cảm, công việc, năng lượng và một chút cảm hứng.</span>
              </li>
              <li>
                <strong>Giữ lại nếu hợp</strong>
                <span>Lưu vào bộ sưu tập để đọc lại sau.</span>
              </li>
            </ol>
          </section>
        </div>
      </section>

      <div className="tarot-afterword">
        <h3>Một lời nhắn cho hôm nay, không phải lời tiên đoán</h3>
      </div>
      <div className="tarot-principles">
        <div>
          <span><Sun size={28} strokeWidth={1.2} /></span>
          <div>
            <h4>Theo cung Mặt Trời</h4>
            <p>Chỉ cần ngày tháng sinh, không cần giờ hay nơi sinh.</p>
          </div>
        </div>
        <div>
          <span><Moon size={28} strokeWidth={1.2} /></span>
          <div>
            <h4>Không phải Tử Vi</h4>
            <p>Đây là chiêm tinh phương Tây, khác hệ với Tử Vi Việt Nam.</p>
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
export function PersonalityFlow({
  onSubmit,
  loading,
}: {
  onSubmit: (scores: number[]) => void;
  loading: boolean;
}) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const value = answers[index];
  return (
    <div className="flow-body quiz-flow">
      <div className="quiz-progress">
        <span>
          Câu {index + 1} / {questions.length}
        </span>
        <span>{Math.round((index / questions.length) * 100)}%</span>
      </div>
      <Progress value={(index / questions.length) * 100} />
      <h3>{questions[index]}</h3>
      <div className="answer-options">
        {[
          "Rất không giống tôi",
          "Không giống tôi lắm",
          "Tùy tình huống",
          "Khá giống tôi",
          "Rất giống tôi",
        ].map((label, i) => (
          <button
            key={label}
            className={value === i + 1 ? "selected" : ""}
            onClick={() => {
              setAnswers((v) => {
                const next = [...v];
                next[index] = i + 1;
                return next;
              });
              track("personality_question_answer", { question: index + 1 });
            }}
          >
            <span>{i + 1}</span>
            {label}
            {value === i + 1 ? <Check size={17} /> : null}
          </button>
        ))}
      </div>
      <div className="quiz-navigation">
        <Button
          variant="outline"
          disabled={index === 0 || loading}
          onClick={() => setIndex((v) => v - 1)}
        >
          <ChevronLeft size={15} /> Trước
        </Button>
        <Button
          disabled={!value || loading}
          onClick={() =>
            index === questions.length - 1
              ? onSubmit(scoreAnswers(answers))
              : setIndex((v) => v + 1)
          }
        >
          {loading ? <LoaderCircle className="spin" size={17} /> : null}
          {index === questions.length - 1
            ? "Xem khám phá của tôi"
            : "Tiếp theo"}
          <ArrowRight size={15} />
        </Button>
      </div>
      <p className="gentle-note">
        Chọn theo cảm nhận gần đây của bạn. Câu trả lời chỉ dùng để tính kết
        quả, không được lưu.
      </p>
    </div>
  );
}
export function ReportView({
  report,
  saved,
  onSave,
  onShare,
  onRestart,
  onSubmit,
  loading,
}: {
  onSubmit: (input: InterpretationInput) => void;
  loading: boolean;
  report: Report;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onRestart: () => void;
}) {
  const [feedback, setFeedback] = useState(false);
  const [deepening, setDeepening] = useState(false);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogContentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [deepening]);

  // Hai loại này hiển thị thẳng trong trang, nên gợi ý đi ra ngoài thẻ.
  useRelatedTools(
    report.type === "daily" || report.type === "personality" ? report.type : null,
  );

  if (report.type === "daily") {
    return <DailyResultView report={report} saved={saved} onSave={onSave} onShare={onShare} onRestart={onRestart} />;
  }
  if (report.type === "lenormand") {
    return <Dialog open onOpenChange={open => { if (!open && !loading) onRestart(); }}>
      <DialogContent className="luna-dialog tarot-result-modal lenormand-result-modal" showCloseButton={!loading} data-lenis-prevent>
        <DialogHeader>
          <DialogTitle>Câu chuyện từ ba lá Lenormand</DialogTitle>
          <DialogDescription>{report.context || report.subtitle}</DialogDescription>
        </DialogHeader>
        <div className="report-body">
          <div className="lenormand-card-row lenormand-report-cards">
            {report.cards?.map((id, index) => {
              const card = lenormandCards[id];
              return card ? <article className="lenormand-card lenormand-card-face" key={`${id}-${index}`}>
                <small>{["Điểm khởi đầu", "Trọng tâm", "Điều cần lưu ý"][index]}</small>
                <span>{card[2]}</span><strong>{card[0]}</strong><small>{card[1]}</small>
              </article> : null;
            })}
          </div>
          <div className="report-content"><div className="report-summary">{report.summary}</div>
            {report.sections.map((section, index) => <section className="report-section" key={index}><h3>{section.title}</h3><p>{section.text}</p></section>)}
          </div>
          <div className="report-bottom">
            <div className="reflection-question"><Sparkles size={19}/><span>MỘT CÂU HỎI CHO BẠN</span><h3>{report.reflection}</h3></div>
            <p className="source-note">{report.source === "ai" ? "Diễn giải được hỗ trợ bởi AI." : "Bản diễn giải dự phòng · AI chưa khả dụng."} Dành cho tự suy ngẫm, không thay thế lời khuyên chuyên môn.</p>
            {report.source === "fallback" ? <Button variant="outline" disabled={loading} onClick={() => onSubmit({ type: "lenormand", topic: report.subtitle, question: report.context, cards: report.cards })}>{loading ? <LoaderCircle className="spin" size={16}/> : <RotateCcw size={16}/>} {loading ? "Đang thử lại…" : "Thử lại diễn giải AI với bộ bài này"}</Button> : null}
            <div className="report-actions"><Button onClick={onSave} disabled={saved}>{saved ? <Check size={16}/> : <Bookmark size={16}/>} {saved ? "Đã lưu kết quả" : "Lưu kết quả"}</Button><Button variant="outline" onClick={onShare}><Share2 size={16}/> Chia sẻ</Button></div>
            <button className="skip-button" onClick={onRestart}><RotateCcw size={14}/> Trải bài mới</button>
            <RelatedTools current="lenormand" className="text-left" />
          </div>
        </div>
      </DialogContent>
    </Dialog>;
  }

  const previousReading = report.deepQuestions ? report.previousReading : undefined;
  const body = deepening ? <div><Button variant="outline" disabled={loading} onClick={() => setDeepening(false)}><ChevronLeft size={16}/> Về trải bài tổng quan</Button><TarotFlow previous={report} onSubmit={onSubmit} loading={loading}/></div> : (
    <div className={`report-body ${previousReading ? "has-reading-history" : ""}`}>
      {previousReading ? <section className="tarot-reading-snapshot" aria-labelledby="tarot-overview-title">
        <header className="tarot-reading-chapter-heading">
          <span>Lượt 1 · Tổng quan</span>
          <h2 id="tarot-overview-title">Bức tranh tổng quan</h2>
          <p className="tarot-reading-chapter-meta">Quá khứ · Hiện tại · Xu hướng tương lai</p>
          <p className="tarot-reading-chapter-question">{previousReading.question}</p>
        </header>
        <div className="report-visual">
          <TarotCardSpread cardIds={previousReading.cards} reversed={previousReading.reversed} positions={["Quá khứ", "Hiện tại", "Tương lai"]}/>
        </div>
        <div className="report-content">
          <div className="report-summary">{previousReading.summary}</div>
          {previousReading.sections.map((section, index) => <section key={index} className="report-section">
            <h3>{section.title}</h3>
            <p>{section.text}</p>
          </section>)}
        </div>
      </section> : null}
      {previousReading ? <div className="tarot-reading-divider" aria-hidden="true"><span><Sparkles size={16}/></span></div> : null}
      {previousReading ? <header className="tarot-reading-chapter-heading tarot-deep-reading-heading">
        <span>Lượt 2 · Đào sâu</span>
        <h2>Đi sâu vào câu chuyện của bạn</h2>
        <p className="tarot-reading-chapter-meta">3 lá mới · 5 câu hỏi cụ thể</p>
      </header> : null}
      <aside className="report-visual">
        {report.cards ? (
          <TarotCardSpread cardIds={report.cards} reversed={report.reversed}/>
        ) : null}
        {report.scores ? (
          <div className="score-chart">
            {report.scores.map((score, i) => (
              <div key={dimensions[i]}>
                <div>
                  <span>{dimensions[i]}</span>
                  <strong>{score}%</strong>
                </div>
                <Progress value={score} />
              </div>
            ))}
          </div>
        ) : null}
      </aside>
      <div className="report-content">
        <div className="report-summary">{report.summary}</div>
        {report.sections.map((s, i) => (
          <section key={i} className="report-section">
            <div className="report-section-heading">
              {previousReading ? <span className="report-section-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span> : null}
              <h3>{s.title}</h3>
            </div>
            <p>{s.text}</p>
          </section>
        ))}
      </div>
      <div className="report-bottom">
        <div className="reflection-question">
          <Sparkles size={19} />
          <span>MỘT CÂU HỎI CHO BẠN</span>
          <h3>{report.reflection}</h3>
        </div>
        <p className="source-note">
          {report.source === "ai"
            ? "Diễn giải được hỗ trợ bởi AI."
            : "Bản diễn giải dự phòng · AI chưa được cấu hình hoặc tạm thời không khả dụng."}{" "}
          Dành cho tự suy ngẫm, không thay thế lời khuyên chuyên môn.
        </p>
        {report.type === "tarot" && !report.deepQuestions && report.cards?.length === 3 ? <div className="tarot-deepen-invite">
          <h3>Còn điều gì bạn muốn hiểu rõ hơn?</h3>
          <p>Tiếp nối câu chuyện này với 5 câu hỏi của bạn và 3 lá bài mới.</p>
          <Button onClick={() => setDeepening(true)}><Sparkles size={17}/> Mình muốn hiểu sâu hơn</Button>
        </div> : null}
        {report.type === "tarot" && report.source === "fallback" ? <Button variant="outline" disabled={loading} onClick={() => onSubmit({type:"tarot", topic:report.subtitle, question:report.context, cards:report.cards, reversed:report.reversed, deepQuestions:report.deepQuestions, previousReading:report.previousReading})}>
          {loading ? <LoaderCircle className="spin" size={16}/> : <RotateCcw size={16}/>} {loading ? "Đang thử lại…" : "Thử lại diễn giải AI với bộ bài này"}
        </Button> : null}
        <div className="report-actions">
          <Button onClick={onSave} disabled={saved}>
            {saved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
            {saved ? "Đã lưu kết quả" : "Lưu kết quả"}
          </Button>
          <Button variant="outline" onClick={onShare}>
            <Share2 size={16} /> Chia sẻ
          </Button>
        </div>
        <div className="report-feedback">
          <span>
            {feedback
              ? "Cảm ơn bạn đã chia sẻ cảm nhận."
              : "Trải nghiệm này có hữu ích với bạn?"}
          </span>
          {!feedback ? (
            <>
              <button
                onClick={() => {
                  setFeedback(true);
                  track("experience_feedback_submit", { helpful: 1 });
                }}
              >
                Có, cảm ơn Luna ♡
              </button>
              <button
                onClick={() => {
                  setFeedback(true);
                  track("experience_feedback_submit", { helpful: 0 });
                }}
              >
                Chưa phù hợp
              </button>
            </>
          ) : null}
        </div>
        <button className="skip-button" onClick={onRestart}>
          <RotateCcw size={14} /> Khám phá lại
        </button>
        {/* Tarot hiện trong modal nên gợi ý nằm luôn trong thân modal.
            Lenormand thoát sớm ở trên, không đi qua `body`. */}
        {report.type === "tarot" ? (
          <RelatedTools current="tarot" className="text-left" />
        ) : null}
      </div>
    </div>
  );
  if (report.type === "personality") return body;
  return <Dialog open onOpenChange={(open) => { if (!open && !loading) onRestart(); }}>
    <DialogContent ref={dialogContentRef} className={`luna-dialog tarot-result-modal ${deepening ? "is-deepening" : ""}`} showCloseButton={!loading} data-lenis-prevent>
      <DialogHeader>
        <DialogTitle>{deepening ? "Khám phá sâu hơn" : report.deepQuestions ? "Trải bài của bạn" : "Câu chuyện từ ba lá bài"}</DialogTitle>
        <DialogDescription>{report.context || report.subtitle}</DialogDescription>
      </DialogHeader>
      {body}
    </DialogContent>
  </Dialog>;
}

const zodiacDetails: Record<string, { dates: string; traits: string }> = {
  "Bạch Dương": { dates: "21/03 – 19/04", traits: "Chủ động · Nhiệt huyết · Can đảm" },
  "Kim Ngưu": { dates: "20/04 – 20/05", traits: "Bền bỉ · Điềm tĩnh · Tận tâm" },
  "Song Tử": { dates: "21/05 – 20/06", traits: "Linh hoạt · Tò mò · Kết nối" },
  "Cự Giải": { dates: "21/06 – 22/07", traits: "Tinh tế · Quan tâm · Sâu sắc" },
  "Sư Tử": { dates: "23/07 – 22/08", traits: "Ấm áp · Sáng tạo · Tự tin" },
  "Xử Nữ": { dates: "23/08 – 22/09", traits: "Tỉ mỉ · Thực tế · Chu đáo" },
  "Thiên Bình": { dates: "23/09 – 22/10", traits: "Hài hòa · Công bằng · Duyên dáng" },
  "Bọ Cạp": { dates: "23/10 – 21/11", traits: "Sâu sắc · Kiên định · Trực giác" },
  "Nhân Mã": { dates: "22/11 – 21/12", traits: "Cởi mở · Lạc quan · Khám phá" },
  "Ma Kết": { dates: "22/12 – 19/01", traits: "Ổn định · Kiên trì · Thành tựu" },
  "Bảo Bình": { dates: "20/01 – 18/02", traits: "Độc lập · Sáng tạo · Nhân ái" },
  "Song Ngư": { dates: "19/02 – 20/03", traits: "Nhạy cảm · Mộng mơ · Đồng cảm" },
};

/**
 * Kết quả chiêm tinh, hiển thị thẳng trong trang như các feature còn lại
 * (Bát Tự, Thần số học, Human Design…) chứ không bung modal nữa.
 *
 * Phần CSS của khối này vốn viết cho một hộp thoại cao cố định, nên ở đây phải
 * gỡ hai ràng buộc của hộp thoại: chiều cao 100% và vùng cuộn riêng bên trong.
 * Bỏ chúng đi thì khối cao theo nội dung và cuộn chung với trang. Hậu tố `!`
 * là bắt buộc — phần lớn globals.css nằm ngoài layer nên thắng Tailwind.
 */
function DailyResultView({ report, saved, onSave, onShare, onRestart }: {
  report: Report;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  onRestart: () => void;
}) {
  const [sign, day] = report.subtitle.split(" · ");
  const signIndex = zodiac.indexOf(sign);
  const details = zodiacDetails[sign];
  const sectionIcons = [Target, BriefcaseBusiness, Heart, Sparkles];

  return <div>
    <h2 className="sr-only">Thông điệp chiêm tinh hôm nay của {sign}</h2>
    {/* Chỉ bo góc + cắt tràn: khung thẻ đã do .experience-surface lo, thêm
        viền hay nền ở đây sẽ thành hai lớp hộp lồng nhau. */}
    <div className="overflow-hidden rounded-[18px]">
      <div className="daily-reading-layout h-auto!">
        <aside className="daily-reading-art" aria-label={`Thông điệp ngày ${day}`}>
          <span className="daily-reading-moon" aria-hidden="true">☾</span>
          <div className="daily-reading-heading">
            <span>HOROSCOPE</span>
            <h2>Thông điệp<br />chiêm tinh<br />hôm nay</h2>
            <p>{sign} · {day}</p>
          </div>
          <Image src="/images/zodiac-bust.png" alt="Nữ thần giữa quầng sao và mây" width={816} height={1024} priority />
          <span className="daily-reading-art-caption">A BRIGHTER YOU<br />EVERY DAY</span>
        </aside>
        <div className="daily-reading-content overflow-visible!">
          <div className="daily-reading-sign">
            <span className="daily-reading-symbol" aria-hidden="true">{zodiacSymbols[signIndex] || "✦"}</span>
            <div><h3>{sign}</h3><p>{details?.dates || day}</p></div>
            {details ? <span className="daily-reading-traits">{details.traits}</span> : null}
          </div>
          <blockquote className="daily-reading-summary">{report.summary}</blockquote>
          <div className="daily-reading-sections">
            {report.sections.map((section, index) => {
              const Icon = sectionIcons[index] || Sparkles;
              return <section className="daily-reading-section" key={`${section.title}-${index}`}>
                <span className="daily-reading-section-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.7}/></span>
                <div><h4>{section.title}</h4><p>{section.text}</p></div>
              </section>;
            })}
          </div>
          <div className="daily-reading-reflection">
            <div><Sun size={20} strokeWidth={1.4}/><span>MỘT CÂU HỎI CHO BẠN</span></div>
            <p>{report.reflection}</p>
          </div>
          <div className="daily-reading-actions">
            <Button onClick={onSave} disabled={saved}>{saved ? <Check size={16}/> : <Bookmark size={16}/>} {saved ? "Đã lưu kết quả" : "Lưu kết quả"}</Button>
            <Button variant="outline" onClick={onShare}><Share2 size={16}/> Chia sẻ</Button>
            <button className="daily-reading-restart" onClick={onRestart}><RotateCcw size={15}/> Xem cung khác</button>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function TarotCardSpread({
  cardIds,
  reversed,
  positions,
}: {
  cardIds: number[];
  reversed?: boolean[];
  positions?: string[];
}) {
  return <div className="report-cards">
    {cardIds.map((id, index) => <div className="report-card" key={id}>
      <TarotArtwork id={id} reversed={reversed?.[index] || false}/>
      {positions?.[index] ? <span className="report-card-position">{positions[index]}</span> : null}
      <strong>{cards[id].vi}</strong>
      <small>{cards[id].name} · {reversed?.[index] ? "Ngược" : "Xuôi"}</small>
    </div>)}
  </div>;
}

function TarotArtwork({ id, reversed }: { id: number; reversed: boolean }) {
  const [open, setOpen] = useState(false);
  const card = cards[id];
  return (
    <>
      <button
        className="tarot-artwork-open"
        onClick={() => setOpen(true)}
        aria-label={`Phóng to lá ${card.vi}`}
      >
        <Image
          className={
            reversed ? "rws-card-image reversed-image" : "rws-card-image"
          }
          src={card.image}
          alt={`${card.vi} (${card.name})`}
          width={300}
          height={510}
        />
        <span>Phóng to lá bài</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="luna-dialog tarot-artwork-dialog"
          data-lenis-prevent
        >
          <DialogHeader>
            <DialogTitle>{card.vi}</DialogTitle>
            <DialogDescription>
              {card.name} · {card.suit} · {reversed ? "Lá ngược" : "Lá xuôi"}
            </DialogDescription>
          </DialogHeader>
          <Image
            className={
              reversed ? "rws-full-image reversed-image" : "rws-full-image"
            }
            src={card.image}
            alt={card.vi}
            width={480}
            height={816}
          />
          <p className="tarot-artwork-meaning">
            Lá bài gợi nhắc bạn {reversed ? card.reversedMeaning : card.meaning}
            .
          </p>
          <a
            className="tarot-artwork-source"
            href="/images/tarot/CREDITS.md"
            target="_blank"
            rel="noreferrer"
          >
            Pamela Colman Smith · Nguồn bản quét & ghi công
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
}
