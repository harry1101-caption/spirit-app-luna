"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase phía trình duyệt. Phiên đăng nhập lưu trong cookie (do @supabase/ssr quản lý)
 * nên route /auth/callback ở server đọc được, và các trang vẫn render tĩnh.
 */
let client: SupabaseClient | null = null;

export function supabaseBrowser() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
  }
  return client;
}

/** Đăng nhập Google rồi quay lại đúng trang đang xem */
export async function signInWithGoogle() {
  const next = window.location.pathname + window.location.search;
  return supabaseBrowser().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { prompt: "select_account" },
    },
  });
}
