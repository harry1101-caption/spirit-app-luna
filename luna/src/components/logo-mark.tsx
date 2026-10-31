"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { AnimationItem } from "lottie-web";

/**
 * Logo Lunara, chạy animation Lottie ngay khi vào trang.
 *
 * Ảnh tĩnh vẫn được render và chỉ mờ đi khi animation sẵn sàng — không gỡ khỏi
 * DOM. Nhờ vậy lúc đang tải hoặc nếu tải hỏng thì logo vẫn nguyên chỗ, header
 * không nhảy và không ai thấy một ô trống.
 *
 * Thư viện (~160KB) và file motion (~98KB) nạp sau khi mount bằng `import()`
 * động, không nằm trong bundle khởi động — trang vẫn hiện ngay, animation ghép
 * vào sau. Đây cũng là lý do phải dùng import động chứ không import thường:
 * `lottie-web` tự chặn chính nó bằng `typeof document !== "undefined"`, import
 * tĩnh sẽ thành object rỗng lúc Next render phía server.
 *
 * Người bật "giảm chuyển động" trong hệ điều hành thì không tải gì cả.
 */

const SIZE = 50;
const MOTION_SRC = "/motion/lunara-mark.lottie.json";

export function LogoMark({ className = "" }: { className?: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let anim: AnimationItem | null = null;
    let cancelled = false;

    // Header là sticky nên logo luôn trên màn hình; thứ duy nhất đáng dừng là
    // lúc tab chạy nền, để khỏi quay vòng lặp vẽ vô ích và hao pin.
    const onVisibility = () => {
      if (!anim) return;
      if (document.hidden) anim.pause();
      else anim.play();
    };

    (async () => {
      try {
        const [{ default: lottie }, data] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch(MOTION_SRC).then((r) => r.json()),
        ]);
        if (cancelled || !host.current) return;
        anim = lottie.loadAnimation({
          container: host.current,
          renderer: "svg",
          loop: true,
          autoplay: !document.hidden,
          animationData: data,
        });
        document.addEventListener("visibilitychange", onVisibility);
        setReady(true);
      } catch {
        // Tải hỏng thì im lặng giữ ảnh tĩnh — logo không phải chỗ báo lỗi.
      }
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      anim?.destroy();
    };
  }, []);

  return (
    <span
      className={`relative block shrink-0 ${className}`}
      style={{ width: SIZE, height: SIZE }}
    >
      <Image
        src="/images/lunara-mark.png"
        alt="Lunara"
        width={SIZE}
        height={SIZE}
        priority
        className={`h-full w-full transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      <span
        ref={host}
        aria-hidden="true"
        className={`absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}
