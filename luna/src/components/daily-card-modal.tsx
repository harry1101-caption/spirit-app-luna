"use client";

import Image from "next/image";
import { ArrowRight, Bookmark, Check, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cards } from "@/lib/engine";
import { dailyCardMessage } from "@/lib/daily-card";

export function DailyCardModal({
  open,
  onOpenChange,
  cardId,
  revealed,
  onReveal,
  onSave,
  onOpenTarot,
  saved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardId: number;
  revealed: boolean;
  onReveal: () => void;
  onSave: () => void;
  onOpenTarot: () => void;
  saved: boolean;
}) {
  const card = cards[cardId];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="luna-dialog sm:max-w-[560px]!"
        data-lenis-prevent
      >
        <DialogHeader>
          <DialogTitle>Lá bài hôm nay</DialogTitle>
          <DialogDescription>
            {revealed
              ? "Một thông điệp dành cho ngày hôm nay của bạn."
              : "Hít một hơi thật chậm, rồi chạm vào lá bài."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 pb-1">
          <button
            type="button"
            onClick={() => {
              if (!revealed) onReveal();
            }}
            disabled={revealed}
            aria-label={
              revealed ? card.vi : "Chạm để mở lá bài hôm nay của bạn"
            }
            className="group relative h-[292px] w-[170px] shrink-0 [perspective:1200px] disabled:cursor-default"
          >
            {/* Quầng sáng nhấp nháy mời chạm. Đặt ngoài khối lật để không bị xoay theo. */}
            {revealed ? null : (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 animate-pulse rounded-[30px] bg-[#a981d0]/40 blur-xl motion-reduce:animate-none"
              />
            )}
            <span
              className={`relative block h-full w-full transition-transform duration-700 ease-[cubic-bezier(.2,0,0,1)] [transform-style:preserve-3d] ${
                revealed ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* Mặt úp — dùng chung ảnh mặt sau với trang Tarot */}
              <span className="absolute inset-0 overflow-hidden rounded-2xl border border-[#baa0cb] shadow-[0_14px_34px_#6b4b8233] [backface-visibility:hidden] transition-transform duration-300 group-hover:not-disabled:-translate-y-1.5">
                <Image
                  src="/images/tarot-back.webp"
                  alt=""
                  fill
                  sizes="170px"
                  className="object-cover"
                  priority
                />
              </span>
              {/* Mặt ngửa */}
              <span className="absolute inset-0 overflow-hidden rounded-2xl border border-[#e8ddef] bg-[#fffaf9] shadow-[0_14px_34px_#6b4b8226] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Image
                  src={card.image}
                  alt={card.vi}
                  fill
                  sizes="170px"
                  className="object-cover"
                  priority
                />
              </span>
            </span>
          </button>

          {revealed ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div>
                <h3 className="font-[family-name:var(--font-serif-app)]! text-[23px]! leading-tight text-[#5d3f77]">
                  {card.vi}
                </h3>
                <p className="mt-1 text-[12px] text-[#6a5c7a]">{card.name}</p>
              </div>
              <p className="max-w-[420px] text-[15px] leading-[1.75] text-[#6c5878]">
                {dailyCardMessage(cardId)}
              </p>
              <p className="max-w-[420px] text-[13px] leading-[1.7] text-[#6a5c7a]">
                Một lá chỉ mở ra một góc. Nếu bạn đang mang một câu hỏi cụ thể,
                hãy trải bài đầy đủ để nhìn rộng hơn.
              </p>
              <div className="mt-1 flex w-full flex-col items-center gap-2 sm:flex-row sm:justify-center">
                <Button onClick={onOpenTarot} className="w-full sm:w-auto">
                  <Layers size={17} strokeWidth={1.4} />
                  Trải bài Tarot đầy đủ
                  <ArrowRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  onClick={onSave}
                  disabled={saved}
                  className="w-full sm:w-auto"
                >
                  {saved ? <Check size={16} /> : <Bookmark size={16} />}
                  {saved ? "Đã lưu" : "Lưu lại"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-[#6a5c7a]">
              Chạm vào lá bài để mở
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
