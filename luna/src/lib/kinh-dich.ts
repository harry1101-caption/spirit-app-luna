/**
 * Kinh Dịch — gieo quẻ bằng ba đồng xu, phần tính tại chỗ.
 *
 * Mỗi lần gieo ba đồng: ngửa tính 3, sấp tính 2, cộng lại ra 6, 7, 8 hoặc 9.
 *   6 = lão âm (âm, động)    7 = thiếu dương (dương, tĩnh)
 *   8 = thiếu âm (âm, tĩnh)  9 = lão dương (dương, động)
 * Gieo sáu lần, dựng quẻ từ hào 1 (dưới cùng) lên hào 6. Hào động đổi âm ↔ dương
 * để ra quẻ biến; quẻ hỗ lấy hào 2–4 làm quẻ dưới, hào 3–5 làm quẻ trên.
 *
 * Như Xin xăm, quẻ KHOÁ THEO (câu hỏi + thiết bị + ngày): "sơ phệ cáo, tái tam
 * độc" — hỏi lần đầu thì quẻ trả lời, hỏi đi hỏi lại là nhờn. Mặt từng đồng xu
 * được tính thật từ hạt giống đó, giao diện chỉ lật ra đúng những mặt ấy.
 */
import { hash, normalizeQuestion } from "./seeded.ts";
import data from "../data/kinh-dich.json" with { type: "json" };

/** Tám quẻ đơn, hào viết từ dưới lên (true = dương). */
export const trigrams = {
  "Càn": { nature: "Thiên", image: "Trời", lines: [true, true, true] },
  "Đoài": { nature: "Trạch", image: "Đầm", lines: [true, true, false] },
  "Ly": { nature: "Hỏa", image: "Lửa", lines: [true, false, true] },
  "Chấn": { nature: "Lôi", image: "Sấm", lines: [true, false, false] },
  "Tốn": { nature: "Phong", image: "Gió", lines: [false, true, true] },
  "Khảm": { nature: "Thủy", image: "Nước", lines: [false, true, false] },
  "Cấn": { nature: "Sơn", image: "Núi", lines: [false, false, true] },
  "Khôn": { nature: "Địa", image: "Đất", lines: [false, false, false] },
} as const;
export type TrigramName = keyof typeof trigrams;

type RawHexagram = { so: number; ten: string; chu: string; tren: TrigramName; duoi: TrigramName; tuKhoa: string[]; y: string };
export type Hexagram = RawHexagram & {
  /** Tên đầy đủ: "Thủy Lôi Truân", quẻ thuần thì "Thuần Càn". */
  tenDayDu: string;
  /** Sáu hào từ dưới lên, true = dương. */
  lines: boolean[];
};

const key = (lines: boolean[]) => lines.map((yang) => (yang ? "1" : "0")).join("");

export const hexagrams: Hexagram[] = (data as RawHexagram[]).map((h) => ({
  ...h,
  tenDayDu: h.tren === h.duoi ? `Thuần ${h.ten}` : `${trigrams[h.tren].nature} ${trigrams[h.duoi].nature} ${h.ten}`,
  lines: [...trigrams[h.duoi].lines, ...trigrams[h.tren].lines],
}));
const byLines = new Map(hexagrams.map((h) => [key(h.lines), h]));

export function hexagramOf(lines: boolean[]): Hexagram {
  const found = byLines.get(key(lines));
  if (!found) throw new Error(`Không có quẻ cho ${key(lines)}`);
  return found;
}

/** Vị trí sáu hào, để luận hào động và để AI có khung mà bám. */
export const linePositions = [
  "Hào 1 — lúc khởi đầu, việc còn ở bên dưới, chưa lộ ra.",
  "Hào 2 — phần bên trong, cách bạn tự xoay xở.",
  "Hào 3 — chỗ chuyển tiếp giữa trong và ngoài, dễ chênh vênh.",
  "Hào 4 — bước ra bên ngoài, tiếp cận người có ảnh hưởng.",
  "Hào 5 — vị trí chủ đạo, nơi việc được quyết.",
  "Hào 6 — đoạn cuối, việc đã đi hết đà, dễ quá tay.",
];

export const coinFaces = ["ngửa", "sấp"] as const;
export type CoinFace = (typeof coinFaces)[number];
export type Toss = { coins: [CoinFace, CoinFace, CoinFace]; value: 6 | 7 | 8 | 9 };
export type LineState = { yang: boolean; moving: boolean };

export const tossMeaning: Record<Toss["value"], string> = {
  6: "Lão âm — hào âm đang động, sẽ chuyển thành dương.",
  7: "Thiếu dương — hào dương, tĩnh.",
  8: "Thiếu âm — hào âm, tĩnh.",
  9: "Lão dương — hào dương đang động, sẽ chuyển thành âm.",
};

export type KinhDichCast = {
  question: string;
  day: string;
  tosses: Toss[];
  lines: LineState[];
  /** Số thứ tự các hào động, 1–6 tính từ dưới lên. */
  movingLines: number[];
  primary: Hexagram;
  nuclear: Hexagram;
  changed: Hexagram | null;
};

/** Gieo sáu lần ba đồng xu. Cùng (câu hỏi, thiết bị, ngày) luôn ra cùng quẻ. */
export function castHexagram(question: string, device: string, day: string): KinhDichCast {
  const seed = `kinh-dich|${normalizeQuestion(question)}|${device}|${day}`;
  const tosses: Toss[] = Array.from({ length: 6 }, (_, t) => {
    const coins = [0, 1, 2].map((c) => (hash(`${seed}|${t}|${c}`) & 1 ? "ngửa" : "sấp")) as Toss["coins"];
    const value = coins.reduce<number>((sum, face) => sum + (face === "ngửa" ? 3 : 2), 0) as Toss["value"];
    return { coins, value };
  });
  const lines = tosses.map(({ value }) => ({ yang: value === 7 || value === 9, moving: value === 6 || value === 9 }));
  const primaryLines = lines.map((l) => l.yang);
  const movingLines = lines.flatMap((l, i) => (l.moving ? [i + 1] : []));
  return {
    question: question.trim(),
    day,
    tosses,
    lines,
    movingLines,
    primary: hexagramOf(primaryLines),
    nuclear: hexagramOf([...primaryLines.slice(1, 4), ...primaryLines.slice(2, 5)]),
    changed: movingLines.length ? hexagramOf(lines.map((l) => (l.moving ? !l.yang : l.yang))) : null,
  };
}

/** Câu hỏi quá ngắn hoặc bỏ trống thì không gieo được quẻ có nghĩa. */
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

/** Câu mẫu: câu hỏi MỞ về hướng đi, vì Kinh Dịch không trả lời có/không. */
export const sampleQuestions = [
  "Tôi đang muốn bắt đầu một dự án riêng. Tôi nên chú ý điều gì lúc này?",
  "Công việc hiện tại khiến tôi mệt mỏi. Tôi nên nhìn nó theo hướng nào?",
];

export const ritualSteps = [
  "Lắng lại, nghĩ rõ một việc đang bận lòng thành một câu hỏi mở.",
  "Gieo ba đồng xu sáu lần. Mỗi lần cho ra một hào, dựng từ dưới lên.",
  "Xem quẻ chủ để hiểu tình thế hiện tại.",
  "Xem hào động và quẻ biến để thấy việc đang chuyển về đâu.",
];

export const notes = [
  "Mỗi câu hỏi trong ngày chỉ ứng một quẻ. Kinh Dịch có câu \"sơ phệ cáo, tái tam độc\": hỏi lần đầu thì được trả lời, hỏi đi hỏi lại là nhờn.",
  "Không có quẻ xấu hay tốt tuyệt đối. Quẻ mô tả thế của sự việc lúc bạn hỏi, và thế nào cũng có cách ứng xử hợp.",
  "Đây là nội dung để chiêm nghiệm, không thay thế lời khuyên y tế, tài chính hay pháp lý.",
];
