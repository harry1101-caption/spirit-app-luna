import { cards, type Report, today } from "./engine.ts";

/**
 * Lá bài hôm nay: rút một lá Ẩn Chính (id 0–21), hiện một thông điệp.
 *
 * Nội dung viết sẵn, không gọi AI — feature này cần bấm là ra ngay, mà một
 * lượt gọi provider mất tới 30 giây. Cũng nhờ vậy nó chạy được khi chưa cấu
 * hình AI_API_KEY.
 */

/** Chỉ Ẩn Chính. Ẩn Phụ (id 22–77) được thiết kế để đọc trong trải bài nhiều lá. */
export const dailyCardIds = Array.from({ length: 22 }, (_, id) => id);

/** Thông điệp theo id lá, cùng thứ tự với `vietnamese` trong engine. */
const messages = [
  "Hôm nay bạn không cần biết trước đường đi. Một bước chân đặt xuống với lòng tò mò còn đáng giá hơn một kế hoạch hoàn hảo chưa bắt đầu.",
  "Những gì bạn cần đã nằm trong tay rồi. Thay vì đợi thêm điều kiện, thử dùng đúng một thứ bạn đang có cho việc bạn đã hoãn lại.",
  "Có điều gì đó bạn đã cảm thấy nhưng chưa nói thành lời. Hôm nay hãy để nó yên đó và lắng nghe thêm, chưa cần vội kết luận.",
  "Điều bạn chăm sóc sẽ lớn lên theo cách của nó. Hãy dịu dàng với một việc, một người, hoặc chính bạn hôm nay.",
  "Một chút cấu trúc sẽ làm ngày của bạn nhẹ hơn. Chọn ra thứ quan trọng nhất và cho nó một chỗ đứng rõ ràng.",
  "Bạn không phải tự mình tìm ra mọi thứ. Có những điều người đi trước đã hiểu, và hỏi không làm bạn nhỏ đi.",
  "Lựa chọn hôm nay nên xuất phát từ điều bạn thật sự trân trọng, chứ không phải từ điều có vẻ hợp lý với người khác.",
  "Bạn đang đi đúng hướng hơn bạn nghĩ. Giữ tay lái, đừng để mỗi tiếng ồn bên đường làm bạn đổi lộ trình.",
  "Sức mạnh hôm nay không nằm ở việc gồng lên, mà ở chỗ bạn đủ kiên nhẫn với phần chưa hoàn hảo của mình.",
  "Hãy cho mình một khoảng lặng. Có những câu trả lời chỉ xuất hiện khi bạn ngừng tìm kiếm chúng.",
  "Mọi thứ đang chuyển động, kể cả khi bạn chưa thấy. Phần bạn làm chủ là cách mình đáp lại, không phải vòng quay.",
  "Hôm nay hợp để nhìn thẳng vào một việc bạn vẫn né. Sự thật, khi được gọi tên, thường nhẹ hơn lúc còn mơ hồ.",
  "Thử đổi góc nhìn về điều đang mắc kẹt. Đôi khi không phải bạn cần cố thêm, mà cần nhìn nó từ một phía khác.",
  "Có điều gì đó đã hết vai trò trong đời bạn. Buông nó xuống không phải mất mát, mà là dọn chỗ cho phần đang tới.",
  "Hôm nay nghiêng về sự cân bằng. Không cần quyết liệt, chỉ cần pha trộn đúng liều giữa nghỉ và làm.",
  "Để ý xem điều gì đang giữ bạn mà bạn gọi là thói quen. Nhận ra sợi dây cũng đã là nới lỏng nó rồi.",
  "Một thứ đổ xuống không có nghĩa là bạn đổ xuống. Những gì còn đứng vững sau hôm nay là phần thật sự thuộc về bạn.",
  "Giữ lấy niềm hy vọng nhỏ bạn đang mang. Nó không ngây thơ đâu, nó là thứ đưa bạn đi tiếp.",
  "Nếu hôm nay mọi thứ còn mờ, không sao cả. Bạn không cần nhìn rõ toàn bộ con đường để bước bước kế tiếp.",
  "Hãy để mình được vui một cách đơn giản. Bạn không nợ ai một lời giải thích cho điều khiến bạn nhẹ lòng.",
  "Có một chuyện cũ đang xin được nhìn lại. Hôm nay bạn đủ bình tĩnh để hiểu nó khác với lúc nó xảy ra.",
  "Một vòng nào đó trong bạn vừa khép lại trọn vẹn. Hãy ghi nhận nó trước khi vội bắt đầu điều tiếp theo.",
];

/**
 * Hash ổn định → cùng một seed luôn ra cùng một lá, nên lá của ngày không đổi
 * khi refresh. Không dùng Math.random vì cần tái lập được.
 *
 * FNV-1a đơn thuần không đủ: hai ngày liên tiếp chỉ khác nhau chữ số cuối nên
 * kết quả tương quan mạnh, chuỗi lá chạy thành dãy tăng/giảm (đo được 64.8% số
 * ngày kề nhau ra lá cách nhau ≤1, trong khi ngẫu nhiên thật là ~13.6%). Bước
 * avalanche phía sau (murmur3 finalizer) phá tương quan đó, đưa về 14.1%.
 */
function hash(seed: string) {
  let value = 2166136261;
  for (const char of seed) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  value ^= value >>> 16;
  value = Math.imul(value, 2246822507);
  value ^= value >>> 13;
  value = Math.imul(value, 3266489909);
  value ^= value >>> 16;
  return value >>> 0;
}

/** Lá của một ngày cho một thiết bị. `recent` là các lá đã ra gần đây, để tránh lặp. */
export function drawDailyCard(seed: string, day: string, recent: number[] = []) {
  const start = hash(`${seed}:${day}`) % 22;
  for (let step = 0; step < 22; step += 1) {
    const id = (start + step) % 22;
    if (!recent.includes(id)) return id;
  }
  return start;
}

export function dailyCardMessage(id: number) {
  return messages[id];
}

export function buildDailyCardReport(id: number, day = today()): Report {
  const card = cards[id];
  return {
    id: `dailycard-${day}-${id}`,
    type: "dailycard",
    title: card.vi,
    subtitle: `Lá bài hôm nay · ${day}`,
    summary: messages[id],
    sections: [],
    reflection: "Điều gì trong thông điệp này chạm đến bạn nhiều nhất?",
    source: "fallback",
    date: new Date().toISOString(),
    cards: [id],
    reversed: [false],
  };
}
