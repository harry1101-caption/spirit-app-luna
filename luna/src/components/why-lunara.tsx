import Image from "next/image";
import { BookOpen, Bookmark, Layers, MessageCircle } from "lucide-react";
import { SectionDivider } from "@/components/section-divider";

/**
 * Khối "Vì sao chọn Lunara": bốn thẻ bo tròn xếp 2×2 ôm lấy một ảnh tròn ở
 * giữa. Trên màn hẹp ảnh tụt xuống giữa hai hàng thẻ, vì xếp ba cột trên điện
 * thoại thì thẻ hẹp tới mức chữ vỡ dòng liên tục.
 *
 * Mỗi ý là một tính chất CÓ THẬT, kiểm được trong code. Bỏ tính chất nào thì
 * xoá luôn thẻ đó, đừng để trang chủ hứa điều app không còn làm:
 * - 01 nhiều phương pháp: `tool-groups.ts`, 10 feature đã xây.
 * - 02 hỏi tiếp: `deepQuestions` trong TarotFlow, màn "Khám phá sâu hơn".
 * - 03 dễ hiểu: `interpretation-style.ts`.
 * - 04 lưu lại: lịch sử trong localStorage, mục "Khám phá của tôi".
 */

const reasons = [
  {
    no: "01",
    icon: Layers,
    title: "Nhiều phương pháp trong một nơi",
    text: "Tarot, Tử Vi, Bát Tự, Chiêm tinh, Thần số học — tất cả trong một nơi.",
  },
  {
    no: "02",
    icon: MessageCircle,
    title: "Không chỉ xem một lần",
    text: "Bạn có thể đặt câu hỏi tiếp, làm rõ kết quả và nhận gợi ý phù hợp với tình huống của mình.",
  },
  {
    no: "03",
    icon: BookOpen,
    title: "Dễ hiểu, không cần biết thuật ngữ",
    text: "Khái niệm và biểu tượng đều được giải thích bằng lời thường, gần gũi và dễ áp dụng ngay.",
  },
  {
    no: "04",
    icon: Bookmark,
    title: "Xem lại và lưu kết quả",
    text: "Lưu những lần khám phá quan trọng để đọc lại, theo dõi hành trình theo thời gian.",
  },
];

function ReasonCard({ item, className = "" }: { item: (typeof reasons)[number]; className?: string }) {
  const { icon: Icon, no, title, text } = item;
  return (
    // Hai lớp viền lồng nhau: vòng vàng mảnh bên ngoài, thẻ trắng bên trong
    // cách ra 5px. Một viền đơn không ra được nét vàng mảnh tách rời như thiết
    // kế, nên phải tách thành hai thẻ chứ không gộp.
    <article className={`rounded-[999px] border border-[#ecdfc6] p-[5px] ${className}`}>
      <div className="flex h-full items-start gap-5 rounded-[999px] border border-[#f1e9f6] bg-white px-7 py-6 shadow-[0_8px_26px_#6b4b820a]">
        {/* pl-7 của thẻ đã đủ để icon không chạm vào đường cong hai đầu. */}
        <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#efe9fc] text-[#6f5aa6]">
          <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <h3 className="min-w-0 flex-1 font-[family-name:var(--font-serif-app)] text-[19px] leading-[1.35] font-semibold text-[#2e1f4a]">
              {title}
            </h3>
            <span aria-hidden="true" className="mt-1 shrink-0 text-[11px] tracking-[0.1em] text-[#b9abc7]">
              {no}
            </span>
          </div>
          <p className="mt-2! text-[13.5px] leading-[1.75] text-[#6f6386]">{text}</p>
        </div>
      </div>
    </article>
  );
}

export function WhyLunara() {
  return (
    // Không pt: SectionDivider phía trên và margin 46px của dải nền đã gánh
    // khoảng cách, giống mọi section khác trên trang chủ (46px trên/dưới hoạ tiết).
    <section
      className="page-container relative"
      data-reveal
      aria-labelledby="why-lunara"
    >
      <div className="text-center">
        <h2
          id="why-lunara"
          className="font-[family-name:var(--font-serif-app)] text-[clamp(30px,3.6vw,44px)] font-normal tracking-[-0.01em] text-[#3d2a52]"
        >
          Vì sao chọn Lunara
        </h2>
        <p className="mx-auto! mt-3.5! max-w-[56ch] text-[13.5px] leading-[1.8] text-[#7d6b8e]">
          Nhiều phương pháp, dễ hiểu, cá nhân hoá và luôn đồng hành cùng bạn
          trong những câu hỏi quan trọng của cuộc sống.
        </p>
      </div>

      {/* MỘT lưới 3 cột × 2 hàng, không phải ba cột rời. Tách cột thì mỗi cột
          tự tính chiều cao nên thẻ trái và phải lệch nhau khi chữ dài ngắn khác
          nhau; gộp lại thì các ô cùng hàng tự bằng nhau, và `grid-rows-2` cho
          hai hàng bằng nhau luôn. Ảnh chiếm cột giữa, trải cả hai hàng. */}
      <div className="mt-11 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-2 lg:gap-x-8">
        <ReasonCard item={reasons[0]} className="lg:col-start-1 lg:row-start-1" />
        <ReasonCard item={reasons[2]} className="lg:col-start-1 lg:row-start-2" />

        <div className="mx-auto w-[min(86vw,330px)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:w-[330px] lg:self-center">
          <Image
            src="/images/why-lunara-orb.png"
            alt=""
            width={660}
            height={660}
            className="h-auto w-full"
          />
        </div>

        <ReasonCard item={reasons[1]} className="lg:col-start-3 lg:row-start-1" />
        <ReasonCard item={reasons[3]} className="lg:col-start-3 lg:row-start-2" />
      </div>

      <SectionDivider index={3} className="mt-[46px]" />

    </section>
  );
}
