"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Crown, LoaderCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/supabase/client";
import Link from "next/link";
import {
  clearJustSaved,
  isJustSaved,
  FREE_MONTHS,
  saveResult,
  savedIdFromUrl,
  setPendingSave,
  useAuthUser,
  type SaveableResult,
} from "@/lib/saved-results";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Thẻ dưới mỗi kết quả:
 * - Khách: campaign "Kích hoạt tài khoản miễn phí" — đăng nhập Google, kết quả tự lưu.
 * - Đã đăng nhập: chỉ còn nút "Lưu vào tài khoản". Kết quả nào có nút "Chia sẻ" thì đặt
 *   `SaveResultInline` cạnh nút đó và báo slot `guestOnly` để thẻ này không lặp nút.
 */
export function SaveResultCard({ result, className, guestOnly }: { result: SaveableResult; className?: string; guestOnly?: boolean }) {
  const { user, ready } = useAuthUser();
  // Đang mở một kết quả đã lưu (?saved=) → đã nằm trong tài khoản rồi
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(() => (savedIdFromUrl() ? "saved" : "idle"));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (isJustSaved(savedIdFromUrl())) clearJustSaved();
  }, []);

  async function save() {
    setState("saving");
    try {
      await saveResult(result);
      setState("saved");
      track("result_save", { feature: result.feature });
    } catch {
      setState("error");
    }
  }

  async function loginAndSave() {
    setBusy(true);
    setPendingSave(result);
    track("campaign_login_click", { feature: result.feature });
    const { error } = await signInWithGoogle();
    if (error) setBusy(false);
  }

  if (!ready || (user && guestOnly)) return null;

  if (!user) {
    // Banner campaign theo thiết kế "Đăng nhập nhận 3 tháng miễn phí"
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border border-[#e6d6f3] bg-[linear-gradient(100deg,#fcf5f9_0%,#f8eefb_55%,#fdeede_100%)] px-5 py-6 shadow-[0_18px_44px_#6b4b821a] sm:px-8 sm:py-7",
          className,
        )}
      >
        {/* sóng trang trí mép dưới */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full" viewBox="0 0 1000 40" preserveAspectRatio="none">
          <path d="M0 28 C 220 6, 420 40, 640 22 S 900 8, 1000 24 L1000 40 L0 40 Z" fill="#efe1fb" opacity=".8" />
          <path d="M520 34 C 700 18, 860 30, 1000 16 L1000 40 L520 40 Z" fill="#f6d98c" opacity=".35" />
        </svg>

        <div className="relative grid items-center gap-x-6 gap-y-4 sm:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#4b2a6e,#6e4a92)] py-1.5 pr-4 pl-3 text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap text-[#fbe7b4] shadow-[0_4px_14px_#4b2a6e33] sm:text-[12.5px] sm:tracking-[0.06em]">
              <Crown size={15} className="text-[#f6d98c]" fill="#f6d98c" /> ƯU ĐÃI ĐẶC BIỆT – DÀNH CHO TÀI KHOẢN MỚI
            </p>
            <h3 className="mt-3! font-[family-name:var(--font-sans-app)]! text-[23px]! leading-[1.28]! font-bold! tracking-[-0.01em] text-[#3a1f5c]! sm:text-[31px]!">
              Đăng nhập hôm nay, dùng miễn phí không giới hạn{" "}
              <span className="relative inline-block whitespace-nowrap px-2">
                <span aria-hidden="true" className="absolute inset-x-0 top-[38%] bottom-[2%] -skew-x-6 rounded-[6px] bg-[linear-gradient(90deg,#f6d98c,#fbe7b4_70%,transparent)]" />
                <span className="relative font-[family-name:var(--font-sans-app)] text-[1.3em] font-extrabold italic text-[#3a1f5c]">{FREE_MONTHS} tháng</span>
              </span>
            </h3>
            <p className="mt-4! border-l-[3px] border-[#c9a9e0] pl-3 text-[13px] leading-[1.7] text-[#4a4257]">
              Kết quả được lưu vào tài khoản. Bạn dùng không giới hạn trong {FREE_MONTHS} tháng kể từ ngày tạo tài khoản; sau đó
              tiếp tục dùng miễn phí với số lượt giới hạn mỗi ngày.
            </p>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/campaign-gift.jpg"
            alt="Hộp quà: miễn phí không giới hạn 3 tháng"
            className="mx-auto w-[min(100%,230px)] mix-blend-multiply [mask-image:radial-gradient(ellipse_at_center,#000_55%,transparent_78%)] sm:w-full sm:max-w-[320px]"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void loginAndSave()}
            className="mx-auto flex w-full max-w-[520px] items-center gap-3 rounded-full bg-[linear-gradient(90deg,#6e4a92,#4b2a6e)] py-2 pr-4 pl-2 text-left text-white sm:pr-6 shadow-[0_10px_24px_#4b2a6e40,inset_0_1px_0_#ffffff33] ring-2 ring-[#f6d98c]/60 transition-transform hover:-translate-y-0.5 disabled:opacity-70 sm:col-span-2"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
              {busy ? <LoaderCircle className="spin text-[#4b2a6e]" size={20} /> : <GoogleMark size={22} />}
            </span>
            <span className="h-7 w-px bg-white/35" aria-hidden="true" />
            <span className="flex-1 text-center font-[family-name:var(--font-sans-app)] text-[14px] font-semibold whitespace-nowrap min-[400px]:text-[15px] sm:text-[17px]">
              Đăng nhập Google & lưu kết quả
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", className)}>
      <SaveResultButton result={result} state={state} onSave={save} />
    </div>
  );
}

/**
 * Nút lưu cho người đã đăng nhập, đặt cạnh nút "Chia sẻ" của kết quả.
 * Khách không thấy gì — họ đã có banner campaign ở dưới kết quả.
 */
export function SaveResultInline({ result }: { result: SaveableResult }) {
  const { user, ready } = useAuthUser();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(() => (savedIdFromUrl() ? "saved" : "idle"));
  useEffect(() => {
    if (isJustSaved(savedIdFromUrl())) clearJustSaved();
  }, []);
  if (!ready || !user) return null;
  async function save() {
    setState("saving");
    try {
      await saveResult(result);
      setState("saved");
      track("result_save", { feature: result.feature });
    } catch {
      setState("error");
    }
  }
  return <SaveResultButton result={result} state={state} onSave={save} />;
}

/** Lưu = nút chính (nền tím), khác hẳn nút "Chia sẻ" viền bên cạnh; đã lưu = nút phụ dẫn tới danh sách. */
function SaveResultButton({
  state,
  onSave,
}: {
  result: SaveableResult;
  state: "idle" | "saving" | "saved" | "error";
  onSave: () => Promise<void>;
}) {
  if (state === "saved")
    return (
      <Link href="/kham-pha-cua-toi" className={buttonVariants({ variant: "secondary" })}>
        <BookmarkCheck size={16} /> Xem trong Khám phá của tôi
      </Link>
    );
  return (
    <Button disabled={state === "saving"} onClick={() => void onSave()}>
      {state === "saving" ? <LoaderCircle className="spin" size={16} /> : <Bookmark size={16} />}
      {state === "error" ? "Thử lưu lại" : "Lưu vào tài khoản"}
    </Button>
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
