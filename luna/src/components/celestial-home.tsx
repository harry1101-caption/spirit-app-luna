"use client";
import { useRef } from "react";
import Image from "next/image";
import { IntentionIntro } from "@/components/intention-intro";
import { SectionDivider } from "@/components/section-divider";
import { TopicPicker, type Topic } from "@/components/topic-picker";
import { WhyLunara } from "@/components/why-lunara";
import { SiteFooter } from "@/components/site-footer";
import { FeedbackSection } from "@/components/feedback-section";
import { toolGroups } from "@/components/tool-groups";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Layers,
  Orbit,
  Compass,
  Heart,
  Leaf,
  Moon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  methods,
  zodiac,
  zodiacSymbols,
  type Method,
} from "@/lib/engine";
const pillars = [
  {
    icon: Moon,
    title: "Tarot",
    text: "Lắng nghe trực giác",
    method: "tarot" as Method,
  },
  {
    icon: Sparkles,
    title: "Chiêm tinh",
    text: "Hiểu rõ bản thân",
    method: "daily" as Method,
  },
  {
    icon: Leaf,
    title: "Phát triển",
    text: "Sống phiên bản tốt hơn",
    method: "personality" as Method,
  },
  {
    icon: Heart,
    title: "Kết nối",
    text: "Gần hơn với chính mình",
    method: "personality" as Method,
  },
];

export function ExperienceCard({
  method,
  index,
  onClick,
}: {
  method: (typeof methods)[number];
  index: number;
  onClick: () => void;
}) {
  const titles = [
    "Rút bài Tarot",
    "Chiêm tinh hằng ngày",
    "Khám phá tính cách",
  ];
  const copy = [
    "Khám phá những thông điệp ẩn sâu trong tâm hồn bạn.",
    "Cùng vũ trụ tìm hiểu năng lượng và cơ hội trong ngày của bạn.",
    "Hiểu rõ bản thân để sống chân thật và hạnh phúc hơn.",
  ];
  const Icon = [Layers, Orbit, Compass][index];
  return (
    <button
      className={`experience-card experience-${index}`}
      onClick={onClick}
      aria-label={`${titles[index]} — ${["Bắt đầu ngay", "Khám phá ngay", "Trắc nghiệm ngay"][index]}`}
    >
      <div className="experience-art">
        <Image
          src={`/images/discovery-${method.id}.webp`}
          alt=""
          fill
          sizes="(max-width: 760px) 90vw, (max-width: 1050px) 30vw, 420px"
        />
      </div>
      <div className="experience-copy">
        <span className="experience-pill">
          <Icon size={17} strokeWidth={1.4} />
          {["TAROT", "CHIÊM TINH", "TÍNH CÁCH"][index]}
        </span>
        <h3>{titles[index]}</h3>
        <p>{copy[index]}</p>
        <span className="experience-link">
          {["Bắt đầu ngay", "Khám phá ngay", "Trắc nghiệm ngay"][index]}{" "}
          <ArrowRight size={17} />
        </span>
      </div>
    </button>
  );
}
export function CelestialHome({
  onStart,
  onMethod,
  onTool,
  onTopic,
  date,
  sign,
}: {
  onStart: () => void;
  onMethod: (method: Method) => void;
  /** Một cửa duy nhất cho mọi công cụ — xem openTool trong luna-app. */
  onTool: (action: string) => void;
  onTopic: (topic: Topic) => void;
  date: string;
  sign: string;
}) {
  const visual = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent<HTMLElement>) {
    if (
      e.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const rect = e.currentTarget.getBoundingClientRect();
    visual.current?.style.setProperty(
      "--pointer-x",
      `${((e.clientX - rect.left) / rect.width - 0.5) * -9}px`,
    );
    visual.current?.style.setProperty(
      "--pointer-y",
      `${((e.clientY - rect.top) / rect.height - 0.5) * -7}px`,
    );
  }
  return (
    <>
      <div className="celestial-world" ref={visual} aria-hidden="true">
        <Image
          src="/images/celestial-hero.webp"
          fill
          loading="eager"
          sizes="100vw"
          alt=""
        />
      </div>
      <section
        className="web-hero"
        aria-labelledby="hero-title"
        onPointerMove={move}
        onPointerLeave={() => {
          visual.current?.style.setProperty("--pointer-x", "0px");
          visual.current?.style.setProperty("--pointer-y", "0px");
        }}
      >
        {/* Khung kính mờ bọc toàn bộ nội dung hero và canh giữa. Trước đây
            chữ nằm trần sát mép trái, đè lên hình nền nên chỗ đậm chỗ nhạt,
            khó đọc. Dùng `!` vì .hero-editorial, .hero-actions và
            .hero-pillars đều nằm ngoài cascade layer. */}
        <div className="hero-glass relative z-[2] mx-auto w-full max-w-[880px] rounded-[26px] border border-white/55 bg-white/38 px-[clamp(24px,4vw,56px)] py-[clamp(16px,1.8vw,26px)] shadow-[0_18px_50px_#6b4b8218] backdrop-blur-xl">
        <div className="hero-editorial w-full! text-center" data-reveal>
          <p className="hero-eyebrow">
            KHÁM PHÁ · THẤU HIỂU · SỐNG TRỌN VẸN HƠN
          </p>
          <h1 id="hero-title">
            Khám phá thế giới
            <br />
            bên trong bạn
          </h1>
          <p className="hero-description">
            Mỗi lá bài, mỗi vì sao, mỗi trải nghiệm đều mở ra
            <br className="desktop-break" /> một góc nhìn mới về bản thân và
            cuộc sống.
          </p>
          <div className="hero-actions justify-center! flex-wrap!">
            <Button onClick={onStart}>
              Bắt đầu khám phá <ArrowRight size={19} />
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                document.getElementById("cong-cu-hieu-minh")?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "auto"
                    : "smooth",
                })
              }
            >
              Xem các trải nghiệm <ArrowRight size={19} />
            </Button>
          </div>
        </div>
        <div
          className="hero-pillars static! mt-4 justify-center! gap-0! border-t border-[#e6d9ef]/70 pt-4"
          data-reveal
        >
          {pillars.map((p) => (
            <button key={p.title} onClick={() => onMethod(p.method)} className="items-center! text-center! after:right-0!">
              <span className="pillar-icon mx-auto!">
                <p.icon size={23} strokeWidth={1.25} />
              </span>
              <strong>{p.title}</strong>
              <small>{p.text}</small>
            </button>
          ))}
        </div>
        </div>
      </section>
      <section
        className="daily-feature page-container"
        data-reveal
        aria-label="Chiêm tinh hôm nay"
      >
        <div className="daily-feature-copy">
          <span className="daily-date">
            <CalendarDays size={16} />
            {date || "Một ngày mới, một góc nhìn mới"}
          </span>
          <h2>Hôm nay có điều gì dành cho bạn?</h2>
          <p>Vũ trụ đang nhắn nhủ điều đặc biệt dành riêng cho bạn.</p>
          <Button
            className="daily-message-cta group"
            onClick={() => onTool("dailycard")}
            aria-haspopup="dialog"
          >
            Khám phá thông điệp hôm nay
            <ArrowRight
              size={18}
              className="transition-transform duration-300 ease-out group-hover:rotate-[360deg]"
            />
          </Button>
        </div>
        <button
          className="daily-zodiac"
          onClick={() => onMethod("daily")}
          aria-label={`Xem chiêm tinh ${sign}`}
        >
          <Image
            src="/images/zodiac-bust.png"
            alt="Tượng nữ thần với mái tóc tím và quầng sao vàng"
            width={280}
            height={280}
          />
          <span className="zodiac-sign">
            {zodiacSymbols[zodiac.indexOf(sign)]}
          </span>
          <strong>{sign}</strong>
          <small>Góc nhìn dành riêng cho bạn</small>
        </button>
        <div className="daily-message">
          <h3>
            <Sparkles size={22} /> Thông điệp hôm nay
          </h3>
          <button className="message-quote" onClick={() => onMethod("daily")}>
            <span className="quote-mark">“</span>
            <p>
              Hãy tin vào nhịp độ riêng của bạn.
              <br />
              Mỗi bước nhỏ đều có ý nghĩa trên
              <br className="desktop-break" /> hành trình trở về với chính mình.
            </p>
            <ArrowRight size={20} />
          </button>
          <div className="daily-topics">
            {[
              { icon: Heart, title: "Tình yêu", text: "Mở lòng hơn" },
              {
                icon: BriefcaseBusiness,
                title: "Sự nghiệp",
                text: "Thêm góc nhìn mới",
              },
              { icon: Leaf, title: "Cuộc sống", text: "Cân bằng và tích cực" },
            ].map((t) => (
              <div key={t.title} className="daily-topic">
                <t.icon size={27} strokeWidth={1.2} />
                <span>
                  <strong>{t.title}</strong>
                  <small>{t.text}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="below-hero">
        <section
          id="cong-cu-hieu-minh"
          className="experiences-section page-container"
          data-reveal
        >
          <div className="experience-section-heading">
            <div>
              <h2>
                Các công cụ để hiểu mình hơn
              </h2>
              <p>Những công cụ giúp bạn soi chiếu nội tâm, thấu hiểu bản thân và sống trọn vẹn hơn</p>
            </div>
          </div>
          <div className="tool-groups">
            {toolGroups.map((group) => (
              <section className="tool-group" key={group.title} aria-label={group.title}>
                <div className="tool-group-heading">
                  <h3><group.icon size={23} strokeWidth={1.4} aria-hidden="true" />{group.title}</h3>
                </div>
                <div className="tool-list">
                  {group.tools.map((tool) => {
                    const Icon = tool.icon;
                    const action = "action" in tool ? tool.action : undefined;
                    const content = <>
                      <span className={`tool-icon${"bare" in tool && tool.bare ? " bg-transparent!" : ""}${"clip" in tool && tool.clip ? " overflow-hidden" : ""}`}><Icon size={("bare" in tool && tool.bare) || ("clip" in tool && tool.clip) ? 54 : 29} strokeWidth={1.35} aria-hidden="true" /></span>
                      <span className="tool-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span>
                      {action ? <ArrowRight className="tool-arrow" size={16} aria-hidden="true" /> : <span className="tool-upcoming">Sắp ra mắt</span>}
                    </>;
                    return action ? (
                      <button className="tool-card is-available" key={tool.title} onClick={() => onTool(action)} aria-label={`Mở ${tool.title}`}>
                        {content}
                      </button>
                    ) : <div className="tool-card is-upcoming" key={tool.title}>{content}</div>;
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
        <SectionDivider index={0} className="mt-[46px]" />
        <section
          className="intention-section page-container mt-[46px]!"
          data-reveal
          aria-labelledby="intention-title"
        >
          <Image
            className="intention-background"
            src="/images/intention-sanctuary.webp"
            alt=""
            fill
            sizes="(max-width: 760px) 100vw, 1280px"
          />
          <IntentionIntro onStartTarot={() => onMethod("tarot")} />
        </section>
        <SectionDivider index={1} className="mt-[46px]" />
        <FeedbackSection />
        {/* Dải cuối trang: "Vì sao chọn Lunara" và lời kết dùng CHUNG một nền
            trải hết bề ngang, nên phải bọc lại thành một khối. Mẹo full-bleed
            (w-screen + dịch trái nửa màn hình) là cách repo vẫn dùng để thoát
            khỏi bề ngang bị bó của luồng trang. */}
        <SectionDivider index={2} className="mt-[46px]" />
        <div className="relative mt-[46px] overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[#f3edfa] bg-[url('/images/celestial-band.webp')] bg-cover bg-center [mask-image:linear-gradient(#0000,#000_9%,#000_88%,#0000)]"
          />
          <WhyLunara />
          <TopicPicker onPick={onTopic} />
        </div>
        <SiteFooter />
      </div>
    </>
  );
}
