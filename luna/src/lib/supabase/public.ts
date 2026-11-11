import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase phía server chỉ để đọc dữ liệu công khai (không cookie, không phiên) —
 * dùng ở trang và ảnh xem trước của hồ sơ duyên.
 */
let client: SupabaseClient | null = null;
export function supabasePublic() {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
