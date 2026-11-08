import { supabasePublic } from "@/lib/supabase/public";
import { PUBLIC_COLUMNS, type DatingProfile } from "@/lib/dating-shared";

/** Đọc hồ sơ công khai theo slug (server). Không có hoặc đã tắt → null. */
export async function getDatingProfile(slug: string): Promise<DatingProfile | null> {
  if (!/^[a-z0-9-]{3,48}$/.test(slug)) return null;
  const { data, error } = await supabasePublic().from("duyen_profiles").select(PUBLIC_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) return null;
  return data as DatingProfile | null;
}
