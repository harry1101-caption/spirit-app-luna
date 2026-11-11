/**
 * "Khi nào có người yêu?": tìm những năm và tháng tình duyên vượng từ năm sinh âm lịch.
 *
 * Tính thuần tại chỗ, không AI, theo ba sao tình duyên quen thuộc tính từ chi năm sinh:
 *  - Đào Hoa (theo nhóm tam hợp): Thân Tý Thìn → Dậu, Dần Ngọ Tuất → Mão,
 *    Tỵ Dậu Sửu → Ngọ, Hợi Mão Mùi → Tý. Sức hút, được để ý.
 *  - Hồng Loan: khởi Mão ở tuổi Tý, đếm ngược theo chi năm sinh. Duyên lành, người nghiêm túc.
 *  - Thiên Hỷ: luôn đối xung Hồng Loan. Tin vui, hỷ sự.
 * Năm (lưu niên) hay tháng có chi trùng một trong ba sao → tình duyên vượng. Năm tam hợp /
 * lục hợp với tuổi → thuận. Chỉ cần chi năm sinh, nên link chia sẻ chỉ mang năm âm lịch,
 * không mang ngày sinh.
 *
 * Năm âm lịch lấy mốc Lập Xuân xấp xỉ 4/2, tháng lấy theo tiết khí xấp xỉ — đủ cho một
 * trải nghiệm vui, ai cần chính xác đã có Tử Vi và Bát tự. Giọng văn nghiêng tích cực:
 * năm không có sao thì là năm vun đắp, không phải năm xấu.
 */
import { branches, stems } from "./bat-tu.ts";

export type LoveStatus = "doc-than" | "dang-yeu";
export const STATUS_LABEL: Record<LoveStatus, string> = { "doc-than": "Đang độc thân", "dang-yeu": "Đang có người thương" };

export type StarKey = "dao-hoa" | "hong-loan" | "thien-hy";

export const STARS: Record<StarKey, { name: string; emoji: string; short: string; single: string; taken: string }> = {
  "dao-hoa": {
    name: "Đào Hoa",
    emoji: "🌸",
    short: "Sức hút tăng, dễ được để ý",
    single: "Bạn dễ lọt vào mắt người khác hơn thường lệ: nhiều lời rủ đi chơi, nhiều tin nhắn hỏi han. Nhận lời đi gặp gỡ nhiều hơn một chút là cơ hội tự tới.",
    taken: "Hai bạn dễ tìm lại cảm giác rung động thuở đầu. Lên một buổi hẹn như hồi mới quen — chỗ mới, đồ đẹp, không điện thoại.",
  },
  "hong-loan": {
    name: "Hồng Loan",
    emoji: "💗",
    short: "Duyên lành, dễ gặp người nghiêm túc",
    single: "Năm dễ gặp một người muốn đi đường dài chứ không chỉ cho vui. Để ý những người quen qua bạn bè, đồng nghiệp — duyên lành hay đến từ chỗ quen thuộc.",
    taken: "Tình cảm có xu hướng sâu thêm và rõ ràng hơn: nói chuyện tương lai, ra mắt gia đình. Hợp để cùng nhau quyết một chuyện lớn.",
  },
  "thien-hy": {
    name: "Thiên Hỷ",
    emoji: "🎉",
    short: "Tin vui, hỷ sự",
    single: "Năm của những tin vui bất ngờ. Một mối quen cũ có thể quay lại theo hướng khác, hoặc một lần gặp tình cờ thành chuyện đáng kể.",
    taken: "Sao của hỷ sự: đính hôn, cưới hỏi, dọn về chung, đón thành viên mới. Có dự định gì cho hai người thì đây là năm đẹp để làm.",
  },
};

/** Đào Hoa theo nhóm tam hợp của chi năm sinh (chỉ số trong `branches`, 0 = Tý). */
const DAO_HOA: Record<number, number> = { 8: 9, 0: 9, 4: 9, 2: 3, 6: 3, 10: 3, 5: 6, 9: 6, 1: 6, 11: 0, 3: 0, 7: 0 };
const TAM_HOP = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
const LUC_HOP: Record<number, number> = { 0: 1, 1: 0, 2: 11, 11: 2, 3: 10, 10: 3, 4: 9, 9: 4, 5: 8, 8: 5, 6: 7, 7: 6 };

const CON_GIAP = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

const mod12 = (n: number) => ((n % 12) + 12) % 12;
export const branchOfYear = (lunarYear: number) => mod12(lunarYear - 4);
export const canChiOfYear = (y: number) => `${stems[(((y - 4) % 10) + 10) % 10]} ${branches[branchOfYear(y)]}`;

/** Chi của từng sao với một tuổi. */
export function starBranches(birthBranch: number): Record<StarKey, number> {
  const hongLoan = mod12(3 - birthBranch);
  return { "dao-hoa": DAO_HOA[birthBranch], "hong-loan": hongLoan, "thien-hy": mod12(hongLoan + 6) };
}

/**
 * Tháng âm theo tiết khí, mỗi tháng một chi. Mốc ngày dương lịch là xấp xỉ (lệch ±1 ngày
 * tuỳ năm). Thứ tự theo lịch dương để hiện ra cho dễ đọc.
 */
const MONTHS: { branch: number; from: [number, number]; to: [number, number] }[] = [
  { branch: 1, from: [6, 1], to: [3, 2] },
  { branch: 2, from: [4, 2], to: [5, 3] },
  { branch: 3, from: [6, 3], to: [4, 4] },
  { branch: 4, from: [5, 4], to: [5, 5] },
  { branch: 5, from: [6, 5], to: [5, 6] },
  { branch: 6, from: [6, 6], to: [6, 7] },
  { branch: 7, from: [7, 7], to: [7, 8] },
  { branch: 8, from: [8, 8], to: [7, 9] },
  { branch: 9, from: [8, 9], to: [7, 10] },
  { branch: 10, from: [8, 10], to: [6, 11] },
  { branch: 11, from: [7, 11], to: [6, 12] },
  { branch: 0, from: [7, 12], to: [5, 1] },
];

export type LoveMonth = { branch: string; range: string; stars: StarKey[]; from: [number, number] };
export type LoveYear = {
  year: number;
  canChi: string;
  stars: StarKey[];
  /** Năm tam hợp / lục hợp với tuổi: thuận, dù không có sao */
  harmony: "tam-hop" | "luc-hop" | null;
  level: "vuong" | "thuan" | "vun-dap";
  text: string;
};

export type LoveTiming = {
  lunarYear: number;
  canChi: string;
  conGiap: string;
  status: LoveStatus;
  stars: Record<StarKey, string>;
  years: LoveYear[];
  /** Năm vượng gần nhất kể từ năm đầu bảng */
  nextBest: LoveYear | null;
  months: LoveMonth[];
  /** Con giáp dễ hợp duyên: tam hợp + lục hợp */
  matches: string[];
};

const LEVEL_LABEL: Record<LoveYear["level"], string> = { vuong: "Duyên vượng", thuan: "Thuận duyên", "vun-dap": "Năm vun đắp" };
export const levelLabel = (l: LoveYear["level"]) => LEVEL_LABEL[l];

/** Năm không sao: mỗi năm một gợi ý khác nhau, để bảng không lặp một câu nhiều lần. */
const QUIET_SINGLE = [
  "Năm dành cho chính mình: chăm sức khoẻ, học thêm một thứ hay ho. Người hợp thường tới khi mình đang sống vui.",
  "Năm mở rộng vòng bạn bè: nhận lời một buổi tụ tập, tham gia một câu lạc bộ. Duyên hay đến từ bạn của bạn.",
  "Năm sắp xếp lại lòng mình: khép lại chuyện cũ cho gọn, để chỗ cho người mới bước vào nhẹ nhàng.",
  "Năm thử những điều mới: một chuyến đi, một chỗ làm, một thành phố. Đổi khung cảnh là đổi người mình gặp.",
];
const QUIET_TAKEN = [
  "Năm vun đắp: không nhiều sự kiện lớn, hợp để chăm những thói quen nhỏ cho hai người.",
  "Năm hiểu nhau thêm: thử một sở thích chung mới, hoặc cùng học một thứ cả hai chưa biết.",
  "Năm xây nền: nói chuyện tiền bạc, chỗ ở, kế hoạch vài năm tới — chuyện không lãng mạn mà giữ tình bền.",
  "Năm giữ lửa: hẹn hò định kỳ, một chuyến đi riêng hai người. Bình yên cũng cần chăm.",
];

function yearText(year: number, stars: StarKey[], harmony: LoveYear["harmony"], status: LoveStatus) {
  if (stars.length) return stars.map((s) => (status === "doc-than" ? STARS[s].single : STARS[s].taken)).join(" ");
  if (harmony)
    return status === "doc-than"
      ? "Năm hợp tuổi: mọi chuyện trôi thuận, dễ kết nối với người mới qua các mối quen biết. Không bùng nổ nhưng êm."
      : "Năm hợp tuổi: ít va chạm, dễ đồng lòng. Hợp để cùng nhau ổn định nếp sống chung.";
  return (status === "doc-than" ? QUIET_SINGLE : QUIET_TAKEN)[year % 4];
}

const fmt = ([d, m]: [number, number]) => `${d}/${m}`;

/** Năm âm lịch từ ngày sinh dương lịch (Lập Xuân xấp xỉ 4/2). */
export function lunarYearOf(birthDate: string) {
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  return m < 2 || (m === 2 && d < 4) ? y - 1 : y;
}

/**
 * `fromYear` truyền từ trình duyệt (năm hiện tại) — không gọi `new Date()` ở đây để
 * hàm chạy được lúc prerender.
 */
export function loveTiming(lunarYear: number, status: LoveStatus, fromYear: number, span = 7): LoveTiming {
  const birth = branchOfYear(lunarYear);
  const starAt = starBranches(birth);
  const starsOf = (branch: number) => (Object.keys(starAt) as StarKey[]).filter((k) => starAt[k] === branch);

  const years: LoveYear[] = Array.from({ length: span }, (_, i) => {
    const year = fromYear + i;
    const b = branchOfYear(year);
    const stars = starsOf(b);
    const harmony = b !== birth && TAM_HOP.some((g) => g.includes(b) && g.includes(birth)) ? "tam-hop" : LUC_HOP[birth] === b ? "luc-hop" : null;
    const level = stars.length ? "vuong" : harmony ? "thuan" : "vun-dap";
    return { year, canChi: canChiOfYear(year), stars, harmony, level, text: yearText(year, stars, harmony, status) };
  });

  const months = MONTHS.map((m) => ({ branch: branches[m.branch], range: `${fmt(m.from)} – ${fmt(m.to)}`, stars: starsOf(m.branch), from: m.from })).filter(
    (m) => m.stars.length,
  );

  const matchIdx = [...(TAM_HOP.find((g) => g.includes(birth)) ?? []).filter((b) => b !== birth), LUC_HOP[birth]];

  return {
    lunarYear,
    canChi: canChiOfYear(lunarYear),
    conGiap: CON_GIAP[birth],
    status,
    stars: { "dao-hoa": CON_GIAP[starAt["dao-hoa"]], "hong-loan": CON_GIAP[starAt["hong-loan"]], "thien-hy": CON_GIAP[starAt["thien-hy"]] },
    years,
    nextBest: years.find((y) => y.level === "vuong") ?? null,
    months,
    matches: matchIdx.map((b) => CON_GIAP[b]),
  };
}

/**
 * Tháng duyên vượng gần nhất tính từ hôm nay (`month` 1–12, `day`), kể cả tháng đang diễn ra.
 * Tháng có ngày bắt đầu đã qua trong năm nay → coi là đang diễn ra nếu chưa quá 30 ngày.
 */
export function nextLoveMonth(months: LoveMonth[], year: number, month: number, day: number) {
  const today = Date.UTC(year, month - 1, day);
  const DAY = 86_400_000;
  const options = months.flatMap((m) =>
    [year - 1, year, year + 1].map((y) => ({ month: m, year: y, start: Date.UTC(y, m.from[1] - 1, m.from[0]) })),
  );
  const next = options.filter((o) => o.start + 29 * DAY >= today).sort((a, b) => a.start - b.start)[0];
  return next ? { ...next.month, year: next.year, ongoing: next.start <= today } : null;
}

/** Kiểm tra input từ URL — ai cũng sửa được. */
export function parseTimingParams(y: unknown, s: unknown): { lunarYear: number; status: LoveStatus } | null {
  const year = Number(y);
  if (!Number.isInteger(year) || year < 1930 || year > 2030) return null;
  return { lunarYear: year, status: s === "dang-yeu" ? "dang-yeu" : "doc-than" };
}
