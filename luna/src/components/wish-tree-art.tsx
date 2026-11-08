"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Heart, Lock } from "lucide-react";
import { letterColors, topicOf, type TreeWish } from "@/lib/wish-tree";

/**
 * Hình cây + những thẻ ước treo trên cành.
 *
 * Cây là ảnh minh hoạ (public/images/wish-tree.webp, 1448×1086, nền trong suốt).
 * Điểm treo thẻ đo tay theo toạ độ pixel của chính ảnh đó (ANCHORS) và đặt bằng %
 * trên khung cùng tỉ lệ, nên khớp cành ở mọi bề ngang. Đổi ảnh thì phải đo lại.
 */

const VIEW_W = 1448;
const VIEW_H = 1086;

type Point = [number, number];

/**
 * Điểm treo trên cành, xếp theo thứ tự lấp đầy: giữa tán trước, rìa sau — cây ít
 * điều ước vẫn trông cân chứ không dồn hết sang một bên.
 */
export const ANCHORS: Point[] = [
  [800, 430], [640, 420], [450, 410], [990, 420], [620, 260], [880, 270], [470, 650], [980, 640],
  [290, 505], [1180, 560], [1110, 410], [330, 640], [1080, 660], [540, 540], [900, 540], [720, 270],
];

/** Phần cây tĩnh (không có thẻ). Lắc cây thì cả ảnh nghiêng nhẹ quanh gốc. */
function TreeImage({ shaking }: { shaking: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0"
      style={{ transformOrigin: "50% 92%" }}
      animate={shaking && !reduce ? { rotate: [0, -1.6, 1.4, -0.8, 0.4, 0] } : { rotate: 0 }}
      transition={{ duration: 1.1, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <Image
        src="/images/wish-tree.webp"
        alt=""
        width={VIEW_W}
        height={VIEW_H}
        sizes="(max-width: 820px) 100vw, 760px"
        loading="eager"
        className="h-full w-full object-contain select-none"
        draggable={false}
      />
    </motion.div>
  );
}

/** Hình phong thư. Dấu niêm là trái tim (công khai) hoặc ổ khoá (riêng tư). Dùng trên cây và ở ô chọn màu. */
export function LetterIcon({
  colors,
  isPublic = true,
  className = "w-10 sm:w-12",
}: {
  colors: { paper: string; ink: string; seal: string };
  isPublic?: boolean;
  className?: string;
}) {
  return (
    <span className={`relative block rounded-[4px] ${className}`}>
      <svg viewBox="0 0 48 34" className="block w-full drop-shadow-[0_4px_8px_#5d3d7140]" aria-hidden="true">
        <rect x="1" y="1" width="46" height="32" rx="4" fill={colors.paper} stroke="#fff" strokeWidth="1.5" />
        <path d="M2.5 32 L19 17 M45.5 32 L29 17" stroke={colors.ink} strokeOpacity="0.22" strokeWidth="1.2" fill="none" />
        <path d="M2.5 3 L24 20 L45.5 3" stroke={colors.ink} strokeOpacity="0.45" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
        <circle cx="24" cy="20" r="6.5" fill={colors.seal} stroke="#fff" strokeWidth="1.2" />
      </svg>
      <span className="absolute top-[59%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 text-white">
        {isPublic ? <Heart size={8} fill="currentColor" strokeWidth={0} /> : <Lock size={8} strokeWidth={3} />}
      </span>
    </span>
  );
}

export function WishTreeArt({
  wishes,
  mineIds,
  freshId,
  shaking,
  onOpen,
}: {
  wishes: TreeWish[];
  mineIds: Set<string>;
  /** Điều ước vừa treo: bay từ trên xuống thay vì hiện tại chỗ */
  freshId?: string | null;
  shaking: boolean;
  onOpen: (wish: TreeWish) => void;
}) {
  const reduce = useReducedMotion();
  const shown = wishes.slice(0, ANCHORS.length);
  return (
    <div className="relative mx-auto w-full max-w-[760px]" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
      <TreeImage shaking={shaking} />
      {shown.map((wish, i) => {
        const [x, y] = ANCHORS[i];
        const stringLength = 12 + ((i * 7) % 3) * 8;
        const fresh = wish.id === freshId;
        const label = `Lá thư ${wish.is_public ? "" : "riêng tư "}về ${topicOf(wish.topic).label}${mineIds.has(wish.id) ? " (của bạn)" : ""}`;
        return (
          <motion.button
            key={wish.id}
            type="button"
            onClick={() => onOpen(wish)}
            aria-label={label}
            title={label}
            className="absolute flex -translate-x-1/2 cursor-pointer flex-col items-center rounded-[4px] outline-none focus-visible:ring-2 focus-visible:ring-[#ac88cf]"
            style={{ left: `${(x / VIEW_W) * 100}%`, top: `${(y / VIEW_H) * 100}%`, transformOrigin: "50% 0", zIndex: fresh ? 5 : 1 }}
            // Thư thường hiện ngay (không fade) để không bao giờ kẹt ở trạng thái vô hình;
            // chỉ thư vừa treo mới bay từ trên xuống.
            initial={fresh && !reduce ? { y: -160, opacity: 0, scale: 1.6 } : false}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1, rotate: shaking ? [0, -14, 12, -6, 0] : [-3, 3, -3] }}
            transition={
              shaking
                ? { duration: 1.1, ease: "easeInOut" }
                : {
                    opacity: { duration: 0.4 },
                    y: { type: "spring", stiffness: 90, damping: 12 },
                    scale: { duration: 0.6 },
                    rotate: { duration: 3.6 + (i % 4) * 0.6, repeat: Infinity, ease: "easeInOut", delay: (i % 5) * 0.3 },
                  }
            }
            whileHover={reduce ? undefined : { scale: 1.15 }}
          >
            <span className="block w-px bg-[#8a6a80]" style={{ height: stringLength }} />
            <LetterIcon colors={letterColors(wish)} isPublic={wish.is_public} />
          </motion.button>
        );
      })}
    </div>
  );
}
