/**
 * Xin Xăm Quan Âm — phần tính tại chỗ.
 *
 * Nghi thức thật gồm ba bước: khấn và nêu câu hỏi, lắc ống cho tới khi một thẻ
 * rơi ra, rồi gieo keo để hỏi lại xem có đúng quẻ đó không. Chỉ khi được
 * "thánh keo" (một ngửa một sấp) mới nhận quẻ; ra kết quả khác thì lắc lại.
 *
 * HAI QUY ƯỚC CỦA BẢN NÀY, cả hai đều cố ý:
 *
 * 1. Quẻ KHOÁ THEO (câu hỏi + thiết bị + ngày). Cùng một câu hỏi, cùng một
 *    ngày, hỏi lại bao nhiêu lần cũng ra đúng quẻ đó. Nghi thức vốn kiêng việc
 *    xin đi xin lại tới khi vừa ý; nếu để mỗi lần bấm ra một quẻ mới thì app
 *    thành cái máy quay cho tới khi trúng quẻ đẹp.
 *
 * 2. Gieo keo thì KHÔNG khoá, mỗi lần gieo một kết quả. Đó là phần duy nhất
 *    người xin được phép lặp lại trong nghi thức thật.
 *
 * Không dùng Math.random() cho phần quẻ: phải tính lại được từ cùng dữ kiện thì
 * mới kiểm thử được, và mới giữ được quy ước 1.
 */

import { hash, normalizeQuestion } from "./seeded.ts";

/** Số thẻ trong ống xăm Quan Âm. */
export const STICK_COUNT = 100;

/**
 * Bốn cấp quẻ theo truyền thống. Không có cấp nào là "điềm gở" — cấp chỉ nói
 * việc thuận hay nghịch ở thời điểm hỏi, không phải phán về người hỏi.
 */
export const grades = [
  "Thượng thượng", "Thượng cát", "Trung cát", "Trung bình", "Trung hạ", "Hạ",
] as const;
export type Grade = (typeof grades)[number];

export const gradeMeaning: Record<Grade, string> = {
  "Thượng thượng": "Việc đang rất thuận. Cứ đi tiếp theo hướng đã định.",
  "Thượng cát": "Thuận. Còn vài chỗ nhỏ nên để ý thêm.",
  "Trung cát": "Nghiêng về thuận, nhưng cần bạn chủ động hơn.",
  "Trung bình": "Chưa ngã ngũ. Kết quả tuỳ cách bạn xử lý từ đây.",
  "Trung hạ": "Hơi vướng. Nên xem lại cách làm trước khi đi tiếp.",
  "Hạ": "Đang có trở ngại. Chậm lại và xem kỹ trước khi quyết.",
};

/** Ba kết quả khi gieo hai mảnh keo. */
export const keoResults = ["thánh", "cười", "âm"] as const;
export type KeoResult = (typeof keoResults)[number];

export const keoMeaning: Record<KeoResult, string> = {
  "thánh": "Một ngửa một sấp — nhận quẻ này.",
  "cười": "Hai mặt ngửa — câu hỏi chưa rõ, hãy nghĩ lại rồi hỏi gọn hơn.",
  "âm": "Hai mặt sấp — chưa nên hỏi việc này lúc này.",
};

export type XinXamDraw = {
  /** Số quẻ, 1 tới 100. */
  stick: number;
  question: string;
  day: string;
};



/**
 * Rút quẻ. Cùng (câu hỏi, thiết bị, ngày) luôn ra cùng một số.
 *
 * `device` là chuỗi ổn định của từng máy, để hai người hỏi cùng câu trong cùng
 * ngày không nhận chung một quẻ.
 */
export function drawStick(
  question: string,
  device: string,
  day: string,
  /** Số thẻ thật sự có trong bộ. Truyền vào để không rút trúng thẻ chưa có nội dung. */
  count: number = STICK_COUNT,
): XinXamDraw {
  const seed = `${normalizeQuestion(question)}|${device}|${day}`;
  const size = Math.max(1, Math.min(count, STICK_COUNT));
  return { stick: (hash(seed) % size) + 1, question: question.trim(), day };
}

/**
 * Gieo keo. Mỗi lần gieo độc lập, nên dùng Math.random() — đây đúng là chỗ
 * người xin được gieo lại trong nghi thức thật.
 *
 * Hai mảnh keo, mỗi mảnh một mặt phẳng một mặt cong, nên xác suất xấp xỉ
 * 1/2 thánh, 1/4 cười, 1/4 âm.
 */
/** Mặt ngửa là mặt cong hướng lên; mặt sấp là mặt phẳng hướng lên. */
export const faces = ["ngửa", "sấp"] as const;
export type Face = (typeof faces)[number];

export type KeoCast = { faces: [Face, Face]; result: KeoResult };

export function castKeo(): KeoCast {
  const roll = (): Face => (Math.random() < 0.5 ? "ngửa" : "sấp");
  const a = roll();
  const b = roll();
  // Trả cả hai mặt chứ không chỉ kết quả, để giao diện vẽ đúng thứ đã gieo
  // thay vì tự bịa ra hai mặt rồi dán nhãn kết quả lên trên.
  const result: KeoResult = a !== b ? "thánh" : a === "ngửa" ? "cười" : "âm";
  return { faces: [a, b], result };
}

/** Câu hỏi quá ngắn hoặc bỏ trống thì không rút được quẻ có nghĩa. */
export function checkQuestion(question: string) {
  const clean = question.trim();
  if (clean.length < 8)
    return { ok: false as const, error: "Hãy viết câu hỏi rõ hơn, ít nhất một câu trọn vẹn." };
  if (clean.length > 300)
    return { ok: false as const, error: "Câu hỏi hơi dài. Hãy rút gọn còn một hai câu." };
  if (!normalizeQuestion(clean))
    return { ok: false as const, error: "Câu hỏi cần có chữ, không chỉ dấu câu." };
  return { ok: true as const };
}

/**
 * Hai câu mẫu, bấm vào là điền sẵn. Cố ý chọn một việc đang phân vân và một
 * mối quan hệ — hai chuyện người ta hay mang tới chùa nhất, và đều là câu hỏi
 * MỞ chứ không phải câu có/không, vì quẻ không trả lời có/không.
 */
export const sampleQuestions = [
  "Tôi đang phân vân giữa ở lại chỗ làm cũ và nhận việc mới. Tôi nên để ý điều gì?",
  "Mối quan hệ này đang chững lại. Tôi có thể làm gì cho nó nhẹ hơn?",
];

export const ritualSteps = [
  "Ngồi yên một lát, để tâm lắng xuống.",
  "Nghĩ rõ một việc đang bận lòng, thành một câu hỏi gọn.",
  "Lắc ống cho tới khi một thẻ rơi ra.",
  "Gieo keo để hỏi lại xem có đúng quẻ ấy không.",
];

export const notes = [
  "Mỗi câu hỏi trong ngày chỉ ứng một quẻ. Hỏi lại cùng câu sẽ ra đúng quẻ đó, vì nghi thức vốn kiêng việc xin đi xin lại cho tới khi vừa ý.",
  "Quẻ Hạ không phải điềm gở. Nó nói việc đang vướng ở thời điểm này, không phán về con người bạn.",
  "Đây là nội dung để chiêm nghiệm, không thay thế lời khuyên y tế, tài chính hay pháp lý.",
];
