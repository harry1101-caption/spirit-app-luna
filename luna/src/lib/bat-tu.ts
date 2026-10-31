import { jieBranches, jieNames, solarTermMinutes, solarTermRange } from "./solar-terms.ts";

/**
 * Bát Tự (Tứ Trụ) — lập lá số thuần bằng toán lịch, không gọi mạng, không AI.
 *
 * Quy ước đã chọn, ghi rõ để người đọc báo cáo biết:
 *  - Trụ Năm đổi tại LẬP XUÂN, không phải 1/1 cũng không phải Tết Nguyên Đán.
 *  - Trụ Tháng đổi tại 12 TIẾT, không theo tháng âm lịch.
 *  - Giờ Tý sớm/muộn: 23:00 đã sang ngày mới, nên trụ Ngày nhảy từ 23:00.
 *  - Dùng giờ đồng hồ UTC+7, KHÔNG hiệu chỉnh giờ mặt trời thật theo kinh độ.
 */

export const stems = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
export const branches = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;
export const elements = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as const;

export type Element = (typeof elements)[number];
export type Stem = (typeof stems)[number];
export type Branch = (typeof branches)[number];

/** Ngũ hành của 10 Can, theo thứ tự `stems`. */
const stemElement: Element[] = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];
/** Ngũ hành của 12 Chi, theo thứ tự `branches`. */
const branchElement: Element[] = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];
/** Tàng Can — các Can ẩn trong mỗi Chi, bản khí đứng trước. */
const hidden: Stem[][] = [
  ["Quý"], ["Kỷ", "Quý", "Tân"], ["Giáp", "Bính", "Mậu"], ["Ất"],
  ["Mậu", "Ất", "Quý"], ["Bính", "Mậu", "Canh"], ["Đinh", "Kỷ"], ["Kỷ", "Đinh", "Ất"],
  ["Canh", "Nhâm", "Mậu"], ["Tân"], ["Mậu", "Tân", "Đinh"], ["Nhâm", "Giáp"],
];

const elementIndex = (e: Element) => elements.indexOf(e);
/** Mộc→Hỏa→Thổ→Kim→Thủy→Mộc */
const generates = (e: Element) => elements[(elementIndex(e) + 1) % 5];
/** Mộc→Thổ→Thủy→Hỏa→Kim→Mộc */
const controls = (e: Element) => elements[(elementIndex(e) + 2) % 5];
/** Can/Chi chỉ số chẵn là dương. */
const isYang = (index: number) => index % 2 === 0;

export type TenGod =
  | "Tỷ Kiên" | "Kiếp Tài" | "Thực Thần" | "Thương Quan" | "Thiên Tài"
  | "Chính Tài" | "Thất Sát" | "Chính Quan" | "Thiên Ấn" | "Chính Ấn";

/** Thập Thần của Can `stem` xét theo Nhật Chủ `master`. */
export function tenGod(master: Stem, stem: Stem): TenGod {
  const m = stems.indexOf(master);
  const s = stems.indexOf(stem);
  const me = stemElement[m];
  const se = stemElement[s];
  const same = isYang(m) === isYang(s);
  if (se === me) return same ? "Tỷ Kiên" : "Kiếp Tài";
  if (generates(me) === se) return same ? "Thực Thần" : "Thương Quan";
  if (controls(me) === se) return same ? "Thiên Tài" : "Chính Tài";
  if (controls(se) === me) return same ? "Thất Sát" : "Chính Quan";
  return same ? "Thiên Ấn" : "Chính Ấn";
}

export type Pillar = {
  label: "Năm" | "Tháng" | "Ngày" | "Giờ";
  stem: Stem;
  branch: Branch;
  stemElement: Element;
  branchElement: Element;
  stemYinYang: "Dương" | "Âm";
  hiddenStems: { stem: Stem; element: Element; god: TenGod }[];
  /** Nhật Chủ không có Thập Thần với chính nó, nên trụ Ngày bỏ trống. */
  god?: TenGod;
};

export type LuckPillar = { stem: Stem; branch: Branch; startAge: number; endAge: number };

export type BatTuInput = {
  name?: string;
  birthDate: string;        // YYYY-MM-DD, dương lịch
  birthTime?: string | null; // HH:mm, null = không rõ giờ
  gender: "Nam" | "Nữ";
};

export type BatTuChart = {
  input: BatTuInput;
  hourKnown: boolean;
  pillars: Pillar[];
  dayMaster: { stem: Stem; element: Element; yinYang: "Dương" | "Âm" };
  /** Đếm ngũ hành trên 8 chữ hiện ra (4 Can + 4 Chi). Không gộp Tàng Can. */
  elementCount: Record<Element, number>;
  missingElements: Element[];
  solarYear: number;
  /** Tiết mở đầu tháng sinh, kèm thời điểm theo giờ VN. */
  monthTerm: { name: string; at: string };
  luck: { direction: "Thuận" | "Nghịch"; startAge: number; startMonths: number; pillars: LuckPillar[] };
  notes: string[];
};

function sexagenary(stemIdx: number, branchIdx: number) {
  // n ≡ stem (mod 10) và n ≡ branch (mod 12); giải bằng số dư Trung Hoa.
  const k = (((-(branchIdx - stemIdx) / 2) % 6) + 6) % 6;
  return (stemIdx + 10 * k) % 60;
}

/** Julian Day Number tại giữa trưa của một ngày dương lịch. */
function jdn(year: number, month: number, day: number) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  );
}

/**
 * Số phút từ 00:00 ngày 1/1 năm `baseYear` tới mốc đã cho — cùng hệ quy chiếu
 * với bảng tiết khí. `baseYear` tách riêng khỏi `year` vì năm Bát Tự có thể
 * lệch một năm so với năm dương lịch của ngày sinh.
 */
function minutesIntoYear(
  baseYear: number, year: number, month: number, day: number, hour: number, minute: number,
) {
  const base = Date.UTC(baseYear, 0, 1);
  const at = Date.UTC(year, month - 1, day, hour, minute);
  return Math.round((at - base) / 60000);
}

function termAt(year: number, index: number) {
  const base = Date.UTC(year, 0, 1);
  return new Date(base + solarTermMinutes[year][index] * 60000);
}

export function batTuChart(input: BatTuInput): BatTuChart {
  const [y, m, d] = input.birthDate.split("-").map(Number);
  const hourKnown = Boolean(input.birthTime);
  const [hh, mm] = hourKnown ? input.birthTime!.split(":").map(Number) : [12, 0];
  if (!solarTermMinutes[y] || !solarTermMinutes[y - 1])
    throw new Error(`Ngoài phạm vi bảng tiết khí ${solarTermRange.from}–${solarTermRange.to}`);

  const notes: string[] = [];

  // --- Trụ Năm: mốc là Lập Xuân, không phải 1/1 ---
  const minsThisYear = minutesIntoYear(y, y, m, d, hh, mm);
  const beforeLiChun = minsThisYear < solarTermMinutes[y][0];
  const solarYear = beforeLiChun ? y - 1 : y;
  if (beforeLiChun)
    notes.push(`Sinh trước Lập Xuân ${y} nên trụ Năm tính theo năm ${solarYear}, không phải ${y}.`);

  const yearStemIdx = (((solarYear - 4) % 10) + 10) % 10;
  const yearBranchIdx = (((solarYear - 4) % 12) + 12) % 12;

  // --- Trụ Tháng: tiết nào gần nhất phía trước ---
  const minsInSolarYear = minutesIntoYear(solarYear, y, m, d, hh, mm);
  const terms = solarTermMinutes[solarYear];
  let monthIdx = 0;
  for (let i = 11; i >= 0; i -= 1) {
    if (minsInSolarYear >= terms[i]) { monthIdx = i; break; }
  }
  const monthBranchIdx = branches.indexOf(jieBranches[monthIdx] as Branch);
  // Ngũ hổ độn: Can tháng Dần suy từ Can năm.
  const monthStemIdx = ((yearStemIdx % 5) * 2 + 2 + monthIdx) % 10;

  // --- Trụ Ngày: chu kỳ 60 liên tục; giờ Tý muộn (≥23:00) đã sang ngày mới ---
  let dayY = y, dayM = m, dayD = d;
  if (hourKnown && hh >= 23) {
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    dayY = next.getUTCFullYear(); dayM = next.getUTCMonth() + 1; dayD = next.getUTCDate();
    notes.push("Sinh từ 23:00 nên trụ Ngày tính sang ngày hôm sau theo quy ước giờ Tý muộn.");
  }
  const dn = jdn(dayY, dayM, dayD);
  const dayStemIdx = (((dn - 1) % 10) + 10) % 10;
  const dayBranchIdx = (((dn + 1) % 12) + 12) % 12;

  // --- Trụ Giờ: Chi theo giờ, Can suy từ Can ngày (ngũ thử độn) ---
  const hourBranchIdx = Math.floor(((hh + 1) % 24) / 2) % 12;
  const hourStemIdx = ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;
  if (!hourKnown)
    notes.push("Chưa có giờ sinh nên lá số chỉ gồm 3 trụ; trụ Giờ và phần luận liên quan tới giờ không khả dụng.");

  const master = stems[dayStemIdx];
  const makePillar = (label: Pillar["label"], si: number, bi: number): Pillar => ({
    label,
    stem: stems[si],
    branch: branches[bi],
    stemElement: stemElement[si],
    branchElement: branchElement[bi],
    stemYinYang: isYang(si) ? "Dương" : "Âm",
    hiddenStems: hidden[bi].map((s) => ({
      stem: s,
      element: stemElement[stems.indexOf(s)],
      god: tenGod(master, s),
    })),
    ...(label === "Ngày" ? {} : { god: tenGod(master, stems[si]) }),
  });

  const pillars: Pillar[] = [
    makePillar("Năm", yearStemIdx, yearBranchIdx),
    makePillar("Tháng", monthStemIdx, monthBranchIdx),
    makePillar("Ngày", dayStemIdx, dayBranchIdx),
    ...(hourKnown ? [makePillar("Giờ", hourStemIdx, hourBranchIdx)] : []),
  ];

  const elementCount = Object.fromEntries(elements.map((e) => [e, 0])) as Record<Element, number>;
  for (const p of pillars) {
    elementCount[p.stemElement] += 1;
    elementCount[p.branchElement] += 1;
  }

  // --- Đại Vận ---
  const yangYear = isYang(yearStemIdx);
  const forward = (yangYear && input.gender === "Nam") || (!yangYear && input.gender === "Nữ");
  const birthMs = Date.UTC(y, m - 1, d, hh, mm);
  const yearBase = Date.UTC(solarYear, 0, 1);
  let gapMinutes: number;
  if (forward) {
    const nextIdx = monthIdx + 1;
    const nextMs = nextIdx <= 11
      ? yearBase + terms[nextIdx] * 60000
      : Date.UTC(solarYear + 1, 0, 1) + solarTermMinutes[solarYear + 1][0] * 60000;
    gapMinutes = (nextMs - birthMs) / 60000;
  } else {
    gapMinutes = (birthMs - (yearBase + terms[monthIdx] * 60000)) / 60000;
  }
  // Quy ước cổ: 3 ngày = 1 tuổi vận.
  const totalMonths = Math.round((gapMinutes / 1440 / 3) * 12);
  const startAge = Math.floor(totalMonths / 12);
  const startMonths = totalMonths % 12;

  const monthCycle = sexagenary(monthStemIdx, monthBranchIdx);
  const luckPillars: LuckPillar[] = Array.from({ length: 8 }, (_, i) => {
    const step = forward ? i + 1 : -(i + 1);
    const n = (((monthCycle + step) % 60) + 60) % 60;
    return {
      stem: stems[n % 10],
      branch: branches[n % 12],
      startAge: startAge + i * 10,
      endAge: startAge + i * 10 + 9,
    };
  });

  const at = termAt(solarYear, monthIdx);
  return {
    input,
    hourKnown,
    pillars,
    dayMaster: { stem: master, element: stemElement[dayStemIdx], yinYang: isYang(dayStemIdx) ? "Dương" : "Âm" },
    elementCount,
    missingElements: elements.filter((e) => elementCount[e] === 0),
    solarYear,
    monthTerm: {
      name: jieNames[monthIdx],
      at: new Date(at.getTime() + 7 * 3600000).toISOString().slice(0, 16).replace("T", " "),
    },
    luck: { direction: forward ? "Thuận" : "Nghịch", startAge, startMonths, pillars: luckPillars },
    notes,
  };
}
