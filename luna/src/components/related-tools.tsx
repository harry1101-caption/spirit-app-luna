"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toolGroups, toolRoutes as routes } from "@/components/tool-groups";

/**
 * Gợi ý feature liên quan, hiện ở cuối trang kết quả.
 *
 * Quan hệ "liên quan" lấy thẳng từ `toolGroups`: cùng nhóm là liên quan. Nhờ
 * vậy không phải nuôi một bảng ánh xạ viết tay — thêm feature mới vào nhóm là
 * nó tự xuất hiện ở gợi ý của các feature anh em.
 *
 * Dùng <Link> chứ không phải nút: bấm giữa mở tab mới, chuột phải copy link
 * được, và không cần truyền callback điều hướng xuyên qua nhiều lớp component.
 *
 * Khối này phải nằm NGOÀI thẻ `.experience-surface`, nhưng cái quyết định có
 * kết quả hay chưa lại nằm TRONG flow ở bên trong thẻ. Nên có `RelatedToolsSlot`
 * bọc quanh thẻ, còn flow chỉ gọi `useRelatedTools` — tránh phải luồn prop
 * "đã có kết quả chưa" qua từng feature một.
 */

const SlotContext = createContext<((action: string | null) => void) | null>(null);

/**
 * Bọc quanh `.experience-surface`: gợi ý hiện ngay dưới thẻ, ngoài thẻ.
 *
 * `panel` phải là đúng class thẻ mà trang đó đang dùng cho khối kết quả — mỗi
 * trang một chiều rộng khác nhau (`.tarot-setup-panel` 820px căn giữa,
 * `.experience-surface` 1080px), nên tự đặt một con số ở đây là chắc chắn lệch.
 */
export function RelatedToolsSlot({
  children,
  panel = "tarot-setup-panel",
}: {
  children: ReactNode;
  panel?: string;
}) {
  const [action, setAction] = useState<string | null>(null);
  return (
    <SlotContext.Provider value={setAction}>
      {children}
      {action ? (
        <div className={`${panel} mt-5!`}>
          <RelatedTools current={action} />
        </div>
      ) : null}
    </SlotContext.Provider>
  );
}

/** Gọi trong flow: truyền `action` khi đã có kết quả, `null` khi còn ở form. */
export function useRelatedTools(action: string | null) {
  const setAction = useContext(SlotContext);
  useEffect(() => {
    setAction?.(action);
    return () => setAction?.(null);
  }, [action, setAction]);
}

export function RelatedTools({
  current,
  className = "",
}: {
  /** `action` của feature đang xem, để loại nó khỏi danh sách. */
  current: string;
  className?: string;
}) {
  const group = toolGroups.find((g) =>
    g.tools.some((t) => "action" in t && t.action === current),
  );
  if (!group) return null;

  const siblings = group.tools.filter(
    (t) => "action" in t && t.action && t.action !== current && routes[t.action],
  );
  if (!siblings.length) return null;

  return (
    <section className={className}>
      <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">
        Cùng nhóm {group.title.toLowerCase()}
      </p>
      <p className="mt-1 text-[13px] leading-[1.7] text-[#5b5276]">
        Mỗi hệ soi bạn từ một góc khác. Thử thêm một góc nữa xem sao.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {siblings.map((tool) => {
          const action = (tool as { action: string }).action;
          const Icon = tool.icon;
          const bare = "bare" in tool && tool.bare;
          return (
            <Link
              key={tool.title}
              href={routes[action]}
              className="group flex items-center gap-3 rounded-2xl border border-[#e8ddef] bg-white/60 p-3 transition-colors hover:border-[#ac88cf] hover:bg-[#faf7ff]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                <Icon size={bare ? 34 : 20} strokeWidth={1.4} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-[14px] font-medium text-[#281b44]">
                  {tool.title}
                </strong>
                <small className="block text-xs leading-[1.5] text-[#5b5276]">
                  {tool.description}
                </small>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-[#9a8cab] transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
