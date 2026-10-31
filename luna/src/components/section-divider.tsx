/**
 * Vạch ngăn giữa hai section: hai nét mảnh mờ dần ôm một ký hiệu thiên thể.
 *
 * Ký hiệu đổi luân phiên trăng / mặt trời theo `index`, KHÔNG dùng
 * Math.random(). Random lúc render sẽ cho ra ký hiệu khác nhau giữa lần render
 * phía server và phía client, React báo lỗi hydration và ký hiệu nhảy một nhịp
 * ngay trước mắt người dùng. Luân phiên theo vị trí vẫn ra hiệu ứng "mỗi chỗ
 * một kiểu" mà kết quả ổn định.
 *
 * Dùng ☾ và ☼ chứ không phải ☀: ☀ hay bị hệ điều hành đổi thành emoji màu, còn
 * ☼ giữ được nét chữ mảnh cùng tông với ☾.
 */

const glyphs = ["☾", "☼"] as const;

export function SectionDivider({
  index = 0,
  className = "",
}: {
  /** Vị trí của vạch trên trang, quyết định hiện trăng hay mặt trời. */
  index?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3.5 ${className}`}
    >
      <span className="h-px w-[clamp(52px,9vw,104px)] bg-[linear-gradient(90deg,transparent,#d6c3e3)]" />
      <span className="font-[family-name:var(--font-serif-app)] text-[16px] leading-none text-[#c2a05f]">
        {glyphs[index % glyphs.length]}
      </span>
      <span className="h-px w-[clamp(52px,9vw,104px)] bg-[linear-gradient(90deg,#d6c3e3,transparent)]" />
    </div>
  );
}
