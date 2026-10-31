/**
 * Lập lá số Tử Vi ngay trong app, trả về đúng hình dạng JSON của API Huyền Minh
 * (huyenminh.com.vn/api/tuvi) mà route đang dùng. Trước đây route gọi thẳng API
 * đó, nhưng họ chặn IP máy chủ cloud (403 từ Vercel) nên phải tự tính.
 *
 * Quy tắc an sao theo phái Thiên Lương như Huyền Minh; bảng miếu/vượng/đắc/hãm
 * và Tứ Hóa được đối chiếu với lá số mẫu của họ ở tests/fixtures/tuvi-huyenminh.json.
 * Âm lịch theo giờ Việt Nam (UTC+7), thuật toán của Hồ Ngọc Đức.
 */
import { batTuChart } from "./bat-tu.ts";

const STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const PALACES = ["Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch", "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách", "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"];
const mod = (n: number, m = 12) => ((n % m) + m) % m;

// ---------- Âm lịch (Hồ Ngọc Đức) ----------
const TZ = 7;
function jdFromDate(dd: number, mm: number, yy: number) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  return dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}
function newMoonDay(k: number) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Math.floor(Jd1 + C1 - deltat + 0.5 + TZ / 24);
}
function sunLongitude(jdn: number) {
  const T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L -= Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor((L / Math.PI) * 6);
}
function lunarMonth11(yy: number) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = newMoonDay(k);
  if (sunLongitude(nm) >= 9) nm = newMoonDay(k - 1);
  return nm;
}
function leapMonthOffset(a11: number) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0, i = 1, arc = sunLongitude(newMoonDay(k + i));
  do { last = arc; i++; arc = sunLongitude(newMoonDay(k + i)); } while (arc !== last && i < 14);
  return i - 1;
}
export function solarToLunar(dd: number, mm: number, yy: number) {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);
  let a11 = lunarMonth11(yy), b11 = a11, year: number;
  if (a11 >= monthStart) { year = yy; a11 = lunarMonth11(yy - 1); } else { year = yy + 1; b11 = lunarMonth11(yy + 1); }
  const day = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leap = false, month = diff + 11;
  if (b11 - a11 > 365) {
    const leapDiff = leapMonthOffset(a11);
    if (diff >= leapDiff) { month = diff + 10; if (diff === leapDiff) leap = true; }
  }
  if (month > 12) month -= 12;
  if (month >= 11 && diff < 4) year -= 1;
  return { day, month, year, leap };
}

// ---------- Bảng tra ----------
const NAP_AM = ["Hải Trung Kim", "Lô Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim", "Sơn Đầu Hỏa", "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc", "Tuyền Trung Thủy", "Ốc Thượng Thổ", "Tích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy", "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc", "Bích Thượng Thổ", "Kim Bạch Kim", "Phú Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim", "Tang Đố Mộc", "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy"];
const sexagenary = (stem: number, branch: number) => mod(6 * stem - 5 * branch, 60);
const napAm = (stem: number, branch: number) => NAP_AM[Math.floor(sexagenary(stem, branch) / 2)];
const CUC: Record<string, [number, string]> = { "Thủy": [2, "Thủy nhị cục"], "Mộc": [3, "Mộc tam cục"], "Kim": [4, "Kim tứ cục"], "Thổ": [5, "Thổ ngũ cục"], "Hỏa": [6, "Hỏa lục cục"] };

// Miếu/vượng/đắc/bình/hãm theo chi Tý → Hợi.
const m = "miếu", v = "vượng", d = "đắc", b = "bình", h = "hãm";
const STATUS: Record<string, string[]> = {
  "Tử Vi": [b, d, v, d, v, m, m, d, v, d, v, d],
  "Thiên Cơ": [d, h, b, m, m, v, v, h, v, b, m, d],
  "Thái Dương": [h, d, v, m, v, m, m, d, h, h, h, h],
  "Vũ Khúc": [v, m, v, d, m, d, v, m, v, d, m, d],
  "Thiên Đồng": [v, d, m, m, h, h, h, d, m, d, h, v],
  "Liêm Trinh": [v, v, m, h, d, h, v, v, m, h, d, h],
  "Thiên Phủ": [v, d, m, d, v, m, v, d, m, d, v, m],
  "Thái Âm": [m, m, h, h, h, h, h, d, v, v, v, m],
  "Tham Lang": [d, m, v, h, m, h, d, m, v, h, m, h],
  "Cự Môn": [m, h, v, m, h, d, m, h, v, m, h, d],
  "Thiên Tướng": [m, v, m, d, v, d, m, v, m, d, v, d],
  "Thiên Lương": [v, d, d, m, m, m, m, d, v, h, m, d],
  "Thất Sát": [m, d, m, h, h, v, m, d, m, h, h, v],
  "Phá Quân": [m, v, d, h, d, h, m, v, d, h, d, h],
};

// Tứ Hóa theo can: Lộc, Quyền, Khoa, Kỵ.
const TU_HOA: string[][] = [
  ["Liêm Trinh", "Phá Quân", "Vũ Khúc", "Thái Dương"],
  ["Thiên Cơ", "Thiên Lương", "Tử Vi", "Thái Âm"],
  ["Thiên Đồng", "Thiên Cơ", "Văn Xương", "Liêm Trinh"],
  ["Thái Âm", "Thiên Đồng", "Thiên Cơ", "Cự Môn"],
  ["Tham Lang", "Thái Âm", "Hữu Bật", "Thiên Cơ"],
  ["Vũ Khúc", "Tham Lang", "Thiên Lương", "Văn Khúc"],
  ["Thái Dương", "Vũ Khúc", "Thái Âm", "Thiên Đồng"],
  ["Cự Môn", "Thái Dương", "Văn Khúc", "Văn Xương"],
  ["Thiên Lương", "Tử Vi", "Tả Phù", "Vũ Khúc"],
  ["Phá Quân", "Cự Môn", "Thái Âm", "Tham Lang"],
];
const HOA_NAMES = ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kỵ"];

const TRANG_SINH = ["Trường Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
const LOC_TON_RING = ["Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư", "Phi Liêm", "Hỷ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ"];
const THAI_TUE_RING = ["Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù", "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù"];

// Thứ tự hiển thị trong mỗi cung, giống Huyền Minh.
const GOOD_ORDER = ["Văn Xương", "Văn Khúc", "Tả Phù", "Hữu Bật", "Lộc Tồn", "Thiên Khôi", "Thiên Việt", "Long Trì", "Thiên Mã", "Đào Hoa", "Phượng Các", "Hồng Loan", "Thiên Hỷ", "Giải Thần", "Nguyệt Đức", "Thiên Đức", "Thiên Quan", "Thiên Phúc", "Quốc Ấn", "Thiên Trù", "Đường Phù", "Văn Tinh", "Thiên Giải", "Địa Giải", "Phong Cáo", "Thai Phụ", "Tam Thai", "Bát Tọa", "Ân Quang", "Thiên Quý", "Thiên Tài", "Thiên Thọ"];
const BAD_ORDER = ["Địa Kiếp", "Địa Không", "Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh", "Thiên Không", "Thiên Khốc", "Thiên Hư", "Phá Toái", "Cô Thần", "Hoa Cái", "Quả Tú", "Kiếp Sát", "Lưu Hà", "Thiên Hình", "Thiên Riêu", "Thiên Y", "Thiên Sứ", "Thiên Thương", "Thiên La", "Địa Võng", "Đẩu Quân"];

export type TuViEngineInput = { day: number; month: number; year: number; hour: number; minute: number; gender: "nam" | "nu"; readingYear: number };

export function tuViEngine(input: TuViEngineInput) {
  const lunar = solarToLunar(input.day, input.month, input.year);
  const ys = mod(lunar.year - 4, 10), yb = mod(lunar.year - 4, 12);
  const hb = Math.floor((input.hour + 1) / 2) % 12;
  const male = input.gender === "nam";
  const yang = ys % 2 === 0;
  const forward = yang === male; // dương nam, âm nữ đi thuận
  // Tháng nhuận: nửa đầu (đến ngày 15) tính theo tháng đó, nửa sau tính sang tháng kế.
  const lm = lunar.leap && lunar.day > 15 ? (lunar.month % 12) + 1 : lunar.month, ld = lunar.day;

  // Cung Mệnh, Thân, can cung
  const menh = mod(2 + lm - 1 - hb), than = mod(2 + lm - 1 + hb);
  const danStem = mod(ys * 2 + 2, 10);
  const stemOf = (branch: number) => mod(danStem + mod(branch - 2), 10);
  const palaceAt = (branch: number) => PALACES[mod(branch - menh)];

  const banMenh = napAm(ys, yb);
  const [soCuc, cucName] = CUC[napAm(stemOf(menh), menh).split(" ").at(-1)!];

  // ---- 14 chính tinh ----
  const q = Math.ceil(ld / soCuc), x = q * soCuc - ld;
  const tv = mod(2 + q - 1 + (x % 2 === 0 ? x : -x));
  const tp = mod(4 - tv);
  const stars: Record<string, number> = {
    "Tử Vi": tv, "Thiên Cơ": mod(tv - 1), "Thái Dương": mod(tv - 3), "Vũ Khúc": mod(tv - 4), "Thiên Đồng": mod(tv - 5), "Liêm Trinh": mod(tv - 8),
    "Thiên Phủ": tp, "Thái Âm": mod(tp + 1), "Tham Lang": mod(tp + 2), "Cự Môn": mod(tp + 3), "Thiên Tướng": mod(tp + 4), "Thiên Lương": mod(tp + 5), "Thất Sát": mod(tp + 6), "Phá Quân": mod(tp + 10),
  };
  const majors = Object.keys(STATUS);

  // ---- Phụ tinh ----
  const tam = yb % 4; // Thân Tý Thìn = 0, Tỵ Dậu Sửu = 1, Dần Ngọ Tuất = 2, Hợi Mão Mùi = 3
  const locTon = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][ys];
  const taPhu = mod(4 + lm - 1), huuBat = mod(10 - (lm - 1));
  const vanXuong = mod(10 - hb), vanKhuc = mod(4 + hb);
  const phongCac = mod(10 - yb), hongLoan = mod(3 - yb);
  const hoaStart = [2, 3, 1, 9][tam], linhStart = [10, 10, 3, 10][tam];
  stars["Tả Phù"] = taPhu; stars["Hữu Bật"] = huuBat; stars["Văn Xương"] = vanXuong; stars["Văn Khúc"] = vanKhuc;
  const minor: [string, number][] = [
    ["Lộc Tồn", locTon], ["Kình Dương", mod(locTon + 1)], ["Đà La", mod(locTon - 1)],
    ["Thiên Khôi", [1, 0, 11, 11, 1, 0, 1, 6, 3, 3][ys]], ["Thiên Việt", [7, 8, 9, 9, 7, 8, 7, 2, 5, 5][ys]],
    ["Quốc Ấn", mod(locTon + 8)], ["Đường Phù", mod(locTon + 5)], ["Văn Tinh", mod(locTon + 3)],
    ["Thiên Quan", [7, 4, 5, 2, 3, 9, 11, 9, 10, 6][ys]], ["Thiên Phúc", [9, 8, 0, 11, 3, 2, 6, 5, 6, 5][ys]],
    ["Thiên Trù", [5, 6, 0, 5, 6, 8, 2, 6, 9, 11][ys]], ["Lưu Hà", [9, 10, 7, 4, 5, 6, 4, 3, 11, 2][ys]],
    ["Tả Phù", taPhu], ["Hữu Bật", huuBat], ["Văn Xương", vanXuong], ["Văn Khúc", vanKhuc],
    ["Tam Thai", mod(taPhu + ld - 1)], ["Bát Tọa", mod(huuBat - (ld - 1))],
    ["Ân Quang", mod(vanXuong + ld - 2)], ["Thiên Quý", mod(vanKhuc - ld + 2)],
    ["Thiên Hình", mod(9 + lm - 1)], ["Thiên Riêu", mod(1 + lm - 1)], ["Thiên Y", mod(1 + lm - 1)],
    ["Thiên Giải", mod(8 + lm - 1)], ["Địa Giải", mod(7 + lm - 1)],
    ["Địa Không", mod(11 - hb)], ["Địa Kiếp", mod(11 + hb)], ["Thai Phụ", mod(6 + hb)], ["Phong Cáo", mod(2 + hb)],
    ["Hỏa Tinh", mod(hoaStart + hb)], ["Linh Tinh", mod(linhStart + hb)],
    ["Thiên Mã", [2, 11, 8, 5][tam]], ["Hoa Cái", [4, 1, 10, 7][tam]], ["Kiếp Sát", [5, 2, 11, 8][tam]], ["Đào Hoa", [9, 6, 3, 0][tam]],
    ["Phá Toái", [5, 1, 9][yb % 3]], ["Cô Thần", [2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 2][yb]], ["Quả Tú", [10, 10, 1, 1, 1, 4, 4, 4, 7, 7, 7, 10][yb]],
    ["Thiên Khốc", mod(6 - yb)], ["Thiên Hư", mod(6 + yb)], ["Long Trì", mod(4 + yb)], ["Phượng Các", phongCac], ["Giải Thần", phongCac],
    ["Hồng Loan", hongLoan], ["Thiên Hỷ", mod(hongLoan + 6)], ["Thiên Đức", mod(9 + yb)], ["Nguyệt Đức", mod(5 + yb)],
    ["Thiên Không", mod(yb + 1)], ["Thiên Tài", mod(menh + yb)], ["Thiên Thọ", mod(than + yb)],
    ["Đẩu Quân", mod(yb - (lm - 1) + hb)], ["Thiên La", 4], ["Địa Võng", 10],
    // Thuận: Thương ở Tật Ách, Sứ ở Nô Bộc; nghịch thì đổi chỗ.
    ["Thiên Thương", mod(menh + (forward ? 7 : 5))], ["Thiên Sứ", mod(menh + (forward ? 5 : 7))],
  ];

  // ---- Tuần, Triệt ----
  const tuan = [mod(yb - ys + 10), mod(yb - ys + 11)];
  const triet = [[8, 9], [6, 7], [4, 5], [2, 3], [0, 1]][ys % 5];

  // ---- Vòng sao ----
  const tsStart = { 2: 8, 5: 8, 3: 11, 4: 5, 6: 2 }[soCuc]!;
  const step = forward ? 1 : -1;

  // ---- Tứ Hóa ----
  const hoaOf = (stem: number) => TU_HOA[stem].map((star, i) => {
    const pos = stars[star];
    return { hoa: HOA_NAMES[i], sao: star, vi_tri: BRANCHES[pos], cung: palaceAt(pos) };
  });
  const natal = hoaOf(ys);

  const cung = Array.from({ length: 12 }, (_, i) => {
    const pos = mod(menh + i);
    const minorHere = minor.filter(([, p]) => p === pos).map(([name]) => name);
    return {
      vi_tri: BRANCHES[pos],
      ten: PALACES[i],
      chinh_tinh: majors.filter((s) => stars[s] === pos).map((s) => ({ ten: s, trang_thai: STATUS[s][pos] })),
      phu_tinh_tot: GOOD_ORDER.filter((s) => minorHere.includes(s)),
      phu_tinh_xau: BAD_ORDER.filter((s) => minorHere.includes(s)),
      vong_thai_tue: THAI_TUE_RING[mod(pos - yb)],
      vong_loc_ton: LOC_TON_RING[mod((pos - locTon) * step)],
      vong_trang_sinh: TRANG_SINH[mod((pos - tsStart) * step)],
      hoa: natal.filter((item) => item.vi_tri === BRANCHES[pos]).map((item) => item.hoa),
      tuan_triet: [...(tuan.includes(pos) ? ["Tuần"] : []), ...(triet.includes(pos) ? ["Triệt"] : [])],
      la_cung_than: pos === than,
    };
  });

  // ---- Đại vận ----
  const daiVan = Array.from({ length: 12 }, (_, i) => {
    const pos = mod(menh + i * step);
    return { tuoi_bat_dau: soCuc + i * 10, tuoi_ket_thuc: soCuc + i * 10 + 9, cung: palaceAt(pos), pos };
  });

  // ---- Lưu niên ----
  const age = input.readingYear - lunar.year + 1;
  const ryStem = mod(input.readingYear - 4, 10), ryBranch = mod(input.readingYear - 4, 12);
  const current = daiVan.find((p) => age >= p.tuoi_bat_dau && age <= p.tuoi_ket_thuc) ?? daiVan[0];
  const yearInDecade = age - current.tuoi_bat_dau + 1;
  // Năm 1 ở cung đại vận, năm 2 xung chiếu, năm 3 lùi một cung ngược chiều, từ năm 4 tiến theo chiều đại vận.
  const third = mod(current.pos + 6 - step);
  const luuDaiVanPos = yearInDecade <= 1 ? current.pos : yearInDecade === 2 ? mod(current.pos + 6) : mod(third + (yearInDecade - 3) * step);
  const tieuHanStart = [10, 7, 4, 1][tam];
  const tieuHanPos = mod(tieuHanStart + (male ? 1 : -1) * (age - 1));

  const pillars = batTuChart({
    birthDate: `${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`,
    birthTime: `${String(input.hour).padStart(2, "0")}:${String(input.minute).padStart(2, "0")}`,
    gender: male ? "Nam" : "Nữ",
  }).pillars.map((p) => `${p.stem} ${p.branch}`);

  return {
    cuc: cucName,
    so_cuc: soCuc,
    am_duong_nam_sinh: `${yang ? "duong" : "am"}_${input.gender}`,
    ban_menh: banMenh,
    cung,
    cung_than: `Thân cư ${palaceAt(than)}`,
    ten_cung_than: palaceAt(than),
    dai_van: daiVan.map(({ tuoi_bat_dau, tuoi_ket_thuc, cung }) => ({ tuoi_bat_dau, tuoi_ket_thuc, cung })),
    sao_vi_tri: Object.fromEntries(Object.entries(stars).map(([name, pos]) => [name, BRANCHES[pos]])),
    tu_hoa_van_han: {
      nguyen_cuc: natal,
      dai_van: daiVan.map((p) => ({ tuoi: `${p.tuoi_bat_dau}-${p.tuoi_ket_thuc}`, cung_dai_van: p.cung, can_cung: STEMS[stemOf(p.pos)], hoa: hoaOf(stemOf(p.pos)) })),
    },
    am_lich: { ngay: lunar.day, thang: lunar.month, nam: lunar.year, nhuan: lunar.leap },
    bat_tu: { tu_tru: { nam: pillars[0], thang: pillars[1], ngay: pillars[2], gio: pillars[3] } },
    luu_nien: {
      tuoi_ta: age,
      dai_van: { tuoi_bat_dau: current.tuoi_bat_dau, tuoi_ket_thuc: current.tuoi_ket_thuc, cung: current.cung, tu_hoa: hoaOf(stemOf(current.pos)) },
      luu_dai_van: { tuoi: age, cung: palaceAt(luuDaiVanPos), cung_dai_van: current.cung },
      tieu_han: { tuoi: age, cung: palaceAt(tieuHanPos), chieu: male ? "thuận (nam)" : "nghịch (nữ)" },
      tu_hoa_luu_nien: { can_chi_nam: `${STEMS[ryStem]} ${BRANCHES[ryBranch]}`, hoa: hoaOf(ryStem) },
    },
  };
}
