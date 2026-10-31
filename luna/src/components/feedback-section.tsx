"use client";

import { useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { Star } from "lucide-react";
import { feedbacks, type Feedback } from "@/data/feedback";

/**
 * Dải góp ý trượt ngang ở trang chủ.
 *
 * Trượt bằng `motion` chứ không bằng @keyframes, vì project này viết style
 * trong component chứ không nới globals.css. Làm bằng JS cũng tiện hơn cho hai
 * thứ dưới đây, mà keyframes thuần không xử lý gọn được:
 * - Dừng khi rê chuột vào, để người ta kịp đọc hết một thẻ.
 * - Tôn trọng prefers-reduced-motion: ai tắt hiệu ứng thì danh sách đứng yên
 *   và cuộn ngang bằng tay, chứ không phải chữ chạy qua mặt.
 */

/** Tốc độ trượt, pixel mỗi giây. Chậm vừa đủ để đọc kịp khi lướt qua. */
const SPEED = 38;

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          aria-hidden="true"
          className={i <= count ? "fill-[#e0a53f] text-[#e0a53f]" : "text-[#ded3e6]"}
        />
      ))}
    </span>
  );
}

function Card({ item }: { item: Feedback }) {
  return (
    <figure className="m-0 flex w-[300px] shrink-0 flex-col gap-3 rounded-2xl border border-[#e8ddef] bg-[#fffbfae8] p-5 sm:w-[340px]">
      <Stars count={item.stars} />
      <blockquote className="m-0 text-[14px] leading-[1.75] text-[#4a4068]">
        {item.text}
      </blockquote>
      <figcaption className="mt-auto flex items-baseline gap-2 text-xs text-[#6b6287]">
        <strong className="font-medium text-[#281b44]">{item.name}</strong>
        {item.tool ? <span>· {item.tool}</span> : null}
        {item.when ? <span className="ml-auto">{item.when}</span> : null}
      </figcaption>
    </figure>
  );
}

export function FeedbackSection() {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (paused || reduced) return;
    const track = trackRef.current;
    if (!track) return;
    // Danh sách được nhân đôi, nên cuộn hết một nửa là quay về 0 mà mắt không
    // thấy mối nối. Lấy scrollWidth mỗi khung hình để còn đúng khi đổi cỡ màn.
    const half = track.scrollWidth / 2;
    if (!half) return;
    const next = x.get() - (delta / 1000) * SPEED;
    x.set(next <= -half ? next + half : next);
  });

  if (!feedbacks.length) return null;

  return (
    // mt-[46px] vì có SectionDivider ở trên gánh nửa còn lại; tổng vẫn ~92px
    // như các khoảng không có vạch. Trước đây chỗ này
    // chỉ có class "feedback-section" — một class không tồn tại trong
    // globals.css, nên section không nhận khoảng cách nào và dính vào khối trên.
    <section className="page-container mt-[46px]" data-reveal aria-labelledby="feedback-heading">
      {/* Dùng lại .experience-section-heading của lưới công cụ: cùng một cặp
          tiêu đề — mô tả, cùng cỡ chữ và khoảng cách, khỏi lệch nhịp trang. */}
      <div className="experience-section-heading">
        <div>
          <h2 id="feedback-heading">Người dùng nói gì về Lunara</h2>
          <p>Nội dung minh họa cho giao diện, chưa phải phản hồi từ người dùng thật</p>
        </div>
      </div>

      {/* Mặt nạ hai mép để thẻ mờ dần thay vì bị cắt ngang đột ngột. */}
      <div
        className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-4">
          {[...feedbacks, ...feedbacks].map((item, index) => (
            // Bản nhân đôi chỉ để chạy vòng, không đọc lại cho trình đọc màn hình.
            <div key={index} aria-hidden={index >= feedbacks.length}>
              <Card item={item} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
