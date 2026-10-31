import Image from "next/image";
import { palmLines, type PalmLine } from "@/lib/chi-tay";

/**
 * Hình minh hoạ bốn đường chỉ tay.
 *
 * Trước đây dựng bằng SVG tự vẽ, nhưng vẽ bàn tay bằng path thì không ra hình
 * tử tế. Giờ dùng tranh minh hoạ, giữ nguyên thứ tự màu để `PalmLegend` khớp
 * đúng với tranh.
 *
 * Tranh vẽ cho bàn tay PHẢI (ngón cái bên trái khi lòng bàn tay hướng về
 * người xem). Tay trái là ảnh gương — lật bằng `-scale-x-100`.
 */

/** Màu lấy từ chính tranh minh hoạ, để chú giải không nói một đằng tranh một nẻo. */
const lineColor: Record<PalmLine, string> = {
  "Tâm Đạo": "#e0322a",
  "Trí Đạo": "#2a6fdc",
  "Sinh Đạo": "#0f8a45",
  "Vận Mệnh": "#e5a21f",
};

export function PalmDiagram({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/palm-lines.png"
      alt="Hình minh hoạ bốn đường chỉ tay trên lòng bàn tay phải"
      width={555}
      height={640}
      className={className}
      priority={false}
    />
  );
}

export function PalmLegend({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex list-none flex-col gap-1.5 p-0 ${className}`}>
      {palmLines.map((name) => (
        <li key={name} className="flex items-center gap-2 text-xs text-[#5b5276]">
          <span
            className="h-0.5 w-5 shrink-0 rounded-full"
            style={{ background: lineColor[name] }}
          />
          {name}
          {name === "Vận Mệnh" ? (
            <span className="text-[#6a5c7a]">· nhiều người không có</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
