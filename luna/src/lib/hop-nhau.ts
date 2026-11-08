/**
 * "Xem độ hợp đôi": chấm độ hợp của hai người từ họ tên + ngày sinh.
 *
 * Tính thuần tại chỗ, không AI, để người thứ hai bấm link là thấy kết quả ngay.
 * Bốn góc nhìn (năm nếu biết giới tính cả hai), mỗi góc một điểm 0–100, lấy trung bình có trọng số:
 *  - Con giáp (tam hợp, lục hợp, lục xung) — thứ người Việt hỏi nhiều nhất.
 *  - Ngũ hành của Can năm sinh (tương sinh / bình hoà / tương khắc).
 *  - Nhóm nguyên tố của cung hoàng đạo.
 *  - Số Đường Đời trong Thần số học.
 *  - Cung mệnh Bát trạch (Đông / Tây tứ mệnh) — cần giới tính.
 * Năm âm lịch lấy mốc Lập Xuân xấp xỉ 4/2 — sai vài ngày quanh Tết, chấp nhận
 * được cho một trải nghiệm vui; ai cần chính xác đã có Bát tự.
 *
 * Điểm không phụ thuộc thứ tự hai người (A↔B ra cùng số) và luôn ≥ 55: giọng
 * văn của app là hơi tích cực, và người ta chỉ khoe con số khi nó dễ thương.
 */
import { stems, branches, type Element } from "@/lib/bat-tu";
import { thanSoHocChart, normalizeName } from "@/lib/than-so-hoc";
import { zodiac, zodiacFromDate } from "@/lib/engine";

export type Gender = "nam" | "nu";
export type Person = { name: string; birthDate: string; gender?: Gender | null };

/**
 * Phần công khai của một người — đủ để chấm điểm mà KHÔNG cần ngày sinh đầy đủ.
 * Hồ sơ duyên chỉ lưu đúng mấy trường này, nên database không giữ ngày sinh của ai.
 */
export type PublicPerson = { name: string; lunarYear: number; zodiacIndex: number; lifePath: number; gender?: Gender | null };

const CON_GIAP = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CON_VAT = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Lợn"];
const stemElement: Element[] = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"];
const ELEMENTS: Element[] = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"];

type ZodiacElement = "Lửa" | "Đất" | "Khí" | "Nước";
const zodiacElement: ZodiacElement[] = ["Lửa", "Đất", "Khí", "Nước", "Lửa", "Đất", "Khí", "Nước", "Lửa", "Đất", "Khí", "Nước"];

export type PersonProfile = {
  name: string;
  firstName: string;
  lunarYear: number;
  canChi: string;
  conGiap: string;
  branchIndex: number;
  element: Element;
  zodiac: string;
  zodiacIndex: number;
  zodiacElement: ZodiacElement;
  lifePath: number;
  gender: Gender | null;
  /** Cung mệnh Bát trạch — chỉ có khi biết giới tính. */
  cungMenh: string | null;
};

export type Aspect = { key: string; label: string; score: number; detail: string };

export type Compatibility = {
  a: PersonProfile;
  b: PersonProfile;
  score: number;
  headline: string;
  tagline: string;
  aspects: Aspect[];
  strengths: string[];
  friction: string;
  todo: string[];
};

/**
 * Tên gọi: bỏ họ khi có từ ba chữ trở lên ("Nguyễn Thị Lan" → "Thị Lan" thì kỳ, nên lấy
 * hai chữ cuối chỉ khi chữ giữa không phải lót phổ biến). Hai chữ thì giữ nguyên, vì
 * "Minh Anh" là tên gọi chứ không phải họ + tên.
 */
const TEN_LOT = new Set(["văn", "thị", "đức", "hữu", "ngọc", "thanh", "công", "quang", "đình", "xuân", "kim"]);
export function firstName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  const [mid, last] = parts.slice(-2);
  return TEN_LOT.has(mid.toLowerCase()) ? last : `${mid} ${last}`;
}

/** Rút trích phần công khai từ họ tên + ngày sinh. */
export function toPublic(p: Person): PublicPerson {
  const [y, m, d] = p.birthDate.split("-").map(Number);
  if (!y || !m || !d) throw new Error("Ngày sinh chưa hợp lệ.");
  // Lập Xuân xấp xỉ 4/2
  const lunarYear = m < 2 || (m === 2 && d < 4) ? y - 1 : y;
  // Năm xem chỉ ảnh hưởng Năm Cá Nhân, không ảnh hưởng Số Đường Đời; truyền hằng số để
  // không gọi `new Date()` lúc prerender (cacheComponents chặn).
  const lifePath = thanSoHocChart({ fullName: p.name, birthDate: p.birthDate }, 2000).numbers[0].value;
  return { name: p.name.trim(), lunarYear, zodiacIndex: zodiac.indexOf(zodiacFromDate(p.birthDate)), lifePath, gender: p.gender ?? null };
}

// ── Cung mệnh Bát trạch (cung phi) theo năm âm lịch + giới tính, cách tính phổ biến ──
const QUAI = ["", "Khảm", "Khôn", "Chấn", "Tốn", "", "Càn", "Đoài", "Cấn", "Ly"];
const DONG_TU = new Set(["Khảm", "Chấn", "Tốn", "Ly"]);
const digitRoot = (n: number) => (n === 0 ? 0 : 1 + ((n - 1) % 9));

export function cungMenh(lunarYear: number, gender: Gender) {
  const r = digitRoot(lunarYear % 100);
  let k: number;
  if (lunarYear < 2000) k = gender === "nam" ? digitRoot(10 - r) || 9 : digitRoot(r + 5);
  else k = gender === "nam" ? (9 - r === 0 ? 9 : 9 - r) : digitRoot(r + 6);
  if (k === 5) return gender === "nam" ? "Khôn" : "Cấn";
  return QUAI[k];
}

export function profileOf(p: PublicPerson): PersonProfile {
  const stemIdx = (((p.lunarYear - 4) % 10) + 10) % 10;
  const branchIdx = (((p.lunarYear - 4) % 12) + 12) % 12;
  const zIdx = ((p.zodiacIndex % 12) + 12) % 12;
  const gender = p.gender ?? null;
  return {
    name: p.name.trim(),
    firstName: firstName(p.name),
    lunarYear: p.lunarYear,
    canChi: `${stems[stemIdx]} ${branches[branchIdx]}`,
    conGiap: CON_GIAP[branchIdx],
    branchIndex: branchIdx,
    element: stemElement[stemIdx],
    zodiac: zodiac[zIdx],
    zodiacIndex: zIdx,
    zodiacElement: zodiacElement[zIdx],
    lifePath: p.lifePath,
    gender,
    cungMenh: gender ? cungMenh(p.lunarYear, gender) : null,
  };
}

export function profile(p: Person): PersonProfile {
  return profileOf(toPublic(p));
}

// ── Con giáp ──
const TAM_HOP = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
const LUC_HOP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];

function conGiapAspect(a: PersonProfile, b: PersonProfile): Aspect {
  const [x, y] = [a.branchIndex, b.branchIndex];
  const pair = `tuổi ${a.conGiap} và tuổi ${b.conGiap}`;
  let score: number;
  let detail: string;
  if (x === y) {
    score = 78;
    detail = `Hai bạn cùng tuổi ${a.conGiap} (${CON_VAT[x]}), nên nhìn chuyện đời khá giống nhau. Ít phải giải thích, nhưng cũng dễ cùng bướng một lúc.`;
  } else if (TAM_HOP.some((g) => g.includes(x) && g.includes(y))) {
    score = 94;
    detail = `${pair[0].toUpperCase()}${pair.slice(1)} nằm trong cùng một nhóm tam hợp — kiểu bạn đồng hành, chung hướng đi và dễ kéo nhau cùng tiến.`;
  } else if (LUC_HOP.some(([p, q]) => (p === x && q === y) || (p === y && q === x))) {
    score = 91;
    detail = `${pair[0].toUpperCase()}${pair.slice(1)} là một cặp lục hợp — người xưa gọi là cặp "nhị hợp", một người mở lời thì người kia hiểu ý.`;
  } else if (Math.abs(x - y) === 6) {
    score = 58;
    detail = `${pair[0].toUpperCase()}${pair.slice(1)} thuộc cặp lục xung — hai cá tính mạnh, dễ va nhau. Nhưng chính vì khác nên hai bạn bổ sung chỗ người kia còn thiếu.`;
  } else {
    score = 72;
    detail = `${pair[0].toUpperCase()}${pair.slice(1)} không xung không hợp — tình cảm bền hay không là do cách hai bạn đối xử, không do tuổi.`;
  }
  return { key: "con-giap", label: "Con giáp", score, detail };
}

// ── Ngũ hành ──
const generates = (e: Element) => ELEMENTS[(ELEMENTS.indexOf(e) + 1) % 5];
const controls = (e: Element) => ELEMENTS[(ELEMENTS.indexOf(e) + 2) % 5];

function nguHanhAspect(a: PersonProfile, b: PersonProfile): Aspect {
  const [x, y] = [a.element, b.element];
  let score: number;
  let detail: string;
  if (x === y) {
    score = 80;
    detail = `Cả hai cùng mệnh ${x} theo Can năm sinh — bình hoà, nhịp sống giống nhau nên ở cạnh nhau thấy dễ chịu.`;
  } else if (generates(x) === y || generates(y) === x) {
    const [giver, taker] = generates(x) === y ? [a, b] : [b, a];
    score = 90;
    detail = `${giver.element} sinh ${taker.element}: ${giver.firstName} có xu hướng nâng đỡ, tiếp sức cho ${taker.firstName}. Đây là cặp tương sinh, càng ở lâu càng thấy được chăm.`;
  } else {
    const [strong, soft] = controls(x) === y ? [a, b] : [b, a];
    score = 60;
    detail = `${strong.element} khắc ${soft.element}: ${strong.firstName} hay là người quyết, ${soft.firstName} hay là người nhường. Nhường nhau đúng lúc thì đây lại là cặp giữ thăng bằng tốt.`;
  }
  return { key: "ngu-hanh", label: "Ngũ hành", score, detail };
}

// ── Cung hoàng đạo ──
const ELEMENT_FEEL: Record<ZodiacElement, string> = {
  "Lửa": "nhiệt, thích hành động",
  "Đất": "chắc chắn, thực tế",
  "Khí": "thích nói chuyện, ý tưởng",
  "Nước": "giàu cảm xúc, tinh tế",
};

function zodiacAspect(a: PersonProfile, b: PersonProfile): Aspect {
  const [x, y] = [a.zodiacElement, b.zodiacElement];
  const opposite = Math.abs(a.zodiacIndex - b.zodiacIndex) === 6;
  const friendly = (x === "Lửa" && y === "Khí") || (x === "Khí" && y === "Lửa") || (x === "Đất" && y === "Nước") || (x === "Nước" && y === "Đất");
  let score: number;
  let detail: string;
  if (a.zodiacIndex === b.zodiacIndex) {
    score = 82;
    detail = `Cùng là ${a.zodiac} — như soi gương. Hiểu nhau rất nhanh, chỉ cần nhớ chừa chỗ cho người kia khác mình một chút.`;
  } else if (opposite) {
    score = 84;
    detail = `${a.zodiac} và ${b.zodiac} là hai cung đối diện trên vòng hoàng đạo — kiểu hút nhau vì khác nhau, mỗi người giữ một nửa mà người kia cần.`;
  } else if (x === y) {
    score = 88;
    detail = `${a.zodiac} và ${b.zodiac} cùng nhóm ${x} (${ELEMENT_FEEL[x]}), nên hợp gu, hợp nhịp từ những việc nhỏ.`;
  } else if (friendly) {
    score = 86;
    detail = `${a.zodiac} (${x}) và ${b.zodiac} (${y}) là cặp nguyên tố hỗ trợ nhau: ${x} ${ELEMENT_FEEL[x]}, ${y} ${ELEMENT_FEEL[y]} — người này khơi, người kia giữ lửa.`;
  } else {
    score = 64;
    detail = `${a.zodiac} (${x}, ${ELEMENT_FEEL[x]}) và ${b.zodiac} (${y}, ${ELEMENT_FEEL[y]}) có cách yêu khác nhau, nên cần nói rõ điều mình muốn thay vì chờ người kia đoán.`;
  }
  return { key: "cung", label: "Cung hoàng đạo", score, detail };
}

// ── Thần số học ──
const LIFE_GROUPS = [[1, 5, 7], [2, 4, 8], [3, 6, 9]];
const rootOf = (n: number) => (n > 9 ? n === 11 ? 2 : n === 22 ? 4 : 6 : n);

function lifePathAspect(a: PersonProfile, b: PersonProfile): Aspect {
  const [x, y] = [rootOf(a.lifePath), rootOf(b.lifePath)];
  let score: number;
  let detail: string;
  if (x === y) {
    score = 80;
    detail = `Cùng Số Đường Đời ${a.lifePath === b.lifePath ? a.lifePath : `${a.lifePath} và ${b.lifePath}`} — chung bài học, chung cách nghĩ, nói ít mà hiểu nhiều.`;
  } else if (LIFE_GROUPS.some((g) => g.includes(x) && g.includes(y))) {
    score = 90;
    detail = `Số ${a.lifePath} và số ${b.lifePath} cùng một nhóm trong Thần số học — cách hai bạn nhìn cuộc sống đi cùng một hướng.`;
  } else {
    score = 66;
    detail = `Số ${a.lifePath} và số ${b.lifePath} đến từ hai nhóm khác nhau — một người giỏi cái người kia chưa giỏi, nên là cặp học được ở nhau nhiều.`;
  }
  return { key: "than-so-hoc", label: "Thần số học", score, detail };
}

// ── Cung mệnh (Bát trạch) ──
function cungMenhAspect(a: PersonProfile, b: PersonProfile): Aspect | null {
  if (!a.cungMenh || !b.cungMenh) return null;
  const sameGroup = DONG_TU.has(a.cungMenh) === DONG_TU.has(b.cungMenh);
  const group = DONG_TU.has(a.cungMenh) ? "Đông tứ mệnh" : "Tây tứ mệnh";
  let score: number;
  let detail: string;
  if (a.cungMenh === b.cungMenh) {
    score = 82;
    detail = `Cùng cung ${a.cungMenh} — hợp nhau về nếp sống, chọn nhà, chọn hướng cũng dễ thống nhất.`;
  } else if (sameGroup) {
    score = 90;
    detail = `${a.firstName} cung ${a.cungMenh}, ${b.firstName} cung ${b.cungMenh}, cùng nhóm ${group} — theo Bát trạch là cặp hợp mệnh, sống chung dễ thuận.`;
  } else {
    score = 62;
    detail = `${a.firstName} cung ${a.cungMenh}, ${b.firstName} cung ${b.cungMenh}, khác nhóm Đông – Tây tứ mệnh. Người xưa hay hoá giải bằng cách chọn hướng nhà theo người trụ cột — chuyện nhỏ, không đáng lo.`;
  }
  return { key: "cung-menh", label: "Cung mệnh", score, detail };
}

/** Hash ổn định, không phụ thuộc thứ tự hai tên — cho tên một chút ảnh hưởng (±4 điểm). */
function nameJitter(a: string, b: string) {
  const key = [normalizeName(a), normalizeName(b)].sort().join("|");
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) % 9) - 4;
}

const TODO: Record<ZodiacElement, string[]> = {
  "Lửa": ["Rủ nhau một chuyến đi ngắn không lên kế hoạch trước", "Cùng thử một môn mới: leo núi, cầu lông, nhảy"],
  "Đất": ["Cùng nấu một bữa tối tại nhà, mỗi người phụ trách một món", "Đặt chung một mục tiêu nhỏ, như tiết kiệm cho một chuyến đi"],
  "Khí": ["Đi cà phê và chơi bộ câu hỏi \"36 câu để hiểu nhau\"", "Cùng đi một buổi triển lãm, hội sách hoặc workshop"],
  "Nước": ["Một tối xem phim ở nhà, tắt điện thoại", "Viết cho nhau một lá thư tay ngắn rồi đổi cho nhau đọc"],
};

const FRICTION: Record<string, string> = {
  "con-giap": "Hai bạn dễ cùng cứng đầu một lúc. Khi bắt đầu to tiếng, hẹn nhau một quy tắc: dừng 10 phút rồi nói tiếp.",
  "ngu-hanh": "Một người hay quyết, một người hay nhường — để lâu người nhường sẽ mệt. Thỉnh thoảng đổi vai, để người kia chọn.",
  "cung": "Cách thể hiện tình cảm của hai bạn khác nhau. Hỏi thẳng nhau: \"Làm gì thì bạn thấy được thương nhất?\"",
  "than-so-hoc": "Hai bạn ưu tiên những thứ khác nhau trong cuộc sống. Đừng cố đổi người kia, hãy chia việc theo thế mạnh.",
  "cung-menh": "Hai bạn khác nhóm mệnh nên thói quen sinh hoạt dễ khác nhau. Thống nhất sớm những chuyện nhỏ: giờ giấc, cách tiêu tiền.",
};

function headlineFor(score: number) {
  if (score >= 90) return { headline: "Một cặp trời sinh", tagline: "Hiếm cặp nào khớp được nhiều thứ như hai bạn." };
  if (score >= 82) return { headline: "Rất hợp nhau", tagline: "Hợp gu, hợp nhịp — chỉ cần giữ lửa." };
  if (score >= 74) return { headline: "Hợp kiểu bù trừ", tagline: "Khác ở chỗ cần khác, giống ở chỗ cần giống." };
  if (score >= 66) return { headline: "Càng hiểu càng hợp", tagline: "Lúc đầu cần kiên nhẫn, về sau rất đáng." };
  return { headline: "Khác biệt để học từ nhau", tagline: "Hai thế giới khác nhau — gặp được đã là duyên." };
}

export function compatibility(pa: Person, pb: Person): Compatibility {
  return compatibilityOf(profile(pa), profile(pb));
}

export function compatibilityOf(a: PersonProfile, b: PersonProfile): Compatibility {
  const menh = cungMenhAspect(a, b);
  const aspects = [conGiapAspect(a, b), nguHanhAspect(a, b), zodiacAspect(a, b), lifePathAspect(a, b), ...(menh ? [menh] : [])];
  const weights = menh ? [0.25, 0.15, 0.25, 0.15, 0.2] : [0.3, 0.2, 0.3, 0.2];
  const raw = aspects.reduce((sum, x, i) => sum + x.score * weights[i], 0);
  const score = Math.max(55, Math.min(99, Math.round(raw + nameJitter(a.name, b.name))));

  const sorted = [...aspects].sort((p, q) => q.score - p.score);
  const strengths = sorted.slice(0, 2).map((x) => x.detail);
  const weakest = sorted[sorted.length - 1];
  const todo = [TODO[a.zodiacElement][0], TODO[b.zodiacElement][a.zodiacElement === b.zodiacElement ? 1 : 0]];
  return { a, b, score, ...headlineFor(score), aspects, strengths, friction: FRICTION[weakest.key], todo };
}

// ── Link mời: mã hoá người A vào URL, không cần lưu server ──

const MAX_NAME = 60;

/** base64url chạy được cả ở trình duyệt lẫn server (không dùng Buffer). */
function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(token: string) {
  const bin = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodePerson(p: Person) {
  return toBase64Url(JSON.stringify({ n: p.name.trim().slice(0, MAX_NAME), d: p.birthDate, ...(p.gender ? { g: p.gender } : {}) }));
}

/** Giải mã an toàn: input đến từ URL, ai cũng sửa được. */
export function decodePerson(token: string | null | undefined): Person | null {
  if (!token || token.length > 400) return null;
  try {
    const { n, d, g } = JSON.parse(fromBase64Url(token)) as { n?: unknown; d?: unknown; g?: unknown };
    if (typeof n !== "string" || typeof d !== "string") return null;
    const name = n.trim().slice(0, MAX_NAME);
    if (!name || !normalizeName(name) || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    const year = Number(d.slice(0, 4));
    if (year < 1900 || year > 2100) return null;
    return { name, birthDate: d, gender: g === "nam" || g === "nu" ? g : null };
  } catch {
    return null;
  }
}
