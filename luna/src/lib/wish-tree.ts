/**
 * Cây ước nguyện — phần dùng chung cho client và route /api/wish.
 * Giá trị `topic` trùng với ràng buộc CHECK của bảng `wishes` (xem
 * supabase/migrations/20261108000000_wish_tree.sql); đổi ở đây thì đổi cả ở đó.
 */

export const WISH_TOPICS = [
  { value: "tinh-yeu", label: "Tình yêu", paper: "#f7d3df", ink: "#8a3f5e", string: "#d98aa6" },
  { value: "cong-viec", label: "Công việc", paper: "#f6dfb4", ink: "#7a5420", string: "#d6a85c" },
  { value: "hoc-tap", label: "Học tập", paper: "#d3e2f6", ink: "#3a5482", string: "#8aa6d6" },
  { value: "suc-khoe", label: "Sức khoẻ", paper: "#d6ebd0", ink: "#3f6a3a", string: "#8fbf86" },
  { value: "gia-dinh", label: "Gia đình", paper: "#f8d9c4", ink: "#86492a", string: "#dc9a74" },
  { value: "tai-chinh", label: "Tài chính", paper: "#f3e8ad", ink: "#6f5d17", string: "#cdb64e" },
  { value: "ban-than", label: "Bản thân", paper: "#e3d6f3", ink: "#5b3f7a", string: "#ad8fd2" },
] as const;

export type WishTopic = (typeof WISH_TOPICS)[number]["value"];
export const WISH_TOPIC_VALUES = WISH_TOPICS.map((t) => t.value) as [WishTopic, ...WishTopic[]];

export function topicOf(value: string) {
  return WISH_TOPICS.find((t) => t.value === value) ?? WISH_TOPICS[WISH_TOPICS.length - 1];
}

/**
 * Màu lá thư người viết tự chọn. Giá trị trùng ràng buộc CHECK cột `wishes.color`
 * (supabase/migrations/20261108020000_wish_letter_color.sql).
 */
export const WISH_COLORS = [
  { value: "hong", label: "Hồng", paper: "#f7d3df", ink: "#8a3f5e", seal: "#d98aa6" },
  { value: "dao", label: "Đào", paper: "#f8d9c4", ink: "#86492a", seal: "#dc9a74" },
  { value: "vang", label: "Vàng", paper: "#f3e8ad", ink: "#6f5d17", seal: "#cdb64e" },
  { value: "la", label: "Xanh lá", paper: "#d6ebd0", ink: "#3f6a3a", seal: "#8fbf86" },
  { value: "troi", label: "Xanh trời", paper: "#d3e2f6", ink: "#3a5482", seal: "#8aa6d6" },
  { value: "tim", label: "Tím", paper: "#e3d6f3", ink: "#5b3f7a", seal: "#ad8fd2" },
  { value: "do", label: "Đỏ", paper: "#f4bcb8", ink: "#7d2a2a", seal: "#c9504b" },
  { value: "kem", label: "Kem", paper: "#fbf1de", ink: "#6b5a3e", seal: "#d4bc8c" },
] as const;

export type WishColor = (typeof WISH_COLORS)[number]["value"];
export const WISH_COLOR_VALUES = WISH_COLORS.map((c) => c.value) as [WishColor, ...WishColor[]];
export const DEFAULT_WISH_COLOR: WishColor = "hong";

/** Màu để vẽ lá thư: màu người viết chọn, thư cũ chưa có màu thì theo chủ đề. */
export function letterColors(wish: { color?: string | null; topic: string }) {
  const chosen = WISH_COLORS.find((c) => c.value === wish.color);
  if (chosen) return { paper: chosen.paper, ink: chosen.ink, seal: chosen.seal };
  const topic = topicOf(wish.topic);
  return { paper: topic.paper, ink: topic.ink, seal: topic.string };
}

export const WISH_MIN = 4;
export const WISH_MAX = 200;
export const NICKNAME_MAX = 30;

/**
 * Một lá thư trên cây (qua RPC wish_tree). Thư riêng tư chỉ lộ chủ đề + thời gian:
 * `content`/`nickname` là null, trừ khi đó là thư của chính mình (ghép từ wish_mine).
 */
export type TreeWish = {
  id: string;
  topic: WishTopic;
  color: WishColor | null;
  is_public: boolean;
  nickname: string | null;
  content: string | null;
  bless_count: number;
  created_at: string;
};

/** Điều ước của chính mình (qua RPC wish_mine) — luôn đủ nội dung */
export type MyWish = TreeWish & {
  content: string;
  blessing: string | null;
  hidden: boolean;
};

export function relativeTime(iso: string, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso));
}
