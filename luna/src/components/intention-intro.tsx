"use client";

import Image from "next/image";
import { ArrowRight, Compass, Heart, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Heart,
    title: "Hiểu rõ hơn về bản thân",
    text: "Khám phá cảm xúc, mong muốn và thế mạnh của bạn.",
  },
  {
    icon: Compass,
    title: "Nhận góc nhìn mới",
    text: "Giúp bạn nhìn vấn đề đa chiều, rõ ràng hơn.",
  },
  {
    icon: Sprout,
    title: "Tìm định hướng phù hợp",
    text: "Gợi mở những lựa chọn tích cực cho tương lai.",
  },
];

/**
 * Nội dung của `.intention-section` trên trang chủ, dựng theo thiết kế Diffui.
 * Trả về đúng hai phần tử để làm hai cột của grid sẵn có trong section —
 * nền và khung của section giữ nguyên.
 *
 * `!` trên font của nút vì globals.css đặt `button { font-family/size: inherit }`
 * ngoài cascade layer nên utility Tailwind thua về thứ tự layer.
 */
export function IntentionIntro({ onStartTarot }: { onStartTarot: () => void }) {
  return (
    // Panel kính mờ phủ lên nền mây, chiếm cả hai cột của grid trong section.
    <div className="col-span-full grid items-center gap-9 rounded-[18px] border border-white/55 bg-white/40 p-6 shadow-[0_14px_40px_#6b4b8216] backdrop-blur-xl sm:p-9 lg:grid-cols-2 lg:gap-14 lg:p-11">
      <div className="min-w-0 self-center">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium tracking-[0.28em] text-[#b0915f] uppercase">
            Khám phá bản thân
          </span>
          <span className="h-px w-14 bg-[#d3bb94]" />
        </div>

        <h2
          id="intention-title"
          className="mt-5 text-[38px] leading-[1.14]! tracking-[-0.5px] text-[#1d1133] sm:text-[47px]"
        >
          Bạn đang muốn
          <br />
          <em className="text-[#a082b3]">khám phá điều gì?</em>
        </h2>

        <p className="mt-5 max-w-[450px] text-[15px] leading-[1.75] text-[#5b5276] sm:text-[16px]">
          Tarot là công cụ giúp bạn lắng nghe trực giác, nhìn nhận vấn đề từ góc
          nhìn mới, và tìm thấy định hướng phù hợp cho hiện tại.
        </p>

        <ul className="mt-8 flex list-none flex-col gap-5 p-0">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#e0d5f0] bg-white/70 text-[#7d55a8]">
                <Icon size={21} strokeWidth={1.5} />
              </span>
              <span className="min-w-0 pt-1.5">
                <strong className="block font-[family-name:var(--font-serif-app)] text-[17px] font-semibold text-[#281b44]">
                  {title}
                </strong>
                <small className="mt-1 block text-[14px] leading-[1.6] text-[#6b6287]">
                  {text}
                </small>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-9 flex items-center gap-4">
          <span className="h-px w-10 shrink-0 bg-[#d9c4a4]" />
          <blockquote className="m-0 font-[family-name:var(--font-serif-app)] text-[14px] leading-[1.7] text-[#6f5f8f] italic sm:text-[15px]">
            “Mỗi lá bài là một lời nhắn từ vũ trụ,
            <br />
            để bạn lắng nghe chính mình nhiều hơn.”
          </blockquote>
        </div>
      </div>

      <div className="min-w-0 self-center">
        <div className="relative mx-auto flex h-[320px] w-full max-w-[440px] items-center justify-center sm:h-[372px]">
          <FanCard className="absolute left-[3%] h-[234px] w-[156px] -rotate-[15deg] sm:h-[270px] sm:w-[180px]" />
          <FanCard className="absolute right-[3%] h-[234px] w-[156px] rotate-[15deg] sm:h-[270px] sm:w-[180px]" />
          <FanCard className="relative z-10 h-[280px] w-[187px] sm:h-[324px] sm:w-[216px]" />
        </div>

        {/* Dùng Button để lấy đúng gradient và shadow của app.
            Hover của app là nhấc nút lên 2px (`[data-slot="button"]:hover` trong
            globals.css); ở đây tắt đi bằng `hover:translate-y-0!` — rule đó nằm
            ngoài cascade layer nên thiếu dấu `!` là không đè được.

            Phải là `transform-none` chứ KHÔNG phải `translate-y-0`: Tailwind v4
            viết dịch chuyển vào property `translate`, còn globals.css dùng
            `transform: translateY(-2px)`. Hai property độc lập nhau, đặt
            `translate: 0` không huỷ được `transform`, nút vẫn nhấc lên.

            Thay vào đó cho mũi tên xoay một vòng, giống nút đóng của modal. */}
        <Button
          onClick={onStartTarot}
          className="group mt-8 h-[66px]! w-full rounded-full! font-[family-name:var(--font-serif-app)]! text-[21px]! hover:transform-none! hover:shadow-[0_8px_22px_#5d387c0d]!"
        >
          Bắt đầu xem Tarot
          <ArrowRight
            size={22}
            strokeWidth={1.6}
            className="transition-transform duration-300 ease-out group-hover:rotate-[360deg]"
          />
        </Button>

        <div className="mt-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#d9c4a4]/70" />
          <p className="shrink-0 text-center text-[12px] leading-[1.6] text-[#6b6287] sm:text-[13px]">
            Chỉ cần đặt câu hỏi, rút bài và đón nhận thông điệp dành cho bạn
          </p>
          <span className="h-px flex-1 bg-[#d9c4a4]/70" />
        </div>
      </div>
    </div>
  );
}

function FanCard({ className }: { className: string }) {
  return (
    <span
      className={`overflow-hidden rounded-[13px] border border-[#e0cda6] shadow-[0_14px_32px_#5c3f8030] ${className}`}
    >
      <Image
        src="/images/tarot-back.webp"
        alt=""
        fill
        sizes="216px"
        className="object-cover"
      />
    </span>
  );
}
