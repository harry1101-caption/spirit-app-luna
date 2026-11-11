"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, LoaderCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { signInWithGoogle } from "@/lib/supabase/client";
import Link from "next/link";
import {
  clearJustSaved,
  isJustSaved,
  saveResult,
  savedIdFromUrl,
  updateSaved,
  setPendingSave,
  useAuthUser,
  type SaveableResult,
} from "@/lib/saved-results";
import { track } from "@/lib/analytics";

type AutoState = { id: string | null; status: "idle" | "saving" | "saved" | "error" };

/**
 * Nút lưu trong header thẻ kết quả.
 * - Đã đăng nhập: TỰ LƯU, không cần bấm. Lưu ngay khi có kết quả, rồi cập nhật lại bản ghi khi
 *   kết quả còn thay đổi (luận giải AI về sau). Mỗi lần thẻ kết quả mount là một kết quả mới;
 *   làm lại → thẻ unmount → lần sau là bản ghi mới. Chỉ hiện trạng thái "Đã lưu".
 * - Khách: nút "Lưu vào tài khoản" mở modal đăng nhập Google; kết quả được giữ tạm và tự lưu
 *   sau khi đăng nhập (xem auth-menu.tsx → takePendingSave).
 */
export function SaveResultInline({ result }: { result: SaveableResult }) {
  const { user, ready } = useAuthUser();
  const [auto, setAuto] = useState<AutoState>(() => {
    // Đang mở lại một kết quả đã lưu → đã nằm trong tài khoản, không lưu thêm bản nữa
    const fromUrl = savedIdFromUrl();
    if (fromUrl) return { id: fromUrl, status: "saved" };
    return { id: null, status: "idle" };
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const idRef = useRef<string | null>(auto.id);
  const restored = useRef(auto.id !== null);
  const inflight = useRef<Promise<unknown> | null>(null);

  useEffect(() => {
    if (isJustSaved(savedIdFromUrl())) clearJustSaved();
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    // Đang xem lại một kết quả đã lưu → không ghi đè
    if (restored.current) return;
    // Đợi kết quả "lắng" một chút: nhiều flow cập nhật dồn dập (biểu đồ rồi mới tới AI)
    const timer = setTimeout(() => {
      const run = async () => {
        await inflight.current?.catch(() => {});
        setAuto((a) => ({ ...a, status: a.status === "saved" ? "saved" : "saving" }));
        try {
          if (idRef.current) {
            await updateSaved(idRef.current, result);
          } else {
            idRef.current = await saveResult(result);
            track("result_save", { feature: result.feature, via: "auto" });
          }
          setAuto({ id: idRef.current, status: "saved" });
        } catch {
          setAuto((a) => ({ ...a, status: "error" }));
        }
      };
      inflight.current = run();
    }, 1200);
    return () => clearTimeout(timer);
  }, [ready, user, result]);

  if (!ready) return null;

  if (!user) {
    return (
      <>
        <Button
          onClick={() => {
            track("save_login_open", { feature: result.feature });
            setLoginOpen(true);
          }}
        >
          <Bookmark size={16} /> Lưu vào tài khoản
        </Button>
        <SaveLoginDialog open={loginOpen} onOpenChange={setLoginOpen} result={result} />
      </>
    );
  }

  if (auto.status === "saved")
    return (
      <Link href="/kham-pha-cua-toi" className={buttonVariants({ variant: "secondary" })}>
        <BookmarkCheck size={16} /> Đã lưu · Xem
      </Link>
    );
  if (auto.status === "error")
    return (
      <Button
        variant="outline"
        onClick={() => {
          setAuto((a) => ({ ...a, status: "saving" }));
          void (async () => {
            try {
              if (idRef.current) await updateSaved(idRef.current, result);
              else idRef.current = await saveResult(result);
              setAuto({ id: idRef.current, status: "saved" });
            } catch {
              setAuto((a) => ({ ...a, status: "error" }));
            }
          })();
        }}
      >
        <Bookmark size={16} /> Chưa lưu được · Thử lại
      </Button>
    );
  return (
    <span className="inline-flex h-10 items-center gap-2 px-2 text-[13px] text-[#8a7b99]" aria-live="polite">
      <LoaderCircle className="spin" size={14} /> Đang lưu…
    </span>
  );
}

/** Modal đăng nhập cho khách bấm "Lưu vào tài khoản". */
function SaveLoginDialog({ open, onOpenChange, result }: { open: boolean; onOpenChange: (o: boolean) => void; result: SaveableResult }) {
  const [busy, setBusy] = useState(false);
  async function login() {
    setBusy(true);
    setPendingSave(result);
    track("campaign_login_click", { feature: result.feature, from: "save_modal" });
    const { error } = await signInWithGoogle();
    if (error) setBusy(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(420px,calc(100%-32px))]! gap-0 rounded-[24px] border-0 bg-[#fffaf9] p-0 ring-1 ring-[#e8ddef]">
        <div className="px-6 pt-8 pb-6 text-center sm:px-8">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f1e8f8] text-[#6e4a92]">
            <Bookmark size={22} />
          </span>
          <DialogTitle className="mt-4 font-[family-name:var(--font-serif-app)] text-[24px] leading-tight font-normal text-[#3a1f5c]">
            Lưu kết quả vào tài khoản
          </DialogTitle>
          <p className="mt-3 text-[14px] leading-[1.7] text-[#6a5c7a]">
            Đăng nhập bằng Google để giữ lại kết quả này và xem lại bất cứ lúc nào. Sau khi đăng nhập,
            mọi kết quả mới đều được lưu tự động.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void login()}
            className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#e0d5f0] bg-white text-[15px] font-medium text-[#3a1f5c] shadow-[0_6px_16px_#5d3d7114] transition-colors hover:bg-[#faf6fd] disabled:opacity-70"
          >
            {busy ? <LoaderCircle className="spin" size={18} /> : <GoogleMark size={20} />}
            {busy ? "Đang mở Google…" : "Tiếp tục với Google"}
          </button>
          <p className="mt-4 text-[12px] leading-[1.6] text-[#8a7b99]">Kết quả bạn vừa xem được giữ lại và lưu ngay khi đăng nhập xong.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <span className="flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
    </span>
  );
}
