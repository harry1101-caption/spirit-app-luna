/**
 * "Bói tình duyên qua tên": trò chơi tên quen thuộc thời đi học, tính thuần tại chỗ, không AI.
 *
 * Ba phần, cùng chỉ cần họ tên hai người (không cần ngày sinh):
 *  1. Gạch chữ trùng (FLAMES phiên bản Việt): gạch các chữ cái hai tên có chung, đếm số chữ còn
 *     lại rồi đếm vòng qua sáu kết cục, loại dần tới khi còn một.
 *  2. Tháp "YÊU THƯƠNG": đếm mỗi chữ của "YEU THUONG" xuất hiện bao nhiêu lần trong hai tên, ra
 *     một hàng số; cộng từng cặp kề nhau (lấy hàng đơn vị) tới khi còn hai chữ số → phần trăm.
 *  3. Số Linh hồn (Thần số học, cộng các nguyên âm của tên) của mỗi người và con số chung.
 *
 * Kết quả không phụ thuộc thứ tự hai người (A↔B ra cùng kết quả). Giọng văn theo
 * lib/interpretation-style.ts: lời thường, nghiêng tích cực, chỗ khác biệt là đặc điểm.
 */
import { normalizeName, reduceNumber, stripDiacritics } from "./than-so-hoc.ts";

export const MAX_NAME = 60;

// ───────────────────────── 1. Gạch chữ trùng ─────────────────────────

export type OutcomeKey = "tri-ky" | "nguoi-yeu" | "thuong-tham" | "chung-nha" | "oan-gia" | "nguoi-nha";

export type Outcome = {
  key: OutcomeKey;
  emoji: string;
  title: string;
  /** Một câu ngắn để khoe — hiện to dưới tiêu đề và trong tin chia sẻ */
  tagline: string;
  text: string;
};

/** Thứ tự đếm vòng — giống thứ tự chữ trong F-L-A-M-E-S để người biết trò chơi nhận ra. */
export const OUTCOMES: readonly Outcome[] = [
  {
    key: "tri-ky",
    emoji: "🤝",
    title: "Tri kỷ",
    tagline: "Nói chuyện cả đêm không hết chuyện",
    text: "Hai bạn hợp nhau ở cách nghĩ trước khi hợp nhau ở cảm xúc. Kiểu quan hệ mà một tin nhắn \"ê\" cũng đủ hiểu đối phương đang buồn hay vui. Tình yêu bền nhất thường bắt đầu từ đây.",
  },
  {
    key: "nguoi-yeu",
    emoji: "💞",
    title: "Người yêu",
    tagline: "Rung động là có thật",
    text: "Tên hai bạn dẫn thẳng tới ô \"Người yêu\". Có một sức hút rõ ràng: gặp là muốn nói chuyện lâu hơn một chút, xa là để ý điện thoại nhiều hơn một chút. Phần còn lại là ai chịu nói trước.",
  },
  {
    key: "thuong-tham",
    emoji: "🌸",
    title: "Thương thầm",
    tagline: "Có người đang để ý mà chưa nói ra",
    text: "Tình cảm ở đây đi chậm và kín đáo: nhớ món người kia thích, để ý giờ người kia online. Không vội cũng không sao, những chuyện thương thầm thường được kể lại với nụ cười.",
  },
  {
    key: "chung-nha",
    emoji: "💍",
    title: "Về chung một nhà",
    tagline: "Ô đẹp nhất của trò chơi",
    text: "Kết cục ai chơi trò này cũng mong. Hai cái tên đặt cạnh nhau nghe tròn trịa, như kiểu sau này viết chung trên một tấm thiệp. Chuyện lâu dài cần hai người cùng vun, nhưng mở đầu thế này là đẹp rồi.",
  },
  {
    key: "oan-gia",
    emoji: "⚡",
    title: "Oan gia ngõ hẹp",
    tagline: "Cãi nhau mà chẳng rời được",
    text: "Hai bạn dễ cãi nhau vì chuyện nhỏ, mà cãi xong lại tìm nhau trước. Kiểu cặp này hiếm khi nhạt: có lửa, có trêu chọc, và hiểu nhau qua chính những lần không đồng ý.",
  },
  {
    key: "nguoi-nha",
    emoji: "🏡",
    title: "Thân như người nhà",
    tagline: "Ở cạnh là thấy yên",
    text: "Cảm giác an toàn là thứ hai bạn cho nhau rõ nhất. Không cần cố gắng gây ấn tượng, chỉ cần có mặt. Từ thân như người nhà tới thành người nhà thật đôi khi chỉ cách một lần mở lời.",
  },
];

export type LetterMark = { char: string; crossed: boolean };

export type CrossOut = {
  a: LetterMark[];
  b: LetterMark[];
  /** Số chữ còn lại sau khi gạch — bước đếm vòng */
  remaining: number;
  /** Thứ tự các ô bị loại, ô cuối cùng là kết cục */
  eliminated: OutcomeKey[];
  outcome: Outcome;
};

/** Chữ cái A–Z của tên, bỏ dấu, giữ thứ tự để hiện ra cho người dùng gạch. */
function letters(name: string) {
  return normalizeName(name).split("");
}

/**
 * Gạch chữ trùng theo kiểu đếm số lần (multiset): "ANH" và "HANH" gạch A, N, H một lần mỗi
 * chữ, chữ H thứ hai của "HANH" còn lại. Gạch từ trái sang để kết quả ổn định.
 */
export function crossOut(nameA: string, nameB: string): CrossOut {
  const la = letters(nameA);
  const lb = letters(nameB);
  const pool = new Map<string, number>();
  for (const ch of lb) pool.set(ch, (pool.get(ch) ?? 0) + 1);
  const crossedInA = la.map((ch) => {
    const left = pool.get(ch) ?? 0;
    if (left === 0) return false;
    pool.set(ch, left - 1);
    return true;
  });
  const used = new Map<string, number>();
  la.forEach((ch, i) => crossedInA[i] && used.set(ch, (used.get(ch) ?? 0) + 1));
  const crossedInB = lb.map((ch) => {
    const left = used.get(ch) ?? 0;
    if (left === 0) return false;
    used.set(ch, left - 1);
    return true;
  });
  const a = la.map((char, i) => ({ char, crossed: crossedInA[i] }));
  const b = lb.map((char, i) => ({ char, crossed: crossedInB[i] }));
  const left = a.filter((x) => !x.crossed).length + b.filter((x) => !x.crossed).length;
  // Hai tên giống hệt nhau thì không còn chữ nào — đếm theo tổng số chữ cho khỏi kẹt
  const remaining = left || la.length + lb.length;

  // Đếm vòng: tới ô thứ `remaining` thì loại ô đó, đếm tiếp từ ô kế bên
  const circle = OUTCOMES.map((o) => o.key);
  const eliminated: OutcomeKey[] = [];
  let pos = 0;
  while (circle.length > 1) {
    pos = (pos + remaining - 1) % circle.length;
    eliminated.push(circle.splice(pos, 1)[0]);
  }
  eliminated.push(circle[0]);
  const outcome = OUTCOMES.find((o) => o.key === circle[0])!;
  return { a, b, remaining, eliminated, outcome };
}

// ───────────────────────── 2. Tháp YÊU THƯƠNG ─────────────────────────

export const PYRAMID_WORD = "YEUTHUONG";

export type Pyramid = {
  /** Mỗi chữ của "YEU THUONG" và số lần nó xuất hiện trong hai tên */
  counts: { char: string; count: number }[];
  /** Các hàng số từ trên xuống, hàng cuối có hai chữ số */
  rows: number[][];
  percent: number;
};

/**
 * Đếm rồi cộng dồn kiểu tháp. Đếm trên tên ghép của cả hai nên không phụ thuộc thứ tự.
 * Hàng đầu: số lần đếm được, số có hai chữ số tách ra từng chữ (12 → 1, 2) như cách chơi trên giấy.
 */
export function lovePyramid(nameA: string, nameB: string): Pyramid {
  const all = normalizeName(nameA) + normalizeName(nameB);
  const counts = PYRAMID_WORD.split("").map((char) => ({ char, count: all.split(char).length - 1 }));
  let row = counts.flatMap((c) => String(c.count).split("").map(Number));
  const rows = [row];
  while (row.length > 2) {
    row = row.slice(1).map((d, i) => (row[i] + d) % 10);
    rows.push(row);
  }
  const raw = row.length === 2 ? row[0] * 10 + row[1] : row[0] ?? 0;
  return { counts, rows, percent: lift(raw) };
}

/**
 * Như Xem độ hợp đôi: người ta chỉ khoe con số khi nó dễ thương, nên điểm tháp (0–99)
 * được kéo về 60–99, giữ nguyên thứ tự cao thấp. Điểm tháp gốc vẫn hiện ở hàng cuối.
 */
function lift(raw: number) {
  return Math.round(60 + (raw / 99) * 39);
}

export function percentTier(percent: number) {
  if (percent >= 90) return "Duyên trời định — tên đặt cạnh nhau là thấy hợp";
  if (percent >= 80) return "Rất có duyên — chỉ thiếu một lời mở đầu";
  if (percent >= 70) return "Có duyên — càng nói chuyện càng thấy hợp";
  return "Duyên cần vun — khác nhau nhiều thì học được ở nhau nhiều";
}

// ───────────────────────── 3. Số Linh hồn ─────────────────────────

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);
const letterValue = (ch: string) => ((ch.charCodeAt(0) - 65) % 9) + 1;

/** Số Linh hồn: cộng giá trị các nguyên âm trong họ tên, rút gọn (giữ 11, 22, 33). */
export function soulNumber(name: string) {
  const sum = normalizeName(name)
    .split("")
    .filter((ch) => VOWELS.has(ch))
    .reduce((s, ch) => s + letterValue(ch), 0);
  return reduceNumber(sum || 9).value;
}

/** Trái tim muốn gì trong tình yêu — theo Số Linh hồn. */
export const SOUL_LOVE: Record<number, { title: string; text: string }> = {
  1: { title: "Muốn được là chính mình", text: "Thương ai cũng giữ chính kiến riêng. Thấy được yêu nhất khi người kia tin vào quyết định của mình." },
  2: { title: "Muốn được ở cạnh", text: "Cần sự gần gũi và những câu hỏi han nhỏ. Một tin nhắn \"ăn cơm chưa\" có sức nặng hơn món quà đắt." },
  3: { title: "Muốn được cười cùng", text: "Yêu bằng câu chuyện và tiếng cười. Hợp người chịu nghe mình kể và kể lại chuyện của họ." },
  4: { title: "Muốn sự chắc chắn", text: "Tin vào hành động đều đặn hơn lời hứa. Đúng hẹn một trăm lần là cách nói yêu rõ nhất." },
  5: { title: "Muốn được tự do", text: "Yêu nhất khi không bị giữ chặt. Một chuyến đi bất chợt cùng nhau đáng nhớ hơn mười buổi hẹn giống nhau." },
  6: { title: "Muốn chăm sóc", text: "Thể hiện tình cảm bằng việc lo cho người kia. Cũng cần được chăm lại, dù ít khi nói ra." },
  7: { title: "Muốn được hiểu sâu", text: "Mở lòng chậm, nhưng mở rồi là thật. Cần người tôn trọng khoảng lặng riêng của mình." },
  8: { title: "Muốn cùng xây", text: "Nghĩ tới tương lai rất nghiêm túc. Thấy được yêu khi người kia cùng mình lên kế hoạch." },
  9: { title: "Muốn thương rộng lượng", text: "Dễ đồng cảm, hay nhường. Cần người nhìn ra những lần mình đã nhường." },
  11: { title: "Muốn kết nối bằng trực giác", text: "Cảm được người kia nghĩ gì trước khi họ nói. Cần một người cũng chịu lắng nghe cảm xúc của mình." },
  22: { title: "Muốn cùng làm điều lớn", text: "Yêu như cùng xây một công trình. Hợp người có ước mơ riêng và chịu đi đường dài." },
  33: { title: "Muốn yêu thương vô điều kiện", text: "Cho đi rất nhiều. Cần nhớ rằng mình cũng xứng đáng được nhận lại từng ấy." },
};

/** Con số chung của hai người: cộng hai Số Linh hồn, rút về 1–9. */
export const SHARED_NUMBER: Record<number, string> = {
  1: "Một cặp chủ động: hai bạn mạnh nhất khi cùng bắt đầu một điều mới — một sở thích, một chuyến đi, một dự án nhỏ.",
  2: "Một cặp dịu dàng: điểm mạnh là lắng nghe nhau. Giữ thói quen kể cho nhau nghe một chuyện trong ngày.",
  3: "Một cặp vui vẻ: hai bạn ở cạnh nhau là có chuyện để cười. Đừng để bận rộn lấy mất những buổi nói chuyện linh tinh.",
  4: "Một cặp vững vàng: tin nhau qua những việc nhỏ làm đều đặn. Một lịch hẹn cố định mỗi tuần hợp với hai bạn.",
  5: "Một cặp phiêu lưu: tình cảm lớn lên qua trải nghiệm chung. Thử một chỗ mới, món mới cùng nhau thường xuyên.",
  6: "Một cặp ấm áp: hai bạn chăm cho nhau tự nhiên như người nhà. Nhớ nói lời cảm ơn cho những việc tưởng như hiển nhiên.",
  7: "Một cặp sâu sắc: không cần nói nhiều mà vẫn hiểu. Để cho nhau khoảng lặng riêng là cách giữ lửa của hai bạn.",
  8: "Một cặp cùng chí hướng: hợp nhất khi có mục tiêu chung. Ngồi lại viết ra một điều muốn làm cùng nhau trong năm nay.",
  9: "Một cặp bao dung: hai bạn dễ tha thứ và nhường nhau. Nhớ nói ra điều mình cần, đừng chỉ nhường mãi.",
};

// ───────────────────────── Gộp kết quả ─────────────────────────

export type NameLoveResult = {
  a: { name: string; firstName: string; soul: number };
  b: { name: string; firstName: string; soul: number };
  cross: CrossOut;
  pyramid: Pyramid;
  shared: number;
  tier: string;
};

/** Tên gọi để hiển thị: hai chữ cuối (bỏ họ), tên một chữ giữ nguyên. */
export function displayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length <= 2 ? parts.join(" ") : parts.slice(-2).join(" ");
}

/** Tên hợp lệ: 1–60 ký tự và có ít nhất hai chữ cái A–Z sau khi bỏ dấu. */
export function cleanName(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const name = input.trim().replace(/\s+/g, " ").slice(0, MAX_NAME);
  return normalizeName(name).length >= 2 ? name : null;
}

/**
 * Hai người luôn được xếp theo thứ tự cố định (theo tên không dấu) trước khi tính, để
 * A↔B ra cùng một kết quả — kể cả phần gạch chữ vốn phụ thuộc thứ tự gạch.
 */
export function nameLove(nameA: string, nameB: string): NameLoveResult {
  const key = (n: string) => stripDiacritics(n).toUpperCase();
  const [x, y] = key(nameA) <= key(nameB) ? [nameA, nameB] : [nameB, nameA];
  const cross = crossOut(x, y);
  const pyramid = lovePyramid(x, y);
  const soulA = soulNumber(nameA);
  const soulB = soulNumber(nameB);
  // Ánh xạ lại thứ tự hiển thị phần gạch chữ về đúng người nhập trước
  const swapped = x !== nameA;
  return {
    a: { name: nameA, firstName: displayName(nameA), soul: soulA },
    b: { name: nameB, firstName: displayName(nameB), soul: soulB },
    cross: swapped ? { ...cross, a: cross.b, b: cross.a } : cross,
    pyramid,
    shared: reduceNumber(soulA + soulB, false).value,
    tier: percentTier(pyramid.percent),
  };
}
