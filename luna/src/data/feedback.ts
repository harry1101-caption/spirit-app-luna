import real from "./feedback.json";
import sample from "./feedback.sample.json";

/**
 * Góp ý của người dùng, hiện ở trang chủ.
 *
 * Hai nguồn, cố ý tách đôi:
 * - `feedback.json` — góp ý THẬT, do người dùng thật gửi và đã xin phép đăng.
 *   Đây là nguồn duy nhất chạy ở bản production.
 * - `feedback.sample.json` — nội dung mẫu để dựng giao diện, CHỈ nạp khi chạy
 *   `npm run dev`. Next loại hẳn nó khỏi bundle production nhờ nhánh
 *   `process.env.NODE_ENV` được rút gọn lúc build.
 *
 * Tách vậy để lúc làm giao diện vẫn thấy dải trượt đầy đủ 30 thẻ mà bản phát
 * hành không đăng lời khen của những người không có thật — thứ mà người đọc sẽ
 * hiểu là lời chứng thật, và nhiều nơi xem là hành vi gian dối với người tiêu
 * dùng. Khi có góp ý thật thì chép vào `feedback.json`, section tự hiện.
 *
 * Mảng rỗng thì `FeedbackSection` tự ẩn, trang chủ không hở khoảng trống nào.
 */

export type Feedback = {
  /** Tên người gửi, hoặc "Ẩn danh" nếu họ không muốn hiện tên. */
  name: string;
  /** 4 hoặc 5. Thấp hơn thì đừng đưa lên trang chủ, nên đọc để sửa app. */
  stars: 4 | 5;
  /** Nguyên văn lời họ viết. Đừng sửa thành câu mượt hơn. */
  text: string;
  /** Feature họ đã dùng, để người đọc biết lời khen dành cho phần nào. */
  tool?: string;
  /** Tháng gửi, dạng MM/YY. */
  when?: string;
};

/**
 * JSON không mang kiểu, nên `stars` ra `number` chứ không phải `4 | 5`. Lọc tại
 * chỗ này để một dòng gõ sai (3 sao, thiếu text) chỉ mất đúng dòng đó, chứ
 * không làm vỡ cả trang chủ.
 */
function valid(items: unknown[]): Feedback[] {
  return items.filter((item): item is Feedback => {
    const f = item as Partial<Feedback>;
    return (
      typeof f?.name === "string" && f.name.trim().length > 0 &&
      typeof f?.text === "string" && f.text.trim().length > 0 &&
      (f?.stars === 4 || f?.stars === 5)
    );
  });
}

export const feedbacks: Feedback[] = valid(
  process.env.NODE_ENV === "development" && !(real as unknown[]).length
    ? (sample as unknown[])
    : (real as unknown[]),
);
