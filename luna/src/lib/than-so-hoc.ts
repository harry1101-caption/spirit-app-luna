/**
 * Thần số học Pythagoras, tính thuần tại chỗ — không gọi mạng, không AI.
 *
 * Quy ước đã chọn, ghi rõ để người đọc báo cáo biết:
 *  - Số Đường Đời rút gọn THÁNG, NGÀY, NĂM riêng rồi mới cộng. Cách cộng dồn
 *    toàn bộ chữ số cho kết quả khác ở vài ngày, đây là cách phổ biến hơn.
 *  - Số bậc thầy 11, 22, 33 giữ nguyên, không rút tiếp.
 *  - Tên tiếng Việt được bỏ dấu trước khi quy ra số (Đ → D), vì bảng
 *    Pythagoras chỉ có A–Z.
 *  - Y luôn tính là nguyên âm. Trong tiếng Việt Y là nguyên âm thật
 *    (Thuý, Quý, Nguyễn), khác tiếng Anh nên không dùng luật "Y tuỳ ngữ cảnh".
 */

export const masterNumbers = [11, 22, 33] as const;

/** Bảng Pythagoras: A=1 … I=9, J=1 … R=9, S=1 … Z=8. */
const letterValue = (ch: string) => ((ch.charCodeAt(0) - 65) % 9) + 1;

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);

/** Bỏ dấu tiếng Việt, giữ nguyên chữ hoa/thường và khoảng trắng. */
export function stripDiacritics(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (c) => (c === "đ" ? "d" : "D"));
}

/** Bỏ dấu rồi chỉ giữ A–Z. "Nguyễn Văn An" → "NGUYENVANAN" */
export function normalizeName(name: string) {
  return stripDiacritics(name).toUpperCase().replace(/[^A-Z]/g, "");
}

/** Rút gọn về 1–9, giữ số bậc thầy. Trả cả chuỗi bước để hiện ra cho người dùng. */
export function reduceNumber(input: number, keepMaster = true) {
  const chain = [input];
  let n = input;
  while (n > 9 && !(keepMaster && (masterNumbers as readonly number[]).includes(n))) {
    n = String(n).split("").reduce((sum, d) => sum + Number(d), 0);
    chain.push(n);
  }
  return { value: n, chain };
}

export type CoreNumber = {
  key: string;
  label: string;
  value: number;
  isMaster: boolean;
  /** Chuỗi phép tính, ví dụ "8 + 3 + 6 = 17 → 8". */
  steps: string;
  from: "Ngày sinh" | "Họ tên";
};

export type ThanSoHocInput = { fullName: string; birthDate: string };

export type ThanSoHocChart = {
  input: ThanSoHocInput;
  normalizedName: string;
  numbers: CoreNumber[];
  /** Chữ số 1–9 không xuất hiện trong tên — "bài học còn thiếu". */
  missing: number[];
  /** Số lần mỗi chữ số 1–9 xuất hiện trong tên. */
  letterTally: Record<number, number>;
  personalYear: { year: number; value: number; steps: string };
  notes: string[];
};

const describe = (chain: number[]) =>
  chain.length > 1 ? chain.join(" → ") : String(chain[0]);

export function thanSoHocChart(
  input: ThanSoHocInput,
  readingYear = new Date().getFullYear(),
): ThanSoHocChart {
  const letters = normalizeName(input.fullName);
  if (!letters) throw new Error("Họ tên cần có ít nhất một chữ cái.");
  const [year, month, day] = input.birthDate.split("-").map(Number);
  if (!year || !month || !day) throw new Error("Ngày sinh chưa hợp lệ.");

  const notes: string[] = [];
  // So sánh với bản đã bỏ dấu, KHÔNG so độ dài: "ễ" vẫn là một ký tự nên
  // độ dài không đổi khi bỏ dấu.
  if (stripDiacritics(input.fullName) !== input.fullName)
    notes.push("Tên đã được bỏ dấu trước khi quy ra số, vì bảng Pythagoras chỉ có A–Z.");

  // ── Nhóm số từ ngày sinh ──
  const m = reduceNumber(month);
  const d = reduceNumber(day);
  const y = reduceNumber(year);
  const lifeRaw = m.value + d.value + y.value;
  const life = reduceNumber(lifeRaw);

  const attitudeRaw = m.value + d.value;
  const attitude = reduceNumber(attitudeRaw);
  const birthDay = reduceNumber(day);

  // ── Nhóm số từ họ tên ──
  const values = [...letters].map(letterValue);
  const vowels = [...letters].filter((c) => VOWELS.has(c)).map(letterValue);
  const consonants = [...letters].filter((c) => !VOWELS.has(c)).map(letterValue);
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const expression = reduceNumber(sum(values));
  const soul = reduceNumber(sum(vowels));
  const personality = reduceNumber(sum(consonants));
  if (!vowels.length) notes.push("Tên không có nguyên âm nên Số Linh Hồn bằng 0.");

  const numbers: CoreNumber[] = [
    {
      key: "lifePath",
      label: "Số Đường Đời",
      value: life.value,
      isMaster: (masterNumbers as readonly number[]).includes(life.value),
      steps: `tháng ${describe(m.chain)} + ngày ${describe(d.chain)} + năm ${describe(y.chain)} = ${lifeRaw}${life.chain.length > 1 ? ` → ${life.value}` : ""}`,
      from: "Ngày sinh",
    },
    {
      key: "expression",
      label: "Số Vận Mệnh",
      value: expression.value,
      isMaster: (masterNumbers as readonly number[]).includes(expression.value),
      steps: `tổng toàn bộ chữ cái = ${describe(expression.chain)}`,
      from: "Họ tên",
    },
    {
      key: "soul",
      label: "Số Linh Hồn",
      value: soul.value,
      isMaster: (masterNumbers as readonly number[]).includes(soul.value),
      steps: `tổng nguyên âm = ${describe(soul.chain)}`,
      from: "Họ tên",
    },
    {
      key: "personality",
      label: "Số Nhân Cách",
      value: personality.value,
      isMaster: (masterNumbers as readonly number[]).includes(personality.value),
      steps: `tổng phụ âm = ${describe(personality.chain)}`,
      from: "Họ tên",
    },
    {
      key: "birthDay",
      label: "Số Ngày Sinh",
      value: birthDay.value,
      isMaster: (masterNumbers as readonly number[]).includes(birthDay.value),
      steps: `ngày ${day} ${describe(birthDay.chain)}`.replace(`${day} ${day}`, `${day}`),
      from: "Ngày sinh",
    },
    {
      key: "attitude",
      label: "Số Thái Độ",
      value: attitude.value,
      isMaster: (masterNumbers as readonly number[]).includes(attitude.value),
      steps: `tháng ${describe(m.chain)} + ngày ${describe(d.chain)} = ${attitudeRaw}${attitude.chain.length > 1 ? ` → ${attitude.value}` : ""}`,
      from: "Ngày sinh",
    },
  ];

  const letterTally = Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [i + 1, 0]),
  ) as Record<number, number>;
  for (const v of values) letterTally[v] += 1;
  const missing = Object.entries(letterTally)
    .filter(([, n]) => n === 0)
    .map(([k]) => Number(k));

  // Số Năm Cá Nhân: tháng + ngày sinh + năm đang xem.
  const py = reduceNumber(m.value + d.value + reduceNumber(readingYear).value, false);
  const personalYear = {
    year: readingYear,
    value: py.value,
    steps: `tháng ${m.value} + ngày ${d.value} + năm ${readingYear} (${reduceNumber(readingYear).value}) = ${describe(py.chain)}`,
  };

  return { input, normalizedName: letters, numbers, missing, letterTally, personalYear, notes };
}

/** Ý nghĩa nền, dùng khi chưa cấu hình AI. */
export const numberMeanings: Record<number, { title: string; text: string }> = {
  1: { title: "Khởi xướng", text: "Thiên về tự chủ, thích mở đường và quyết định nhanh. Cần học cách lắng nghe trước khi lao đi." },
  2: { title: "Kết nối", text: "Nhạy cảm với người khác, giỏi hoà giải và làm việc theo cặp. Cần giữ ranh giới để không tự đánh mất mình." },
  3: { title: "Biểu đạt", text: "Giàu tưởng tượng, nói và kể chuyện tự nhiên. Cần kỷ luật để ý tưởng đi tới đích." },
  4: { title: "Nền móng", text: "Thực tế, bền bỉ, tin vào quy trình. Cần nới lỏng để không biến ổn định thành cứng nhắc." },
  5: { title: "Chuyển động", text: "Ưa tự do, học nhanh qua trải nghiệm. Cần chọn một thứ đủ lâu để nó kịp kết quả." },
  6: { title: "Chăm sóc", text: "Có trách nhiệm với người thân và tập thể. Cần nhớ chăm cả chính mình, không chỉ người khác." },
  7: { title: "Chiêm nghiệm", text: "Thích đào sâu, cần khoảng riêng để nghĩ. Cần bước ra để kiến thức gặp đời sống." },
  8: { title: "Kiến tạo", text: "Nhìn ra giá trị và biết tổ chức nguồn lực. Cần phân biệt thành tựu với giá trị bản thân." },
  9: { title: "Bao dung", text: "Nhìn rộng, dễ đồng cảm với cái chung. Cần học buông những gì đã hết vai trò." },
  11: { title: "Trực giác (số bậc thầy)", text: "Nhạy bén khác thường, dễ truyền cảm hứng. Đi kèm áp lực nội tâm lớn, cần neo mình vào việc cụ thể." },
  22: { title: "Kiến trúc sư (số bậc thầy)", text: "Khả năng biến tầm nhìn lớn thành công trình thật. Cần kiên nhẫn với tiến độ của thực tế." },
  33: { title: "Dẫn dắt bằng yêu thương (số bậc thầy)", text: "Hướng về việc nâng đỡ người khác ở quy mô rộng. Cần giữ sức cho chính mình." },
};
