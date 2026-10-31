"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toolGroups } from "@/components/tool-groups";

/**
 * Menu "Trải nghiệm" trên header — mở khi rê chuột, nhưng KHÔNG chỉ dựa vào hover.
 *
 * Màn cảm ứng không có hover, và bàn phím cũng không. Nên nút vẫn bấm được,
 * vẫn mở bằng Enter/Space, đóng bằng Escape hoặc khi focus rời khỏi menu.
 */
export function AllToolsMenu({
  onPick,
  isActive,
}: {
  onPick: (action: string) => void;
  isActive: (action: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClickAway = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClickAway);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClickAway);
    };
  }, [open]);

  // Trễ một nhịp khi rê chuột ra, để con trỏ kịp đi từ nút xuống menu.
  const hover = (next: boolean) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (next) setOpen(true);
    else closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="nav-item"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        Trải nghiệm
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full left-1/2 z-50 mt-2 w-[min(90vw,680px)] -translate-x-1/2 rounded-2xl border border-[#e7d9f0] bg-[#fffbfaf2] p-4 shadow-[0_18px_46px_#6b4b8226] backdrop-blur-xl"
        >
          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            {toolGroups.map((group) => (
              <section key={group.title}>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-[#9a7ba8] uppercase">
                  <group.icon size={14} strokeWidth={1.5} aria-hidden="true" />
                  {group.title}
                </p>
                <ul className="flex list-none flex-col p-0">
                  {group.tools.map((tool) => {
                    const action = "action" in tool ? tool.action : undefined;
                    const Icon = tool.icon;
                    const bare = "bare" in tool && tool.bare;
                    return (
                      <li key={tool.title}>
                        {action ? (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setOpen(false);
                              onPick(action);
                            }}
                            className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-[#f3eef8] ${
                              isActive(action)
                                ? "bg-[#eae0f7] font-medium text-[#5d3f77]"
                                : "text-[#5b5276]"
                            }`}
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                              <Icon size={bare ? 26 : 17} strokeWidth={1.4} aria-hidden="true" />
                            </span>
                            {tool.title}
                          </button>
                        ) : (
                          <span className="flex w-full items-center gap-2.5 px-2 py-1.5 text-[13px] text-[#a397b0]">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center opacity-50">
                              <Icon size={bare ? 26 : 17} strokeWidth={1.4} aria-hidden="true" />
                            </span>
                            {tool.title}
                            <span className="ml-auto shrink-0 text-xs">Sắp ra mắt</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
