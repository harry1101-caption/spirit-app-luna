"use client";
import { useEffect, useRef, useState } from "react";
import {
  TarotFlow,
  DailyFlow,
  PersonalityFlow,
  ReportView,
  TuViFlow,
} from "@/components/experiences";
import { CelestialHome, ExperienceCard } from "@/components/celestial-home";
import { LenormandFlow } from "@/components/lenormand-flow";
import { BatTuFlow } from "@/components/bat-tu-flow";
import { ThanSoHocFlow } from "@/components/than-so-hoc-flow";
import { GiacMoFlow } from "@/components/giac-mo-flow";
import { HumanDesignFlow } from "@/components/human-design-flow";
import { ChiTayFlow } from "@/components/chi-tay-flow";
import { XinXamFlow } from "@/components/xin-xam-flow";
import { AllToolsMenu } from "@/components/all-tools-menu";
import { toolGroups } from "@/components/tool-groups";
import { topicByKey, type Topic } from "@/components/topic-picker";
import {
  ChevronDown,
  Menu,
  ArrowRight,
  Bookmark,
  Check,
  ArrowUpRight,
  Compass,
  Heart,
  Leaf,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  dateLabel,
  intents,
  methods,
  recommend,
  today,
  zodiac,
  type InterpretationInput,
  type Method,
  type Report,
} from "@/lib/engine";
import { track } from "@/lib/analytics";
import { DailyCardModal } from "@/components/daily-card-modal";
import { RelatedToolsSlot } from "@/components/related-tools";
import { LogoMark } from "@/components/logo-mark";

import { buildDailyCardReport, drawDailyCard } from "@/lib/daily-card";
type Tab = "home" | "explore" | "history" | "profile" | "tuvi" | "lenormand" | "bat-tu" | "than-so-hoc" | "giac-mo" | "human-design" | "chi-tay" | "xin-xam";
type DailyCardState = { id: number; day: string; revealed: boolean };
/** Lá bài hôm nay được khoá theo ngày, nên cần một seed ổn định cho mỗi thiết bị. */
const DAILY_CARD_KEY = "luna:dailycard:v1";
function deviceSeed() {
  let seed = localStorage.getItem("luna:device:v1");
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem("luna:device:v1", seed);
  }
  return seed;
}
type Preferences = { intent: string; sign: string; onboarded: boolean };
const defaultPrefs: Preferences = {
  intent: "",
  sign: "Thiên Bình",
  onboarded: false,
};
const nav: { label: string; action: string }[] = [
  { label: "Trang chủ", action: "home" },
  { label: "Tử vi", action: "tuvi" },
  { label: "Tarot", action: "tarot" },
  { label: "Thần số học", action: "than-so-hoc" },
];
/** Chủ đề trên trang chủ ↔ chủ đề trong form Tarot. */
function tarotTopicFor(key: string) {
  return key === "love" ? "Tình cảm" : "Công việc & học tập";
}
function readLocal<T>(key: string, defaultValue: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : defaultValue;
  } catch {
    return defaultValue;
  }
}
function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
export default function LunaApp({
  initialFlow,
  initialTab = "home",
  initialTopic,
}: {
  initialFlow?: Method;
  initialTab?: Tab;
  /** Key chủ đề đọc từ query string, ví dụ /tarot?chu-de=work. */
  initialTopic?: string;
} = {}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<"all" | Method>("all");
  const [tab, setTab] = useState<Tab>(initialTab);
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [history, setHistory] = useState<Report[]>([]);
  const [ready, setReady] = useState(false);
  const [flow, setFlow] = useState<Method | null>(initialFlow ?? null);
  const [onboard, setOnboard] = useState(false);
  const [intent, setIntent] = useState("");
  const [onboardStep, setOnboardStep] = useState(0);
  const [chosenMethod, setChosenMethod] = useState<Method | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [analytics, setAnalytics] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [dailyCard, setDailyCard] = useState<DailyCardState | null>(null);
  /**
   * Chủ đề + câu hỏi điền sẵn khi vào từ khối "Chọn một chủ đề để bắt đầu".
   *
   * Lấy từ query string chứ KHÔNG phải từ state đặt trước lúc điều hướng:
   * `openMethod` đi bằng window.location.assign, tức tải lại cả trang, nên mọi
   * state React đặt trước đó đều mất trước khi TarotFlow kịp đọc.
   */
  const seedTopic = topicByKey(initialTopic);
  const [tarotSeed, setTarotSeed] = useState<{ topic: string; question: string } | null>(
    seedTopic && seedTopic.key !== "self" && seedTopic.key !== "future"
      ? { topic: tarotTopicFor(seedTopic.key), question: seedTopic.question }
      : null,
  );
  const mainRef = useRef<HTMLElement>(null);
  // Reconcile browser-only persistence once after SSR; never write personal data implicitly.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate an external browser store after the SSR snapshot.
    setPrefs(readLocal("luna:prefs:v1", defaultPrefs));
    setHistory(readLocal("luna:history:v1", []));
    setAnalytics(localStorage.getItem("luna:analytics:v1") === "true");
    setReady(true);
    track("session_start");
  }, []);
  useEffect(() => {
    if (!ready) return;
    let cleanup: undefined | (() => void);
    let disposed = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (
          disposed ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
          const elements = gsap.utils.toArray<HTMLElement>("[data-reveal]");
          elements.forEach((element, index) => {
            const below =
              element.getBoundingClientRect().top > window.innerHeight;
            gsap.fromTo(
              element,
              { y: 18, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.65,
                delay: below ? 0 : Math.min(index * 0.08, 0.3),
                ease: "power2.out",
                clearProps: "transform,opacity",
                ...(below
                  ? {
                      scrollTrigger: {
                        trigger: element,
                        start: "top 94%",
                        once: true,
                      },
                    }
                  : {}),
              },
            );
          });
        }, mainRef);
        cleanup = () => ctx.revert();
      },
    );
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [tab, ready, flow, report?.id]);
  useEffect(() => {
    if (!ready || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        anchors: true,
      });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      cleanup = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [ready]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  function navigateTab(next: Tab) {
    setMobileMenu(false);
    if (next === "tuvi" && window.location.pathname !== "/tu-vi") {
      window.location.assign("/tu-vi");
      return;
    }
    if (next === "lenormand" && window.location.pathname !== "/lenormand") {
      window.location.assign("/lenormand");
      return;
    }
    if (next === "bat-tu" && window.location.pathname !== "/bat-tu") {
      window.location.assign("/bat-tu");
      return;
    }
    if (next === "than-so-hoc" && window.location.pathname !== "/than-so-hoc") {
      window.location.assign("/than-so-hoc");
      return;
    }
    if (next === "giac-mo" && window.location.pathname !== "/giac-mo") {
      window.location.assign("/giac-mo");
      return;
    }
    if (next === "human-design" && window.location.pathname !== "/human-design") {
      window.location.assign("/human-design");
      return;
    }
    if (next === "chi-tay" && window.location.pathname !== "/chi-tay") {
      window.location.assign("/chi-tay");
      return;
    }
    if (next === "xin-xam" && window.location.pathname !== "/xin-xam") {
      window.location.assign("/xin-xam");
      return;
    }
    if (next === "home" && window.location.pathname !== "/") {
      window.location.assign("/");
      return;
    }
    if (next !== "tuvi" && window.location.pathname === "/tu-vi") {
      window.history.replaceState(null, "", "/");
    }
    setFlow(null);
    setReport(null);
    setError("");
    setTab(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function updatePrefs(next: Preferences) {
    setPrefs(next);
    try {
      writeLocal("luna:prefs:v1", next);
    } catch {
      setToast("Trình duyệt chưa cho phép lưu tùy chọn.");
    }
  }
  /**
   * Mở một công cụ theo `action` trong toolGroups. Gom về một chỗ để header,
   * lưới trang chủ và menu "Trải nghiệm" không phải lặp lại chuỗi điều kiện.
   */
  /** Mục nào trên header đang ứng với thứ người dùng đang xem. */
  function isToolActive(action: string) {
    if (action === "home") return tab === "home" && !flow && !report;
    if (action === "tarot" || action === "daily" || action === "personality")
      return flow === action && !report;
    return tab === action && !flow && !report;
  }
  function openTool(action: string) {
    setMobileMenu(false);
    if (action === "dailycard") return openDailyCard();
    if (action === "tarot" || action === "daily" || action === "personality")
      return openMethod(action as Method);
    return navigateTab(action as Tab);
  }
  function openMethod(method: Method) {
    setMobileMenu(false);
    if (method === "tarot" && window.location.pathname !== "/tarot") {
      window.location.assign("/tarot");
      return;
    }
    if (method === "daily" && window.location.pathname !== "/chiem-tinh") {
      window.location.assign("/chiem-tinh");
      return;
    }
    if (method === "personality" && window.location.pathname !== "/tinh-cach") {
      window.location.assign("/tinh-cach");
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    setFlow(method);
    setReport(null);
    setError("");
    track("experience_start", { method });
    if (method === "tarot") track("tarot_start");
    if (method === "daily") track("daily_guidance_view");
    if (method === "personality") track("personality_test_start");
  }
  function startOnboard() {
    setIntent(prefs.intent || intents[0]);
    setOnboardStep(0);
    setChosenMethod(null);
    setOnboard(true);
    track("onboarding_view");
  }
  async function interpret(input: InterpretationInput) {
    setLoading(true);
    setError("");
    try {
      let result: Report | undefined;
      if (input.type === "daily") {
        const cached = readLocal<{ key: string; report: Report } | null>(
          "luna:daily:v2",
          null,
        );
        if (
          cached?.key === `${input.sign}:${today()}` &&
          cached.report.source === "ai"
        )
          result = cached.report;
      }
      if (!result) {
        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Chưa thể tạo kết quả. Hãy thử lại.");
        }
        result = await response.json();
        if (input.type === "daily")
          try {
            writeLocal("luna:daily:v2", {
              key: `${input.sign}:${today()}`,
              report: result,
            });
          } catch {}
      }
      setReport(result!);
      setSavedStatus(history.some((r) => r.id === result!.id));
      track("experience_complete", { method: input.type });
      if (input.type === "personality") track("personality_report_view");
      track(input.type === "tarot" ? "tarot_reading_complete" : input.type === "lenormand" ? "lenormand_reading_complete" : input.type === "daily" ? "daily_guidance_complete" : "personality_test_complete");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Kết nối bị gián đoạn. Hãy thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }
  function openDailyCard() {
    const day = today();
    const stored = readLocal<{
      day: string;
      id: number;
      recent: number[];
    } | null>(DAILY_CARD_KEY, null);
    track("daily_card_open");
    // Lá của ngày thì cố định, nhưng luôn mở ở mặt úp để thao tác lật được lặp lại.
    if (stored?.day === day) {
      setDailyCard({ id: stored.id, day, revealed: false });
      return;
    }
    // Tránh lặp lá đã ra trong 10 ngày gần nhất.
    const recent = stored?.recent ?? [];
    const id = drawDailyCard(deviceSeed(), day, recent.slice(0, 10));
    writeLocal(DAILY_CARD_KEY, {
      day,
      id,
      recent: [id, ...recent].slice(0, 10),
    });
    setDailyCard({ id, day, revealed: false });
  }
  function revealDailyCard() {
    if (!dailyCard) return;
    setDailyCard({ ...dailyCard, revealed: true });
    track("daily_card_reveal");
  }
  function saveDailyCard() {
    if (!dailyCard) return;
    const next = buildDailyCardReport(dailyCard.id, dailyCard.day);
    if (history.some((r) => r.id === next.id)) {
      setToast("Lá bài hôm nay đã có trong bộ sưu tập.");
      return;
    }
    const updated = [next, ...history];
    try {
      writeLocal("luna:history:v1", updated);
      setHistory(updated);
      setToast("Đã lưu lá bài hôm nay.");
      track("daily_card_save");
    } catch {
      setToast("Không lưu được. Bộ nhớ trình duyệt có thể đã đầy.");
    }
  }
  function saveReport() {
    if (!report) return;
    if (history.some((r) => r.id === report.id)) {
      setToast("Kết quả này đã có trong bộ sưu tập.");
      return;
    }
    const next = [report, ...history];
    try {
      writeLocal("luna:history:v1", next);
      setHistory(next);
      setSavedStatus(true);
      track(
        report.type === "tarot"
          ? "tarot_reading_save"
          : report.type === "lenormand"
            ? "lenormand_reading_save"
          : report.type === "personality"
            ? "personality_report_save"
            : "daily_guidance_save",
      );
      setToast("Đã giữ lại khám phá này cho bạn.");
    } catch {
      setToast("Bộ nhớ thiết bị đã đầy. Hãy xóa bớt kết quả rồi thử lại.");
    }
  }
  async function shareReport() {
    if (!report) return;
    const text = `Luna · ${report.title}\n${report.summary}\n\n${report.reflection}`;
    try {
      if (navigator.share) await navigator.share({ title: report.title, text });
      else {
        await navigator.clipboard.writeText(text);
        setToast("Đã sao chép nội dung để chia sẻ.");
      }
      track(
        report.type === "daily" ? "daily_guidance_share" : "experience_share",
      );
    } catch {
      setToast("Chưa chia sẻ được. Bạn có thể thử lại.");
    }
  }
  function deleteReport(id: string) {
    const next = history.filter((r) => r.id !== id);
    try {
      writeLocal("luna:history:v1", next);
      setHistory(next);
    } catch {
      setToast("Chưa xóa được dữ liệu.");
    }
  }
  /**
   * Mở phương pháp hợp với từng chủ đề, chứ không đổ cả bốn về một chỗ — section
   * đó tự hứa "Lunara gợi ý phương pháp phù hợp" nên phải làm đúng.
   *
   * Cách chia: câu hỏi về MỘT TÌNH HUỐNG đang diễn ra ("chuyện này sẽ ra sao")
   * thì hợp bói bài; câu hỏi về BẢN CHẤT hoặc GIAI ĐOẠN ("tôi là người thế
   * nào", "hướng đi sắp tới") thì hợp lá số.
   * - Tình yêu, Công việc → Tarot, điền sẵn cả chủ đề lẫn câu hỏi in trên thẻ.
   * - Bản thân → Thần số học: đúng câu "đặc điểm nào đang ảnh hưởng đến tôi",
   *   mà form chỉ hai ô.
   * - Tương lai → Tử Vi: "hướng đi phía trước" chính là Đại Vận.
   *
   * Hai cái sau không có ô câu hỏi nên mất phần điền sẵn; đổi lại chúng trả lời
   * đúng thứ người ta hỏi.
   */
  function openTopic(topic: Topic) {
    track("home_topic_select", { topic: topic.key });
    if (topic.key === "self" || topic.key === "future") {
      setTarotSeed(null);
      navigateTab(topic.key === "self" ? "than-so-hoc" : "tuvi");
      return;
    }
    // Mang chủ đề theo URL, không đặt vào state: điều hướng dưới đây tải lại
    // cả trang nên state sẽ mất. Chỉ truyền KEY, không truyền câu hỏi — câu
    // hỏi tra lại được từ key, và không nên nhét nội dung vào thanh địa chỉ.
    if (window.location.pathname !== "/tarot") {
      window.location.assign(`/tarot?chu-de=${topic.key}`);
      return;
    }
    setTarotSeed({ topic: tarotTopicFor(topic.key), question: topic.question });
    openMethod("tarot");
  }

  function chooseIntent(value: string) {
    setIntent(value);
    setOnboardStep(1);
    setChosenMethod(null);
    setOnboard(true);
    track("onboarding_intent_select", { intent: value });
  }
  const filteredHistory =
    historyFilter === "all"
      ? history
      : history.filter((r) => r.type === historyFilter);
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => navigateTab("home")}
            aria-label="Lunara, trang chủ"
          >
            {/* Không bọc .brand-compass: class đó vẽ hai vòng tròn viền vàng
                (border + :before), chồng lên icon vốn đã có bố cục tròn riêng. */}
            <LogoMark />
            <span>Lunara</span>
          </button>
          <nav aria-label="Điều hướng chính">
            {nav.map((n) => (
              <button
                key={n.label}
                className={`nav-item ${isToolActive(n.action) ? "active" : ""}`}
                onClick={() => openTool(n.action)}
              >
                {n.label}
              </button>
            ))}
            <AllToolsMenu onPick={openTool} isActive={isToolActive} />
          </nav>
          <div className="header-tools">
            <button
              aria-label="Khám phá của tôi"
              className={`discoveries-link ${tab === "history" && !flow ? "active" : ""}`}
              onClick={() => navigateTab("history")}
            >
              <Bookmark size={22} strokeWidth={1.25} />
              <span>Khám phá của tôi</span>
            </button>
            <span className="header-divider" />
            <button
              className="profile-button"
              onClick={() => navigateTab("profile")}
              aria-label="Không gian của bạn"
            >
              <span>
                <UserRound size={23} strokeWidth={1.3} />
              </span>
              <ChevronDown size={18} />
            </button>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenu((v) => !v)}
              aria-label={mobileMenu ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileMenu}
              aria-controls="mobile-menu"
            >
              {mobileMenu ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
        {mobileMenu ? (
          <nav
            className="mobile-menu"
            id="mobile-menu"
            aria-label="Điều hướng di động"
          >
            {nav.map((n) => (
              <button key={n.label} onClick={() => openTool(n.action)}>
                {n.label}
                <ArrowRight size={16} />
              </button>
            ))}
            {/* Mobile không có hover nên đổ phẳng toàn bộ công cụ thay vì menu thả xuống */}
            {toolGroups.flatMap((group) =>
              group.tools
                .filter((tool) => "action" in tool && tool.action)
                .map((tool) => {
                  const action = (tool as { action: string }).action;
                  if (nav.some((n) => n.action === action)) return null;
                  const Icon = tool.icon;
                  return (
                    <button key={tool.title} onClick={() => openTool(action)}>
                      <Icon size={19} strokeWidth={1.4} />
                      {tool.title}
                      <ArrowRight size={16} />
                    </button>
                  );
                }),
            )}
            <button onClick={() => navigateTab("history")}>
              <Bookmark size={19} />
              Khám phá của tôi
              <ArrowRight size={16} />
            </button>
          </nav>
        ) : null}
      </header>
      <main
        ref={mainRef}
        className={`main-wrap ${tab === "home" && !flow && !report ? "home-main" : "inner-main"}`}
      >
        {tab === "home" && !flow && !report ? (
          <CelestialHome
            onStart={startOnboard}
            onMethod={openMethod}
            onTool={openTool}
            onTopic={openTopic}
            date={ready ? dateLabel() : ""}
            sign={prefs.sign}
          />
        ) : null}
        {tab === "explore" && !flow && !report ? (
          <>
            <PageHeading
              eyebrow="MỘT THẾ GIỚI BÊN TRONG BẠN"
              title="Bạn muốn khám phá điều gì?"
              description="Chọn điều bạn đang quan tâm hoặc bắt đầu bằng một trải nghiệm yêu thích."
            />
            <div className="explore-intents" data-reveal>
              {intents.map((item, i) => (
                <button
                  key={item}
                  onClick={() => {
                    setIntent(item);
                    setOnboardStep(1);
                    setChosenMethod(null);
                    setOnboard(true);
                    track("onboarding_intent_select", { intent: item });
                  }}
                >
                  <span>
                    {i === 0 ? (
                      <Sun size={22} />
                    ) : i === 1 ? (
                      <Heart size={22} />
                    ) : i === 2 ? (
                      <Compass size={22} />
                    ) : i === 3 ? (
                      <Leaf size={22} />
                    ) : (
                      <Moon size={22} />
                    )}
                  </span>
                  {item}
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
            <div className="section-title" data-reveal>
              <h2>Chọn cách bạn muốn lắng nghe</h2>
            </div>
            <div className="method-grid" data-reveal>
              {methods.map((m, i) => (
                <ExperienceCard
                  key={m.id}
                  method={m}
                  index={i}
                  onClick={() => openMethod(m.id)}
                />
              ))}
            </div>
            <p className="gentle-note">
              Luna hiện có 3 trải nghiệm. Tử Vi truyền thống, chỉ tay và thần số
              học chưa nằm trong phiên bản này.
            </p>
          </>
        ) : null}
        {tab === "history" && !flow && !report ? (
          <>
            <PageHeading
              eyebrow="KHÔNG GIAN RIÊNG CỦA BẠN"
              title="Những khám phá đã lưu"
              description="Có những lời nhắn, đọc lại vào một ngày khác sẽ mang một ý nghĩa mới."
            />
            <div className="history-filters" aria-label="Lọc khám phá">
              {[
                { id: "all", label: "Tất cả" },
                { id: "tarot", label: "Tarot" },
                { id: "daily", label: "Chiêm tinh" },
                { id: "personality", label: "Tính cách" },
              ].map((f) => (
                <button
                  key={f.id}
                  className={historyFilter === f.id ? "selected" : ""}
                  aria-pressed={historyFilter === f.id}
                  onClick={() => setHistoryFilter(f.id as "all" | Method)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {filteredHistory.length ? (
              <div className="saved-grid" data-reveal>
                {filteredHistory.map((r) => (
                  <SavedCard
                    key={r.id}
                    report={r}
                    onOpen={() => {
                      setReport(r);
                      setSavedStatus(true);
                      track("saved_result_view");
                    }}
                    onDelete={() => deleteReport(r.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state" data-reveal>
                <Bookmark size={42} strokeWidth={1} />
                <h2>Một trang mới đang đợi bạn</h2>
                <p>
                  Những kết quả bạn chọn lưu sẽ xuất hiện ở đây.
                  <br />
                  Chỉ có bạn, trên thiết bị này, xem được chúng.
                </p>
                <Button onClick={() => navigateTab("explore")}>
                  Bắt đầu khám phá <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </>
        ) : null}
        {tab === "tuvi" && !flow && !report ? <TuViFlow /> : null}
        {tab === "xin-xam" && !flow && !report ? (
          <section className="experience-page experience-page-tarot experience-page-xinxam">
            <div className="tarot-page-background" aria-hidden="true" />
            <div className="page-heading tarot-title-only"><h1>Một lời gợi mở từ quẻ xăm</h1></div>
            <RelatedToolsSlot><div className="experience-surface"><XinXamFlow /></div></RelatedToolsSlot>
          </section>
        ) : null}
        {tab === "chi-tay" && !flow && !report ? (
          <section className="experience-page experience-page-tarot experience-page-chitay">
            <div className="tarot-page-background" aria-hidden="true" />
            <div className="page-heading tarot-title-only"><h1>Những đường trên bàn tay</h1></div>
            <RelatedToolsSlot><div className="experience-surface"><ChiTayFlow /></div></RelatedToolsSlot>
          </section>
        ) : null}
        {tab === "human-design" && !flow && !report ? (
          <section className="experience-page experience-page-tarot experience-page-humandesign">
            <div className="tarot-page-background" aria-hidden="true" />
            <div className="page-heading tarot-title-only"><h1>Bản đồ năng lượng của bạn</h1></div>
            <RelatedToolsSlot><div className="experience-surface"><HumanDesignFlow /></div></RelatedToolsSlot>
          </section>
        ) : null}
        {tab === "giac-mo" && !flow && !report ? (
          <section className="experience-page experience-page-tarot experience-page-giacmo">
            <div className="tarot-page-background" aria-hidden="true" />
            <div className="page-heading tarot-title-only"><h1>Lắng nghe giấc mơ</h1></div>
            <RelatedToolsSlot><div className="experience-surface"><GiacMoFlow /></div></RelatedToolsSlot>
          </section>
        ) : null}
        {tab === "than-so-hoc" && !flow && !report ? (
          <section className="experience-page experience-page-tarot experience-page-thansohoc">
            <div className="tarot-page-background" aria-hidden="true" />
            <div className="page-heading tarot-title-only"><h1>Những con số của bạn</h1></div>
            <RelatedToolsSlot><div className="experience-surface"><ThanSoHocFlow /></div></RelatedToolsSlot>
          </section>
        ) : null}
        {tab === "bat-tu" && !flow && !report ? (
          <section className="experience-page experience-page-tarot experience-page-battu">
            <div className="tarot-page-background" aria-hidden="true" />
            <div className="page-heading tarot-title-only"><h1>Tám chữ của đời bạn</h1></div>
            <RelatedToolsSlot><div className="experience-surface"><BatTuFlow /></div></RelatedToolsSlot>
          </section>
        ) : null}
        {tab === "lenormand" && !flow && !report ? (
          <section className="experience-page experience-page-tarot experience-page-lenormand">
            <div className="tarot-page-background" aria-hidden="true" />
            <div className="page-heading tarot-title-only"><h1>Lắng nghe những biểu tượng</h1></div>
            <div className="experience-surface"><LenormandFlow onSubmit={interpret} loading={loading} />{error ? <div role="alert" className="error-box">{error}</div> : null}</div>
          </section>
        ) : null}
        {tab === "profile" && !flow && !report ? (
          <>
            <PageHeading
              eyebrow="MỘT CHÚT VỀ BẠN"
              title="Không gian của tôi"
              description="Không cần tài khoản. Bạn luôn có quyền chọn chia sẻ và giữ lại điều gì."
            />
            <div className="profile-layout" data-reveal>
              <section className="settings-card">
                <div className="setting-heading">
                  <Moon size={24} />
                  <h2>Nhịp điệu của bạn</h2>
                </div>
                <label htmlFor="profile-sign">Cung hoàng đạo</label>
                <select
                  id="profile-sign"
                  value={prefs.sign}
                  onChange={(e) =>
                    updatePrefs({ ...prefs, sign: e.target.value })
                  }
                >
                  {zodiac.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <label htmlFor="profile-intent">Điều bạn quan tâm</label>
                <select
                  id="profile-intent"
                  value={prefs.intent}
                  onChange={(e) =>
                    updatePrefs({ ...prefs, intent: e.target.value })
                  }
                >
                  <option value="">Chưa chọn</option>
                  {intents.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button className="text-link" onClick={startOnboard}>
                  Chọn lại trải nghiệm phù hợp <ArrowRight size={16} />
                </button>
              </section>
              <section className="settings-card">
                <div className="setting-heading">
                  <ShieldCheck size={24} />
                  <h2>Riêng tư theo cách của bạn</h2>
                </div>
                <p>
                  Câu hỏi và kết quả chỉ được lưu vào lịch sử khi bạn bấm “Lưu
                  kết quả”. Dữ liệu nằm trên trình duyệt này, chưa đồng bộ giữa
                  các thiết bị.
                </p>
                <div className="switch-setting">
                  <label htmlFor="analytics">
                    Cho phép sự kiện sử dụng ẩn danh
                    <small>
                      Không gồm câu hỏi riêng tư hay câu trả lời bài khám phá.
                    </small>
                  </label>
                  <Switch
                    id="analytics"
                    checked={analytics}
                    onCheckedChange={(v) => {
                      setAnalytics(v);
                      localStorage.setItem("luna:analytics:v1", String(v));
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Xóa tất cả kết quả đã lưu và tùy chọn trên thiết bị này?",
                      )
                    ) {
                      [
                        "luna:history:v1",
                        "luna:prefs:v1",
                        "luna:daily:v1",
                        "luna:analytics:v1",
                      ].forEach((k) => localStorage.removeItem(k));
                      setHistory([]);
                      setPrefs(defaultPrefs);
                      setAnalytics(false);
                      setToast("Đã xóa dữ liệu Luna trên thiết bị này.");
                    }
                  }}
                >
                  <Trash2 size={15} /> Xóa dữ liệu trên thiết bị
                </Button>
              </section>
            </div>
          </>
        ) : null}
        {flow || report ? (
          <section
            className={`experience-page ${report ? "is-report" : ""} ${flow === "daily" && !report ? "experience-page-tarot" : ""} experience-page-${report?.type || flow}`}
          >
            {flow === "daily" || report?.type === "daily" ? (
              <div className="tarot-page-background" aria-hidden="true" />
            ) : null}
            {flow === "tarot" || report?.type === "tarot" ? (
              <>
                <div className="tarot-page-background" aria-hidden="true" />
                <aside className="tarot-page-quote tarot-quote-left">
                  <span>“</span>
                  <p>
                    Đôi khi, câu trả lời
                    <br />
                    không nằm ở việc tìm kiếm,
                    <br />
                    mà ở việc lắng nghe.
                  </p>
                </aside>
                <aside className="tarot-page-quote tarot-quote-right">
                  <span>“</span>
                  <p>
                    Những lá bài
                    <br />
                    chỉ soi đường,
                    <br />
                    bạn mới là người lựa chọn.
                  </p>
                </aside>
              </>
            ) : null}
            {flow === "tarot" && !report ? (
              <div className="page-heading tarot-title-only">
                <h1>Lắng nghe những lá bài</h1>
              </div>
            ) : flow === "daily" && !report ? (
              <div className="page-heading tarot-title-only">
                <h1>Nhịp điệu của hôm nay</h1>
              </div>
            ) : (
              <PageHeading
                eyebrow={
                  report
                    ? "KHOẢNG NHỎ CỦA RIÊNG BẠN"
                    : flow === "daily"
                      ? "NHỊP ĐIỆU CỦA NGÀY MỚI"
                      : "GẶP GỠ CHÍNH MÌNH"
                }
                title={
                  report
                    ? report.title
                    : flow === "daily"
                      ? "Hôm nay có gì dành cho bạn?"
                      : "Bạn, qua những điều rất nhỏ"
                }
                description={
                  report
                    ? report.subtitle
                    : flow === "daily"
                      ? "Chọn cung hoàng đạo hoặc ngày sinh để nhận lời nhắn dành riêng cho bạn."
                      : "15 câu hỏi ngắn để hiểu khuynh hướng hiện tại. Bài tự khám phá, chưa phải thang đo tâm lý được kiểm định."
                }
              />
            )}
            <RelatedToolsSlot panel="experience-surface">
            <div className="experience-surface">
              {" "}
              {report ? (
                <ReportView
                  key={report.id}
                  onSubmit={interpret}
                  loading={loading}
                  report={report}
                  saved={savedStatus}
                  onSave={saveReport}
                  onShare={shareReport}
                  onRestart={() => {
                    if (report.type === "lenormand") {
                      setFlow(null);
                      setTab("lenormand");
                    } else if (report.type === "dailycard") {
                      setFlow(null);
                      openDailyCard();
                    } else setFlow(report.type);
                    setReport(null);
                    setError("");
                  }}
                />
              ) : flow === "tarot" ? (
                <TarotFlow
                  onSubmit={interpret}
                  loading={loading}
                  initialTopic={tarotSeed?.topic}
                  initialQuestion={tarotSeed?.question}
                />
              ) : flow === "daily" ? (
                <DailyFlow
                  sign={prefs.sign}
                  error={error}
                  onSubmit={(sign) => {
                    updatePrefs({ ...prefs, sign });
                    interpret({ type: "daily", sign });
                  }}
                  loading={loading}
                />
              ) : flow === "personality" ? (
                <PersonalityFlow
                  onSubmit={(scores) =>
                    interpret({ type: "personality", scores })
                  }
                  loading={loading}
                />
              ) : null}
              {error ? (
                <div role="alert" className="error-box">
                  {error}
                  <span>
                    Thông tin bạn vừa chọn vẫn được giữ lại. Hãy bấm nút tạo kết
                    quả để thử lại.
                  </span>
                </div>
              ) : null}
            </div>
            </RelatedToolsSlot>
          </section>
        ) : null}
      </main>
      <DailyCardModal
        open={!!dailyCard}
        onOpenChange={(open) => {
          if (!open) setDailyCard(null);
        }}
        cardId={dailyCard?.id ?? 0}
        revealed={!!dailyCard?.revealed}
        onReveal={revealDailyCard}
        onSave={saveDailyCard}
        onOpenTarot={() => {
          track("daily_card_to_tarot");
          setDailyCard(null);
          openMethod("tarot");
        }}
        saved={
          !!dailyCard &&
          history.some((r) => r.id === `dailycard-${dailyCard.day}-${dailyCard.id}`)
        }
      />
      <Dialog open={onboard} onOpenChange={setOnboard}>
        <DialogContent className="luna-dialog" data-lenis-prevent>
          <DialogHeader>
            <span className="dialog-eyebrow">
              BẮT ĐẦU TỪ ĐIỀU BẠN CẦN · {onboardStep + 1}/2
            </span>
            <DialogTitle>
              {onboardStep === 0
                ? "Hôm nay bạn muốn khám phá điều gì?"
                : "Một lối mở dành cho bạn"}
            </DialogTitle>
            <DialogDescription>
              {onboardStep === 0
                ? "Không có câu trả lời đúng hay sai. Chọn điều gần với bạn nhất lúc này."
                : "Bạn có thể theo gợi ý hoặc chọn phương pháp mình yêu thích."}
            </DialogDescription>
          </DialogHeader>
          {onboardStep === 0 ? (
            <>
              <div className="option-list">
                {intents.map((item, i) => (
                  <button
                    className={intent === item ? "selected" : ""}
                    key={item}
                    onClick={() => {
                      setIntent(item);
                      track("onboarding_intent_select", { intent: item });
                    }}
                  >
                    <span>
                      {i === 0 ? (
                        <Sun size={22} />
                      ) : i === 1 ? (
                        <Heart size={22} />
                      ) : i === 2 ? (
                        <Compass size={22} />
                      ) : i === 3 ? (
                        <Leaf size={22} />
                      ) : (
                        <Moon size={22} />
                      )}
                    </span>
                    {item}
                    {intent === item ? <Check size={16} /> : null}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => {
                  setOnboardStep(1);
                  setChosenMethod(null);
                }}
              >
                Tiếp tục <ArrowRight size={16} />
              </Button>
              <button
                className="skip-button"
                onClick={() => {
                  setOnboard(false);
                  navigateTab("explore");
                }}
              >
                Bỏ qua, xem tất cả trải nghiệm
              </button>
            </>
          ) : (
            <>
              <div className="recommend-box">
                <Sparkles size={22} />
                <span>
                  Luna gợi ý:{" "}
                  <strong>
                    {methods.find((m) => m.id === recommend(intent))?.tag}
                  </strong>
                </span>
                <p>
                  {intent === intents[4]
                    ? "Bắt đầu với chiêm tinh hằng ngày để tự suy ngẫm. Lá số Tử Vi truyền thống chưa có trong phiên bản này."
                    : "Dựa trên điều bạn quan tâm, trải nghiệm này có thể giúp bạn có thêm một góc nhìn."}
                </p>
              </div>
              <div className="method-options">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    className={
                      (chosenMethod || recommend(intent)) === m.id
                        ? "selected"
                        : ""
                    }
                    onClick={() => {
                      setChosenMethod(m.id);
                      track("onboarding_method_select", { method: m.id });
                    }}
                  >
                    {m.tag}
                    {(chosenMethod || recommend(intent)) === m.id ? (
                      <Check size={15} />
                    ) : null}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => {
                  updatePrefs({ ...prefs, intent, onboarded: true });
                  setOnboard(false);
                  track("onboarding_complete");
                  openMethod(chosenMethod || recommend(intent));
                }}
              >
                Bắt đầu trải nghiệm <ArrowRight size={16} />
              </Button>
              <button className="skip-button" onClick={() => setOnboardStep(0)}>
                Quay lại
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
      {toast ? (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button aria-label="Đóng thông báo" onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function SavedCard({
  report,
  onOpen,
  onDelete,
}: {
  report: Report;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="saved-card">
      <button className="saved-open" onClick={onOpen}>
        <span className="saved-icon">
          {report.type === "tarot" ? (
            <Sparkles />
          ) : report.type === "lenormand" ? (
            <Compass />
          ) : report.type === "daily" || report.type === "dailycard" ? (
            <Sun />
          ) : (
            <Leaf />
          )}
        </span>
        <small>
          {report.type === "lenormand"
            ? "LENORMAND"
            : report.type === "dailycard"
              ? "LÁ BÀI HÔM NAY"
              : methods.find((m) => m.id === report.type)?.tag}{" "}
          ·{" "}
          {new Date(report.date).toLocaleDateString("vi-VN")}
        </small>
        <h3>{report.title}</h3>
        <p>{report.subtitle}</p>
        <span className="text-link">
          Đọc lại <ArrowRight size={15} />
        </span>
      </button>
      <button
        className="delete-result"
        aria-label={`Xóa ${report.title}`}
        onClick={onDelete}
      >
        <Trash2 size={16} />
      </button>
    </article>
  );
}
