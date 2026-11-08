/**
 * Se duyên: hồ sơ duyên công khai, ai cũng ghép vào được.
 * Bảng + RPC ở supabase/migrations/20261104000000_duyen.sql.
 *
 * Chủ hồ sơ không cần đăng nhập: giữ `manage_token` trên máy (localStorage) và
 * trong link quản lý bí mật. Đăng nhập Google → `duyen_claim` gắn hồ sơ vào tài khoản.
 */
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Gender, PublicPerson } from "@/lib/hop-nhau";

export * from "@/lib/dating-shared";
import type { CompatibilityCheck, DatingProfile, LookingFor } from "@/lib/dating-shared";

/** Lỗi do RPC chủ động ném → câu báo dễ hiểu. */
export function datingError(err: unknown) {
  const msg = (err as { message?: string })?.message ?? "";
  if (msg.includes("too_young")) return "Hồ sơ duyên dành cho người từ 18 tuổi trở lên.";
  if (msg.includes("too_many_profiles")) return "Tài khoản này đã có hồ sơ duyên. Hãy sửa hồ sơ hiện tại, hoặc xoá đi rồi tạo lại.";
  if (msg.includes("rate_limited")) return "Hồ sơ này đang có nhiều người ghép quá, thử lại sau một phút nhé.";
  if (msg.includes("not_found")) return "Hồ sơ này không còn nữa.";
  return "Có lỗi kết nối, bạn thử lại nhé.";
}

/* ── Token quản lý trên máy ── */

const KEY = "luna.duyen.owned";
export type OwnedProfile = { slug: string; name: string; token: string };

export function readOwned(): OwnedProfile[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OwnedProfile[]) : [];
  } catch {
    return [];
  }
}
export function rememberOwned(p: OwnedProfile) {
  try {
    const list = readOwned().filter((x) => x.token !== p.token);
    localStorage.setItem(KEY, JSON.stringify([p, ...list].slice(0, 10)));
  } catch {
    /* chế độ ẩn danh */
  }
}
export function forgetOwned(token: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(readOwned().filter((x) => x.token !== token)));
  } catch {}
}

/* ── RPC ── */

export async function createProfile(input: {
  name: string;
  gender: Gender | null;
  lookingFor: LookingFor;
  bio: string;
  person: PublicPerson;
  slugBase: string;
  city: string;
  birthYear: number;
}) {
  const { data, error } = await supabaseBrowser().rpc("duyen_create", {
    p_name: input.name,
    p_gender: input.gender ?? "",
    p_looking_for: input.lookingFor,
    p_bio: input.bio,
    p_lunar_year: input.person.lunarYear,
    p_zodiac_index: input.person.zodiacIndex,
    p_life_path: input.person.lifePath,
    p_slug_base: input.slugBase,
    p_city: input.city,
    p_birth_year: input.birthYear,
  });
  if (error) throw error;
  const row = (data as { slug: string; manage_token: string }[])[0];
  const owned = { slug: row.slug, name: input.name, token: row.manage_token };
  rememberOwned(owned);
  return owned;
}

export async function addCheck(
  slug: string,
  visitor: PublicPerson & { displayName: string | null; city: string | null; birthYear: number },
  score: number,
  headline: string,
) {
  const { error } = await supabaseBrowser().rpc("duyen_add_check", {
    p_slug: slug,
    p_visitor_name: visitor.displayName ?? "",
    p_gender: visitor.gender ?? "",
    p_lunar_year: visitor.lunarYear,
    p_zodiac_index: visitor.zodiacIndex,
    p_life_path: visitor.lifePath,
    p_score: score,
    p_headline: headline,
    p_city: visitor.city ?? "",
    p_birth_year: visitor.birthYear,
  });
  if (error) throw error;
}

export async function manage(token: string) {
  const { data, error } = await supabaseBrowser().rpc("duyen_manage", { p_token: token });
  if (error) throw error;
  return data as { profile: DatingProfile; checks: CompatibilityCheck[] } | null;
}

export async function deleteCheck(token: string, id: string) {
  const { error } = await supabaseBrowser().rpc("duyen_delete_check", { p_token: token, p_check: id });
  if (error) throw error;
}

/** Sửa hồ sơ. `person` null = không nhập lại ngày sinh → giữ cung, số, năm như cũ. */
export async function updateProfile(
  token: string,
  input: { name: string; gender: Gender | null; lookingFor: LookingFor; bio: string; city: string; person: PublicPerson | null; birthYear: number | null },
) {
  const { error } = await supabaseBrowser().rpc("duyen_update", {
    p_token: token,
    p_name: input.name,
    p_gender: input.gender ?? "",
    p_looking_for: input.lookingFor,
    p_bio: input.bio,
    p_city: input.city,
    p_lunar_year: input.person?.lunarYear ?? null,
    p_zodiac_index: input.person?.zodiacIndex ?? null,
    p_life_path: input.person?.lifePath ?? null,
    p_birth_year: input.birthYear,
  });
  if (error) throw error;
}

export async function deleteProfile(token: string) {
  const { error } = await supabaseBrowser().rpc("duyen_delete", { p_token: token });
  if (error) throw error;
  forgetOwned(token);
}

/** Đã đăng nhập: gắn mọi hồ sơ trên máy vào tài khoản, rồi kéo về các hồ sơ từ máy khác. */
export async function syncOwned() {
  const supabase = supabaseBrowser();
  for (const p of readOwned()) await supabase.rpc("duyen_claim", { p_token: p.token });
  const { data } = await supabase.rpc("duyen_mine");
  for (const row of (data ?? []) as { slug: string; name: string; manage_token: string }[])
    rememberOwned({ slug: row.slug, name: row.name, token: row.manage_token });
  return readOwned();
}

/** Link quản lý bí mật — mở trên máy khác để xem lại danh sách. */
export function manageUrl(origin: string, token: string) {
  return `${origin}/duyen/quan-ly#t=${token}`;
}
