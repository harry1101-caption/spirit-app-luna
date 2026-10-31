import Image from "next/image";

/**
 * "Chọn một chủ đề để bắt đầu" — lối vào theo CÂU HỎI thay vì theo tên phương
 * pháp. Lưới công cụ phía trên đã hỏi "bạn muốn dùng gì"; khối này hỏi "bạn
 * đang bận tâm chuyện gì", cho người chưa biết Tarot khác Tử Vi ra sao.
 *
 * Mỗi chủ đề dẫn tới phương pháp hợp với nó, không phải cả bốn cùng đổ về một
 * chỗ: ba chủ đề mở Tarot với chủ đề đã chọn sẵn, riêng "Bản thân" mở trắc
 * nghiệm tính cách vì câu hỏi của nó đúng là thứ bài trắc nghiệm trả lời.
 */

export type Topic = {
  key: string;
  title: string;
  question: string;
  image: string;
  /** Màu nền và viền thẻ, mỗi chủ đề một sắc riêng như thiết kế. */
  tint: string;
};

export const topics: Topic[] = [
  {
    key: "love",
    title: "Tình yêu",
    question: "Mối quan hệ này có thể tiến triển như thế nào?",
    image: "/images/topics/love.png",
    tint: "border-[#f3dde0] bg-[linear-gradient(135deg,#fdf1f2,#fffafa)]",
  },
  {
    key: "work",
    title: "Công việc",
    question: "Tôi nên cân nhắc điều gì trước một quyết định lớn?",
    image: "/images/topics/work.png",
    tint: "border-[#ddd9f1] bg-[linear-gradient(135deg,#f1effb,#fbfaff)]",
  },
  {
    key: "self",
    title: "Bản thân",
    question: "Những đặc điểm nào trong tính cách đang ảnh hưởng đến tôi?",
    image: "/images/topics/self.png",
    tint: "border-[#dfe8db] bg-[linear-gradient(135deg,#f2f7ef,#fcfdfb)]",
  },
  {
    key: "future",
    title: "Tương lai",
    question: "Tôi muốn khám phá những khả năng và hướng đi phía trước.",
    image: "/images/topics/future.png",
    tint: "border-[#f0e3cd] bg-[linear-gradient(135deg,#fdf6e9,#fffcf7)]",
  },
];

/** Tra chủ đề theo key, dùng khi đọc lại từ query string sau khi tải lại trang. */
export const topicByKey = (key: string | undefined) =>
  topics.find((t) => t.key === key);

export function TopicPicker({ onPick }: { onPick: (topic: Topic) => void }) {
  return (
    <section
      className="page-container relative pt-[46px]"
      data-reveal
      aria-labelledby="topic-picker"
    >
      <div className="text-center">
        <span className="text-xs font-medium tracking-[0.22em] text-[#8e6ba3] uppercase">
          Bạn đang muốn tìm hiểu điều gì?
        </span>
        <h2
          id="topic-picker"
          className="mt-3.5! font-[family-name:var(--font-serif-app)] text-[clamp(27px,3.2vw,38px)] font-normal tracking-[-0.01em] text-[#3d2a52]"
        >
          Chọn một chủ đề để bắt đầu
        </h2>
        <p className="mx-auto! mt-3! max-w-[70ch] text-[13px] leading-[1.75] text-[#7d6b8e]">
          Mỗi câu hỏi đều mở ra một góc nhìn mới. Lunara gợi ý phương pháp phù
          hợp và đồng hành cùng bạn khám phá.
        </p>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic) => (
          <button
            key={topic.key}
            type="button"
            onClick={() => onPick(topic)}
            aria-label={`Bắt đầu với chủ đề ${topic.title}`}
            className={`group relative flex min-h-[140px] items-stretch overflow-hidden rounded-[18px] border py-4 pr-5 pl-[47%] text-left transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_#6b4b8214] ${topic.tint}`}
          >
            {/* Tranh minh hoạ tràn ra khỏi mép trái và mép dưới, để bo góc của
                thẻ tự cắt nó — thế mới ra cảm giác tranh vẽ liền với thẻ, chứ
                nhốt trong một ô vuông thì nhìn như ảnh dán vào. Chừa chỗ cho
                nó bằng padding-left của thẻ thay vì cho nó chiếm một cột, để
                phần chữ không bị bóp khi tên chủ đề dài.

                HAI CON SỐ PHẢI ĂN KHỚP: bề rộng ảnh (44%) luôn nhỏ hơn
                padding-left của thẻ (47%), nếu không ảnh sẽ đè lên chữ.

                Mặt nạ làm nhoè cạnh phải: mấy tranh này có sẵn quầng trắng
                quanh viền, cắt thẳng đứng sẽ lộ ra một hình chữ nhật sáng nổi
                trên nền thẻ. Cho nó tan dần thì tranh hoà vào thẻ. */}
            <Image
              src={topic.image}
              alt=""
              width={360}
              height={360}
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2 -left-2 h-[calc(100%+18px)] w-[44%] object-contain object-left-bottom [mask-image:linear-gradient(90deg,#000_62%,transparent)]"
            />
            <span className="relative flex min-w-0 flex-1 flex-col justify-center">
              <strong className="block font-[family-name:var(--font-serif-app)] text-[19px] leading-tight font-semibold text-[#3d2a52]">
                {topic.title}
              </strong>
              <em className="mt-1.5 block text-[12.5px] leading-[1.65] font-normal text-[#7d6b8e] not-italic">
                “{topic.question}”
              </em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
