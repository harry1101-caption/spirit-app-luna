/**
 * Se duyên → ghép đôi: lướt feed những người hợp, hai bên cùng "Kết nối" thì
 * mở Zalo / Instagram / Facebook của nhau. Không có chat.
 * Bảng + RPC ở supabase/migrations/20261105020000_matchmaking.sql và 20261106000000_match_feed.sql
 * — chỉ người đã đăng nhập.
 */
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Gender } from "@/lib/hop-nhau";
import type { DatingProfile } from "@/lib/dating-shared";

export type WantGender = Gender | "ca-hai";

export type MatchSettings = {
  enabled: boolean;
  want_gender: WantGender;
  age_gap: number;
  same_city: boolean;
  adult_confirmed_at: string | null;
};

export type Contacts = { zalo: string | null; instagram: string | null; facebook: string | null };

/** Một người trong gợi ý / đã ghép — chỉ các trường công khai của hồ sơ. */
export type MatchPerson = Pick<
  DatingProfile,
  "id" | "name" | "gender" | "looking_for" | "bio" | "lunar_year" | "zodiac_index" | "life_path" | "city" | "birth_year"
>;
export type Suggestion = MatchPerson & { decision: boolean | null; liked_me: boolean };
export type Match = MatchPerson & Contacts & { matched_at: string };

export const REPORT_REASONS = [
  ["gia-mao", "Hồ sơ giả mạo"],
  ["quay-rot", "Quấy rối, thô lỗ"],
  ["lua-dao", "Lừa đảo, mời chào"],
  ["duoi-18", "Có vẻ chưa đủ 18 tuổi"],
  ["khac", "Lý do khác"],
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number][0];

export function matchError(err: unknown) {
  const msg = (err as { message?: string })?.message ?? "";
  if (msg.includes("no_profile")) return "Tài khoản này chưa có hồ sơ duyên. Tải lại trang sau khi đăng nhập nhé.";
  if (msg.includes("under_18")) return "Ghép đôi chỉ dành cho người từ 18 tuổi trở lên.";
  if (msg.includes("need_adult")) return "Hãy xác nhận bạn đủ 18 tuổi.";
  if (msg.includes("need_gender")) return "Hồ sơ cần có giới tính để Luna ghép đúng người. Bấm Sửa ở trên để thêm.";
  if (msg.includes("need_city")) return "Hồ sơ chưa có nơi sống. Thêm nơi sống, hoặc chọn \"Ở đâu cũng được\".";
  if (msg.includes("need_contact")) return "Cần ít nhất một cách liên lạc: Zalo, Instagram hoặc Facebook.";
  if (msg.includes("not_enabled")) return "Bạn chưa bật se duyên.";
  return "Có lỗi kết nối, bạn thử lại nhé.";
}

/* ── Chuẩn hoá liên lạc người dùng gõ / dán ── */

/** "0901 234 567", "+84 901234567" → "0901234567"; sai → null. */
export function normalizeZalo(input: string) {
  const digits = input.replace(/[^\d+]/g, "").replace(/^\+?84/, "0");
  return /^0\d{9}$/.test(digits) ? digits : null;
}

/** "@minh.anh", "instagram.com/minh.anh/" → "minh.anh"; sai → null. */
export function normalizeInstagram(input: string) {
  const handle = input.trim().replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0];
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null;
}

/** "facebook.com/minh.anh", "fb.com/profile.php?id=1000…" → "minh.anh" / "profile.php?id=1000…"; sai → null. */
export function normalizeFacebook(input: string) {
  const rest = input.trim().replace(/^(https?:\/\/)?((www|m|web)\.)?(facebook|fb)\.com\//i, "");
  const id = rest.match(/^profile\.php\?id=(\d{5,20})/);
  if (id) return `profile.php?id=${id[1]}`;
  const name = rest.split(/[/?#]/)[0];
  return /^[A-Za-z0-9.]{5,50}$/.test(name) ? name : null;
}

export const zaloLink = (phone: string) => `https://zalo.me/${phone}`;
export const instagramLink = (handle: string) => `https://instagram.com/${handle}`;
export const facebookLink = (name: string) => `https://facebook.com/${name}`;

/* ── RPC ── */

export async function getMatchSettings() {
  const { data, error } = await supabaseBrowser().rpc("get_match_settings");
  if (error) throw error;
  return data as { settings: MatchSettings | null; contacts: Contacts | null };
}

export async function saveMatchSettings(input: {
  enabled: boolean;
  wantGender: WantGender;
  ageGap: number;
  sameCity: boolean;
  contacts: Contacts;
  adult: boolean;
}) {
  const { error } = await supabaseBrowser().rpc("save_match_settings", {
    p_enabled: input.enabled,
    p_want_gender: input.wantGender,
    p_age_gap: input.ageGap,
    p_same_city: input.sameCity,
    p_zalo: input.contacts.zalo ?? "",
    p_instagram: input.contacts.instagram ?? "",
    p_facebook: input.contacts.facebook ?? "",
    p_adult: input.adult,
  });
  if (error) throw error;
}

export const FEED_PAGE = 10;

/** Hồ sơ mẫu (is_sample) chỉ hiện khi chạy `next dev`; bản build production không bao giờ xin. */
const INCLUDE_SAMPLES = process.env.NODE_ENV === "development";

/** Trang tiếp theo của feed; `seen` là id đã tải trong phiên để không lặp lại. */
export async function matchFeed(seen: string[]) {
  const { data, error } = await supabaseBrowser().rpc("get_match_feed", {
    p_seen: seen,
    p_limit: FEED_PAGE,
    p_include_samples: INCLUDE_SAMPLES,
  });
  if (error) throw error;
  return data as Suggestion[];
}

export async function decide(candidate: string, like: boolean) {
  const { data, error } = await supabaseBrowser().rpc("decide_match", { p_candidate: candidate, p_like: like });
  if (error) throw error;
  return (data as { matched: boolean }).matched;
}

export async function listMatches() {
  const { data, error } = await supabaseBrowser().rpc("list_matches");
  if (error) throw error;
  return data as Match[];
}

export async function blockPerson(other: string) {
  const { error } = await supabaseBrowser().rpc("block_match", { p_other: other });
  if (error) throw error;
}

export async function reportPerson(other: string, reason: ReportReason) {
  const { error } = await supabaseBrowser().rpc("report_match", { p_other: other, p_reason: reason });
  if (error) throw error;
}
