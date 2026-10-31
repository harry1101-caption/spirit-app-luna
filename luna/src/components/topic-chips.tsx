"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TopicChip = { label: string; icon: LucideIcon };

/**
 * Hàng chọn chủ đề dùng chung cho Tarot và Lenormand.
 * Grid để mọi chip rộng bằng nhau và cao bằng nhau, không phụ thuộc độ dài nhãn.
 */
export function TopicChips({
  topics,
  value,
  columns,
  onSelect,
}: {
  topics: readonly TopicChip[];
  value: string;
  columns: string;
  onSelect: (label: string) => void;
}) {
  return (
    <div className={cn("grid gap-1.5", columns)}>
      {topics.map(({ label, icon: Icon }) => {
        const selected = value === label;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={selected}
            title={label}
            onClick={() => onSelect(label)}
            className={cn(
              "flex h-10 w-full min-w-0 items-center justify-center gap-1.5 rounded-full border px-3",
              // `!` vì globals.css đặt `button { font-family/font-size: inherit }` ngoài cascade layer.
              "font-[family-name:var(--font-serif-app)]! text-[13px]! leading-tight transition-colors",
              selected
                ? "border-[#ac88cf] bg-[#eae0f7] text-[#744f93]"
                : "border-[#e4d6f2] bg-[#f6f0fd] text-[#795493] hover:border-[#c9a9e0]",
            )}
          >
            <Icon size={15} strokeWidth={1.4} className="shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
