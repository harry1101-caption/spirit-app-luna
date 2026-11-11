/**
 * Kiểu dữ liệu và hằng số của Se duyên dùng được ở cả server lẫn trình duyệt.
 * Tách khỏi `dating.ts` vì file đó kéo theo Supabase phía trình duyệt ("use client"),
 * import vào route server (ảnh xem trước) sẽ hỏng.
 */
import type { Gender, PublicPerson } from "@/lib/hop-nhau";

export type LookingFor = "yeu" | "ban" | "ca-hai";

export const LOOKING_LABEL: Record<LookingFor, string> = {
  yeu: "Đang tìm người yêu",
  ban: "Đang tìm bạn hợp vibe",
  "ca-hai": "Bạn bè hay người yêu đều được",
};

export type DatingProfile = {
  id: string;
  slug: string;
  name: string;
  gender: Gender | null;
  looking_for: LookingFor;
  bio: string | null;
  lunar_year: number;
  zodiac_index: number;
  life_path: number;
  city: string | null;
  birth_year: number | null;
  active: boolean;
  created_at: string;
};

export type CompatibilityCheck = {
  id: string;
  visitor_name: string | null;
  gender: Gender | null;
  lunar_year: number;
  zodiac_index: number;
  life_path: number;
  score: number;
  headline: string;
  city: string | null;
  birth_year: number | null;
  created_at: string;
};

export const PUBLIC_COLUMNS = "id, slug, name, gender, looking_for, bio, lunar_year, zodiac_index, life_path, city, birth_year, active, created_at";

export function toPublicPerson(p: Pick<DatingProfile, "name" | "gender" | "lunar_year" | "zodiac_index" | "life_path">): PublicPerson {
  return { name: p.name, gender: p.gender, lunarYear: p.lunar_year, zodiacIndex: p.zodiac_index, lifePath: p.life_path };
}


/**
 * 34 tỉnh, thành sau sáp nhập 7/2025. Năm thành phố lớn đứng đầu (người dùng tập trung),
 * còn lại theo bảng chữ cái. Chỉ tới cấp tỉnh/thành để giữ riêng tư.
 */
export const CITIES = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Điện Biên", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Tĩnh", "Huế", "Hưng Yên", "Khánh Hòa", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai",
  "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sơn La", "Tây Ninh",
  "Thái Nguyên", "Thanh Hóa", "Tuyên Quang", "Vĩnh Long", "Nước ngoài",
] as const;

/** Tên gọi khác để ô tìm tỉnh thành bắt được ("hcm", "sai gon"). */
export const CITY_ALIASES: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["hcm", "tphcm", "ho chi minh", "sai gon", "saigon"],
  "Hà Nội": ["hn"],
  "Đà Nẵng": ["dn"],
  "Huế": ["thua thien hue"],
  "Nước ngoài": ["nuoc ngoai", "overseas"],
};

/** "Bạn hơn Minh Anh 2 tuổi" / "Hai bạn bằng tuổi" — từ năm sinh, không cần ngày hôm nay. */
export function ageGapText(you: number | null | undefined, them: number | null | undefined, themName: string) {
  if (!you || !them) return null;
  const d = them - you;
  if (d === 0) return `Bạn và ${themName} bằng tuổi`;
  return d > 0 ? `Bạn hơn ${themName} ${d} tuổi` : `Bạn kém ${themName} ${-d} tuổi`;
}

/**
 * Sở thích để chọn thay cho ô "giới thiệu" tự gõ (người dùng hầu như không gõ).
 * Lưu vào cột `bio` dạng "☕ Cà phê · ✈️ Du lịch" — không cần đổi bảng.
 */
export const INTERESTS = [
  "☕ Cà phê", "✈️ Du lịch", "🎬 Xem phim", "🎵 Âm nhạc", "📚 Đọc sách", "🍜 Ăn uống",
  "🍳 Nấu ăn", "🏋️ Gym", "🧘 Yoga", "⛰️ Trekking", "📷 Chụp ảnh", "🎮 Game",
  "🐱 Mèo", "🐶 Chó", "🎨 Vẽ", "💻 Công nghệ", "🌿 Cây cỏ", "🛍️ Mua sắm",
] as const;
export const MAX_INTERESTS = 3;
export const joinInterests = (list: string[]) => list.slice(0, MAX_INTERESTS).join(" · ");
/** Đọc lại danh sách sở thích từ cột bio (hồ sơ cũ có thể là chữ tự do → hiện nguyên một chip). */
export const parseInterests = (bio: string | null | undefined) => (bio ? bio.split(" · ").map((x) => x.trim()).filter(Boolean) : []);
