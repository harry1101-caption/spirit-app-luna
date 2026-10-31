import Image from "next/image";
import Link from "next/link";
import { toolGroups, toolRoutes } from "@/components/tool-groups";
import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  TikTokIcon,
  YoutubeIcon,
} from "@/components/social-icons";

/**
 * Footer trang chủ, trải hết bề ngang màn hình.
 *
 * CẢNH BÁO khi sửa: globals.css có rule `footer { }` nằm ngoài cascade layer,
 * tự áp vào thẻ này và THẮNG mọi utility Tailwind không có hậu tố `!`. Nó đặt
 * display, align-items, gap, border-top, min-height, color, font-size, và cả
 * `max-width: 1316px; width: calc(100% - 124px); margin: 0 auto` — chính ba cái
 * sau khiến footer không thể full width nếu quên `!`. Thiếu một dấu là giá trị
 * cũ lặng lẽ thắng, không báo lỗi gì.
 *
 * Footer nằm trong luồng trang vốn đã bị thu hẹp, nên dùng lại mẹo full-bleed
 * có sẵn trong repo: `w-screen` + dịch sang trái nửa màn hình. Phần chữ bên
 * trong vẫn bó theo `.page-container` để thẳng hàng với các khối phía trên.
 *
 * Phần "Vài điều nên biết" không phải chữ trang trí: đó là những điều app đang
 * hứa ở từng form và giới hạn của nội dung. Đổi app thì sửa ở đây luôn.
 */

/** Các feature đã xây và có URL riêng, giữ nguyên thứ tự nhóm ở trang chủ. */
const links = toolGroups.flatMap((group) =>
  group.tools
    .filter((tool) => "action" in tool && tool.action && toolRoutes[tool.action])
    .map((tool) => ({
      title: tool.title,
      href: toolRoutes[(tool as { action: string }).action],
    })),
);

/**
 * Điền `url` khi đã có trang thật. Để trống thì icon vẫn hiện nhưng không phải
 * là link — thà vậy còn hơn trỏ vào một trang đoán mò có thể là của người khác.
 */
const socials: { name: string; url: string; Icon: typeof FacebookIcon }[] = [
  { name: "Facebook", url: "", Icon: FacebookIcon },
  { name: "Instagram", url: "", Icon: InstagramIcon },
  { name: "TikTok", url: "", Icon: TikTokIcon },
  { name: "Threads", url: "", Icon: ThreadsIcon },
  { name: "YouTube", url: "", Icon: YoutubeIcon },
];

const notes = [
  "Nội dung để bạn tự chiêm nghiệm, không thay thế lời khuyên y tế, tài chính hay pháp lý.",
  "Không cần đăng ký, không có tài khoản.",
  "Họ tên và ngày giờ sinh chỉ dùng để tính, không lưu lại trên máy chủ.",
  "Kết quả chỉ nằm trên thiết bị của bạn, và chỉ khi bạn chủ động bấm lưu.",
];

const badge =
  "flex h-9 w-9 items-center justify-center rounded-full border border-[#e2d4ec] bg-white/60 text-[#8a74a0]";

function ColumnTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xs! font-semibold tracking-[0.2em] text-[#8e6ba3] uppercase">
      {children}
    </h2>
  );
}

/**
 * Năm bản quyền tính ở phạm vi module, tức lúc build chứ không phải lúc render.
 *
 * Trước đây chỗ này là useState + useEffect, và chỉ vì nó mà cả footer phải
 * mang "use client" — toàn bộ JS của footer ship xuống trình duyệt trong khi
 * footer không có tương tác nào ngoài mấy cái link. Nó còn gây nháy: năm hiện
 * rỗng ở lần sơn đầu rồi mới nhảy vào sau khi hydrate.
 *
 * Không đặt `new Date()` trong thân component được: với `cacheComponents` bật,
 * Next báo lỗi blocking-prerender-current-time. Ở phạm vi module thì không
 * thuộc giai đoạn render nên hợp lệ, và năm bản quyền vốn chỉ cần đúng tới lần
 * deploy gần nhất.
 */
const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden! mt-[70px]! block! w-screen! max-w-none! left-1/2! -translate-x-1/2! border-0! border-t! border-t-[#e6d9ef]! bg-[linear-gradient(118deg,#efe7f6,#f6f0fb_55%,#f3ecf9)]! px-0! py-[clamp(38px,4vw,58px)]!">
      {/* Hoạ tiết nền: vài quầng sáng rất mờ cho dải gradient đỡ phẳng. Để
          dưới nội dung và pointer-events-none nên không che chữ, không chặn
          chuột. overflow-hidden nằm ở thẻ footer để quầng không tràn ra ngoài. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_200px_at_82%_12%,#ffffff95,transparent),radial-gradient(320px_180px_at_12%_88%,#e4d3f399,transparent)]"
      />
      <div className="page-container relative">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-[1.15fr_1.25fr_1.3fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/images/lunara-mark.png" alt="" width={42} height={42} />
              <span className="font-[family-name:var(--font-serif-app)] text-[30px] leading-none tracking-[-0.02em] text-[#6d4b85]">
                Lunara
              </span>
            </div>
            {/* Tránh lặp câu của .closing-note ngay phía trên ("Một vũ trụ
                khác, ở ngay trong bạn") — hai câu cùng ý nằm sát nhau sẽ nhạt. */}
            <p className="mt-3.5 max-w-[26ch] font-[family-name:var(--font-serif-app)] text-[17px]! leading-[1.55] text-[#7a608f]">
              Hiểu mình, một chút mỗi ngày.
            </p>
            {/* Vạch trang trí dưới slogan: hai nét mảnh mờ dần ôm lấy một vầng
                trăng nhỏ. Dùng ☾ cho đồng bộ với .daily-reading-moon bên
                Chiêm tinh, thay vì thêm một icon mới cho cùng một ý. */}
            <div aria-hidden="true" className="mt-3.5 flex items-center gap-2.5">
              <span className="h-px w-11 bg-[linear-gradient(90deg,transparent,#cdb3de)]" />
              <span className="font-[family-name:var(--font-serif-app)] text-[15px] leading-none text-[#c2a05f]">
                ☾
              </span>
              <span className="h-px w-11 bg-[linear-gradient(90deg,#cdb3de,transparent)]" />
            </div>
            <ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
              {socials.map(({ name, url, Icon }) => (
                <li key={name}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={name}
                      className={`${badge} transition-colors hover:border-[#ac88cf] hover:bg-white hover:text-[#5d3f77]`}
                    >
                      <Icon size={17} />
                    </a>
                  ) : (
                    <span className={`${badge} opacity-55`} title={name} aria-label={name} role="img">
                      <Icon size={17} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Các trải nghiệm">
            <ColumnTitle>Trải nghiệm</ColumnTitle>
            <ul className="mt-4 grid list-none grid-cols-2 gap-x-6 gap-y-2.5 p-0">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px]! text-[#6f5f84] transition-colors hover:text-[#5d3f77]"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <ColumnTitle>Vài điều nên biết</ColumnTitle>
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
              {notes.map((note) => (
                <li
                  key={note}
                  className="flex gap-2.5 text-xs! leading-[1.75] text-[#7d6b8e]"
                >
                  <span aria-hidden="true" className="mt-px text-[#c2a7d2]">
                    ✦
                  </span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#e3d6ec] pt-5 text-xs! text-[#9b89aa]">
          © {YEAR} Lunara
        </div>
      </div>
    </footer>
  );
}
