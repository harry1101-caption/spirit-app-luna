"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { signInWithGoogle, supabaseBrowser } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Nút tài khoản trên header: đăng nhập Google / avatar + menu */
export function AuthMenu({ onOpenProfile }: { onOpenProfile: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN") track("login_success", { provider: "google" });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  async function login() {
    setBusy(true);
    track("login_start", { provider: "google" });
    const { error } = await signInWithGoogle();
    if (error) setBusy(false);
  }

  async function logout() {
    setBusy(true);
    await supabaseBrowser().auth.signOut();
    track("logout");
    setBusy(false);
    setOpen(false);
  }

  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string; picture?: string };
  const name = meta.full_name || meta.name || user?.email || "";
  const avatar = meta.avatar_url || meta.picture;

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        className="profile-button"
        aria-label={user ? `Tài khoản của ${name}` : "Tài khoản"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="overflow-hidden">
          {user && avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : (
            <UserRound size={23} strokeWidth={1.3} />
          )}
        </span>
        <ChevronDown size={18} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-[calc(100%+12px)] right-0 z-50 w-[300px] rounded-[20px] border border-[#e8ddef] bg-[#fffdfe] p-4 text-left shadow-[0_20px_50px_#5b3f7a2e]"
        >
          {!ready ? (
            <div className="flex justify-center py-4 text-[#8a7d99]">
              <LoaderCircle className="spin" size={20} />
            </div>
          ) : user ? (
            <>
              <div className="flex items-center gap-3 border-b border-[#efe6f6] pb-3">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" referrerPolicy="no-referrer" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eae0f7] text-[#5b3f7a]">
                    <UserRound size={20} />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[#221c2b]">{name}</p>
                  <p className="truncate text-[12px] text-[#6a5c7a]">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); onOpenProfile(); }}
                className="mt-2 flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-[#2e2838] hover:bg-[#f3eef8]"
              >
                <UserRound size={16} /> Không gian của tôi
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => void logout()}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[13px] text-[#2e2838] hover:bg-[#f3eef8] disabled:opacity-60"
              >
                {busy ? <LoaderCircle className="spin" size={16} /> : <LogOut size={16} />} Đăng xuất
              </button>
            </>
          ) : (
            <>
              <p className="font-[family-name:var(--font-serif-app)] text-[22px] leading-tight text-[#221c2b]">Đăng nhập Lunara</p>
              <p className="mt-1! text-[12px] leading-[1.6] text-[#4a4257]">
                Không bắt buộc. Mọi trải nghiệm vẫn dùng được khi chưa đăng nhập.
              </p>
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                onClick={() => void login()}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-[#dadce0] bg-white text-[14px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f8f9fa] disabled:opacity-60"
              >
                {busy ? <LoaderCircle className="spin" size={18} /> : <GoogleMark />}
                Tiếp tục với Google
              </button>
              <p className="mt-2! text-center text-[11px] leading-[1.5] text-[#8a7d99]">
                Lunara chỉ nhận tên, email và ảnh đại diện từ Google.
              </p>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); onOpenProfile(); }}
                className="mt-3 flex w-full items-center gap-2.5 rounded-xl border-t border-[#efe6f6] px-2 pt-3 text-[13px] text-[#2e2838] hover:text-[#5b3f7a]"
              >
                <UserRound size={16} /> Không gian của tôi
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
