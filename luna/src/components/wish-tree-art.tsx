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
/** Tỉ lệ khung cây — dùng cho khung chờ để trang không nhảy khi cây hiện ra. */
export const TREE_ASPECT = `${VIEW_W} / ${VIEW_H}`;

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

/*
 * Lớp trang trí chuyển động quanh cây: ánh sao lấp lánh và cánh hoa rơi chầm chậm.
 * Toạ độ cố định (không random) để lần nào mở cũng giống nhau và không lệch khi render lại.
 * Nằm dưới lớp thư, không bắt sự kiện chuột; người dùng bật giảm chuyển động thì ẩn hẳn.
 */
const SPARKLES: { x: number; y: number; size: number; delay: number; duration: number }[] = [
  { x: 10, y: 22, size: 10, delay: 0, duration: 3.2 },
  { x: 88, y: 18, size: 12, delay: 1.1, duration: 3.8 },
  { x: 22, y: 8, size: 8, delay: 2.0, duration: 2.9 },
  { x: 76, y: 6, size: 9, delay: 0.6, duration: 3.4 },
  { x: 6, y: 48, size: 8, delay: 1.7, duration: 3.1 },
  { x: 94, y: 44, size: 10, delay: 2.4, duration: 3.6 },
  { x: 14, y: 70, size: 7, delay: 0.9, duration: 2.8 },
  { x: 86, y: 72, size: 8, delay: 1.5, duration: 3.3 },
  { x: 50, y: 4, size: 7, delay: 2.8, duration: 3.0 },
  { x: 34, y: 30, size: 6, delay: 3.3, duration: 2.7 },
  { x: 66, y: 28, size: 6, delay: 0.3, duration: 3.5 },
];
const PETALS: { x: number; drift: number; delay: number; duration: number; size: number }[] = [
  { x: 24, drift: -5, delay: 0, duration: 9, size: 10 },
  { x: 40, drift: 6, delay: 2.5, duration: 10.5, size: 8 },
  { x: 58, drift: -4, delay: 5, duration: 9.5, size: 9 },
  { x: 72, drift: 5, delay: 1.2, duration: 11, size: 8 },
  { x: 32, drift: 7, delay: 6.5, duration: 10, size: 7 },
  { x: 64, drift: -6, delay: 8, duration: 9, size: 10 },
];

function Ambient() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SPARKLES.map((s, i) => (
        <motion.svg
          key={`s${i}`}
          viewBox="0 0 20 20"
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" fill="#ffe2a0" />
        </motion.svg>
      ))}
      {PETALS.map((p, i) => (
        <motion.svg
          key={`p${i}`}
          viewBox="0 0 12 8"
          className="absolute"
          style={{ left: `${p.x}%`, width: p.size, height: p.size * 0.66 }}
          initial={{ opacity: 0, top: "24%", x: 0, rotate: 0 }}
          animate={{ opacity: [0, 0.9, 0.9, 0], top: ["24%", "88%"], x: [0, p.drift * 6, p.drift * 12], rotate: [0, 180, 360] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <ellipse cx="6" cy="4" rx="6" ry="3.4" fill="#f6c6d8" />
          <ellipse cx="6" cy="4" rx="3" ry="1.4" fill="#fbe1ea" />
        </motion.svg>
      ))}
    </div>
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
    <div
      className="relative mx-auto w-full max-w-[760px]"
      style={{ aspectRatio: TREE_ASPECT }}
    >
      <TreeImage shaking={shaking} />
      {/* Sau ảnh cây để cánh hoa rơi trước tán lá; thư render sau nên vẫn nằm trên cùng */}
      <Ambient />
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
            // chỉ thư vừa treo mới bay từ trên xuống. KHÔNG dùng initial={false}: motion sẽ
            // nhảy thẳng tới keyframe đầu và không chạy vòng đung đưa lặp lại.
            initial={fresh && !reduce ? { y: -160, opacity: 0, scale: 1.6, rotate: 0 } : { rotate: 0 }}
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
