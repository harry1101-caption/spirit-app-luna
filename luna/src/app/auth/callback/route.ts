import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Google → Supabase → quay về đây kèm `code`. Đổi code lấy phiên (lưu cookie)
 * rồi đưa người dùng về trang họ đang xem trước khi đăng nhập.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "/";
  // Chỉ cho phép quay về đường dẫn nội bộ, chặn open redirect (vd. next=//evil.com)
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  const fail = new URL(next, url.origin);
  fail.searchParams.set("dang-nhap", "loi");
  return NextResponse.redirect(fail);
}
