"use client";
import { useRef, type ReactNode } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  Hand,
  Layers,
  Orbit,
  Compass,
  Heart,
  Leaf,
  Moon,
  Sparkle,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  intents,
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
const intentIcons = [Sun, Heart, BriefcaseBusiness, Leaf, Compass];
const toolGroups = [
  {
    title: "Bói bài",
    icon: Layers,
    tools: [
      { title: "Xem Tarot cùng AI", description: "Lắng nghe góc nhìn từ ba lá bài.", icon: Layers, action: "tarot" },
      { title: "Bói bài Lenormand", description: "Đọc những biểu tượng đời thường.", icon: Compass, action: "lenormand" },
      { title: "Bói bài Tây", description: "Một cách khác để soi chiếu câu hỏi.", icon: Heart },
      { title: "Lá bài hôm nay", description: "Một lá bài cho ngày mới.", icon: Sun },
    ],
  },
  {
    title: "Lá số & Ngày sinh",
    icon: Orbit,
    tools: [
      { title: "Xem Tử Vi", description: "Lập và luận giải lá số của bạn.", icon: Orbit, action: "tuvi" },
      { title: "Bát tự (Tứ trụ)", description: "Tìm hiểu bốn trụ ngày giờ sinh.", icon: Compass },
      { title: "Thần số học", description: "Khám phá những con số cá nhân.", icon: Sparkle },
      { title: "Chiêm tinh", description: "Thông điệp theo cung hoàng đạo.", icon: Moon, action: "daily" },
      { title: "Human Design", description: "Tìm hiểu bản đồ năng lượng.", icon: CircleHelp },
    ],
  },
  {
    title: "Soi tướng & Hình ảnh",
    icon: Hand,
    tools: [
      { title: "Xem chỉ tay", description: "Quan sát dấu hiệu trên bàn tay.", icon: Hand },
      { title: "Nhân tướng học", description: "Tìm hiểu các nét trên khuôn mặt.", icon: UserRound },
      { title: "Khuôn mặt kiếp trước", description: "Một trải nghiệm khám phá hình ảnh.", icon: UsersRound },
      { title: "Giải mã giấc mơ", description: "Ghi lại những biểu tượng trong mơ.", icon: Moon },
    ],
  },
  {
    title: "Gieo quẻ & Lễ Việt Nam",
    icon: Leaf,
    tools: [
      { title: "Xin Xăm Quan Âm", description: "Một lời gợi mở để suy ngẫm.", icon: Sparkles },
      { title: "Xem Kinh Dịch", description: "Khám phá ý nghĩa của các quẻ.", icon: BookOpen },
      { title: "Cung mặt trăng", description: "Tìm hiểu thế giới cảm xúc.", icon: Moon },
      { title: "Trắc nghiệm tính cách", description: "Hiểu rõ hơn xu hướng của bạn.", icon: UserRound, action: "personality" },
    ],
  },
] as const;
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
  onTuVi,
  onLenormand,
  onIntent,
  onExplore,
  date,
  sign,
  children,
}: {
  onStart: () => void;
  onMethod: (method: Method) => void;
  onTuVi: () => void;
  onLenormand: () => void;
  onIntent: (intent: string) => void;
  onExplore: () => void;
  date: string;
  sign: string;
  children: ReactNode;
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
        <div className="hero-editorial" data-reveal>
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
          <div className="hero-actions">
            <Button onClick={onStart}>
              Bắt đầu khám phá <ArrowRight size={19} />
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                document.getElementById("trai-nghiem")?.scrollIntoView({
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
        <div className="hero-pillars" data-reveal>
          {pillars.map((p) => (
            <button key={p.title} onClick={() => onMethod(p.method)}>
              <span className="pillar-icon">
                <p.icon size={23} strokeWidth={1.25} />
              </span>
              <strong>{p.title}</strong>
              <small>{p.text}</small>
            </button>
          ))}
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
          <Button onClick={() => onMethod("daily")}>
            Khám phá thông điệp hôm nay <ArrowRight size={18} />
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
              <button key={t.title} onClick={() => onMethod("daily")}>
                <t.icon size={27} strokeWidth={1.2} />
                <span>
                  <strong>{t.title}</strong>
                  <small>{t.text}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="below-hero">
        <section
          id="trai-nghiem"
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
                      <span className="tool-icon"><Icon size={29} strokeWidth={1.35} aria-hidden="true" /></span>
                      <span className="tool-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span>
                      {action ? <ArrowRight className="tool-arrow" size={16} aria-hidden="true" /> : <span className="tool-upcoming">Sắp ra mắt</span>}
                    </>;
                    return action ? (
                      <button className="tool-card is-available" key={tool.title} onClick={() => action === "tuvi" ? onTuVi() : action === "lenormand" ? onLenormand() : onMethod(action as Method)} aria-label={`Mở ${tool.title}`}>
                        {content}
                      </button>
                    ) : <div className="tool-card is-upcoming" key={tool.title}>{content}</div>;
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
        <section
          className="intention-section page-container"
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
          <div className="intention-heading">
            <span className="eyebrow">BẮT ĐẦU TỪ ĐIỀU BẠN CẦN</span>
            <h2 id="intention-title">
              Bạn đang muốn
              <br />
              <em>khám phá điều gì?</em>
            </h2>
            <p>
              Chọn điều đang ở trong tâm trí bạn.
              <br />
              Luna sẽ cùng bạn tìm một lối mở phù hợp.
            </p>
            <button className="text-link" onClick={onExplore}>
              Xem tất cả trải nghiệm <ArrowRight size={18} />
            </button>
            <blockquote>
              “Mỗi câu hỏi là một cánh cửa,
              <br />
              dẫn bạn đến gần hơn với chính mình.”
            </blockquote>
          </div>
          <div className="intention-choices">
            <div className="intention-options">
              {[1, 2, 3, 0, 4].map((i) => {
                const Icon = intentIcons[i];
                const description = [
                  "Thông điệp dành riêng cho ngày mới.",
                  "Thấu hiểu trái tim, kết nối sâu sắc hơn.",
                  "Tìm hướng đi phù hợp với năng lượng của bạn.",
                  "Hiểu rõ con người thật của bạn.",
                  "Mở thêm góc nhìn cho hành trình phía trước.",
                ][i];
                return (
                  <button
                    className={`intention-choice intention-choice-${i}`}
                    key={intents[i]}
                    onClick={() => onIntent(intents[i])}
                  >
                    <span className="intention-icon">
                      <Icon size={30} strokeWidth={1.15} />
                    </span>
                    <span className="intention-label">
                      <strong>{intents[i]}</strong>
                      <small>{description}</small>
                    </span>
                    <span className="intention-arrow">
                      <ArrowRight size={17} />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="intention-bottom">
              <div aria-hidden="true">
                <span />
                <Moon size={18} strokeWidth={1} />
                <Sparkles size={27} strokeWidth={1} />
                <Moon size={18} strokeWidth={1} />
                <span />
              </div>
              <p>LẮNG NGHE BẢN THÂN · SỐNG TRỌN VẸN HƠN</p>
            </div>
          </div>
        </section>
        <section className="web-library page-container" data-reveal>
          <div className="library-heading">
            <div>
              <span className="eyebrow">NHỮNG DẤU CHÂN TRÊN HÀNH TRÌNH</span>
              <h2>Khám phá của tôi</h2>
            </div>
            <Bookmark size={26} strokeWidth={1} />
          </div>
          {children}
        </section>
        <section className="closing-note page-container" data-reveal>
          <Sparkles size={22} strokeWidth={1} />
          <p>
            Thế giới rộng lớn ngoài kia.
            <br />
            <em>Một vũ trụ khác, ở ngay trong bạn.</em>
          </p>
          <button className="text-link" onClick={onStart}>
            Bắt đầu hành trình của bạn <ArrowRight size={17} />
          </button>
        </section>
      </div>
    </>
  );
}
