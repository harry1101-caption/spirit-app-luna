"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Hand, LoaderCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { castKeo, keoMeaning, type Face, type KeoCast } from "@/lib/xin-xam";

/**
 * Gieo keo: hai mảnh gỗ hình bán nguyệt, một mặt phẳng một mặt cong.
 *
 * Kết quả được gieo NGAY lúc bấm rồi mới chạy hoạt ảnh, chứ không gieo lúc
 * hoạt ảnh kết thúc. Hai mặt hiện ra phải đúng là hai mặt đã quyết định —
 * nếu quay rồi mới random thì hình chỉ là đồ trang trí.
 *
 * Ai bật "giảm chuyển động" thì bỏ qua hoạt ảnh, hiện kết quả ngay.
 */

const TOSS_MS = 820;

/**
 * Một mảnh keo nhìn ngang.
 *
 * Chỉ có MỘT ảnh: mặt cong hướng lên (ngửa). Mặt sấp là chính ảnh đó lật dọc,
 * đúng như vật thật — hai mặt của cùng một mảnh gỗ, không phải hai vật khác
 * nhau. Lật bằng `-scale-y-100` thay vì làm thêm ảnh thứ hai.
 */
function Block({ face, spin, delay }: { face: Face; spin: boolean; delay: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className="flex h-[66px] w-[96px] items-center justify-center"
      animate={spin ? { y: [0, -48, 0], rotate: [0, 420, 720] } : { y: 0, rotate: 0 }}
      transition={spin ? { duration: TOSS_MS / 1000, delay, ease: [0.3, 0, 0.3, 1] } : { duration: 0.2 }}
    >
      <Image
        src="/images/keo-block.png"
        alt=""
        width={240}
        height={240}
        className={`h-auto w-[92px] drop-shadow-[0_4px_8px_#6b4b8233] ${
          face === "sấp" ? "-scale-y-100" : ""
        }`}
      />
    </motion.span>
  );
}

export function KeoToss({
  onAccepted,
  disabled,
  busy,
  onBeforeToss,
}: {
  /** Gọi khi được thánh keo — nơi gọi quyết định làm gì tiếp. */
  onAccepted: () => void;
  disabled?: boolean;
  busy?: boolean;
  /** Trả false để chặn gieo, ví dụ khi câu hỏi chưa hợp lệ. */
  onBeforeToss: () => boolean;
}) {
  const [cast, setCast] = useState<KeoCast | null>(null);
  const [tossing, setTossing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  function toss() {
    if (tossing || !onBeforeToss()) return;
    const next = castKeo();
    if (reduced) {
      setCast(next);
      return;
    }
    // Giấu kết quả cũ trong lúc quay, để không thấy mặt cũ lật sang mặt mới.
    setCast(null);
    setTossing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCast(next);
      setTossing(false);
    }, TOSS_MS + 120);
  }

  const result = cast?.result;
  return (
    <div className="mt-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-5">
      <div className="flex items-center gap-2.5 text-[#5d3f77]">
        <Hand size={19} strokeWidth={1.5} aria-hidden="true" />
        <strong className="text-[15px] font-medium">Gieo keo xin phép</strong>
      </div>
      <p className="mt-1.5 text-[13px] leading-[1.75] text-[#6b6287]">
        Hai mảnh keo, một mặt phẳng một mặt cong. Được một ngửa một sấp thì nhận
        quẻ. Ra kiểu khác là chuyện thường, cứ gieo lại.
      </p>

      <div className="mt-4 flex items-end justify-center gap-7 rounded-xl bg-[#faf7fd] py-5">
        {(cast?.faces ?? (["ngửa", "sấp"] as Face[])).map((face, i) => (
          <span key={i} className="flex flex-col items-center gap-2">
            <Block face={face} spin={tossing} delay={i * 0.07} />
            <small className={`text-xs ${cast ? "text-[#6b6287]" : "text-transparent"}`}>
              {face}
            </small>
          </span>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {result ? `${result} keo. ${keoMeaning[result]}` : ""}
      </p>

      {result ? (
        <p
          className={`mt-3 rounded-xl px-4 py-3 text-[13px] leading-[1.7] ${
            result === "thánh" ? "bg-[#edf6ee] text-[#3f6b47]" : "bg-[#f7f1e8] text-[#8a6a3c]"
          }`}
        >
          <strong className="font-medium capitalize">{result} keo.</strong>{" "}
          {keoMeaning[result]}
        </p>
      ) : null}

      {/* CTA theo đúng khuôn của các form khác: một nút chính rộng hết thẻ
          (`tuvi-submit`), chỉ một icon — spinner khi đang chạy, mũi tên khi
          rảnh. Trước đây chỗ này là hai nút nhỏ nằm ngang, lạc hẳn so với
          Bát Tự, Giấc mơ, Human Design.

          Khi đã thánh keo thì nút chính nhường cho "Nhận quẻ", còn "Gieo lại"
          lùi xuống thành nút phụ. Nút phụ của app là `variant="outline"`
          (viền vàng, nền trong) chứ KHÔNG phải `variant="secondary"` — xem
          nút "Xem các trải nghiệm" ở hero trang chủ. */}
      {result === "thánh" ? (
        <>
          <Button className="tuvi-submit" onClick={onAccepted} disabled={busy} type="button">
            {busy ? <LoaderCircle className="spin" size={18} /> : null}
            {busy ? "Đang rút quẻ…" : "Nhận quẻ"}
            {busy ? null : <ArrowRight size={18} />}
          </Button>
          <Button
            variant="outline"
            className="mt-3! w-full"
            onClick={toss}
            type="button"
            disabled={tossing}
          >
            {tossing ? <LoaderCircle className="spin" size={16} /> : <RotateCcw size={16} />}
            {tossing ? "Đang gieo…" : "Gieo lại"}
          </Button>
        </>
      ) : (
        <Button
          className="tuvi-submit"
          onClick={toss}
          disabled={tossing || disabled}
          type="button"
        >
          {tossing ? <LoaderCircle className="spin" size={18} /> : null}
          {tossing ? "Đang gieo…" : cast ? "Gieo lại" : "Gieo keo"}
          {tossing ? null : <ArrowRight size={18} />}
        </Button>
      )}
    </div>
  );
}
