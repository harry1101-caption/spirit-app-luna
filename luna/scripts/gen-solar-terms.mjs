// Sinh bảng 12 "tiết" (jie) dùng làm mốc đổi trụ Tháng trong Bát Tự.
//
// Vì sao sinh sẵn bảng thay vì tính lúc chạy: bảng soi được bằng mắt với lịch
// vạn niên, còn thuật toán thiên văn chạy ngầm thì sai cũng không ai biết.
//
// Thuật toán: kinh độ biểu kiến của Mặt Trời theo Meeus "Astronomical
// Algorithms" ch.25, giải ngược bằng lặp để tìm thời điểm λ chạm đúng mốc.
// Độ chính xác của công thức rút gọn này khoảng 0.01° ≈ 15 phút thời gian.
//
//   node scripts/gen-solar-terms.mjs > src/lib/solar-terms.ts

const FROM = 1900;
const TO = 2100;
const TZ_MINUTES = 7 * 60; // giờ Việt Nam

// 12 tiết mở đầu mỗi tháng Bát Tự. Lập Xuân (315°) vừa mở tháng Dần vừa là
// mốc đổi trụ Năm — không phải 1/1 cũng không phải Tết Nguyên Đán.
const JIE = [
  { name: "Lập Xuân", lon: 315, branch: "Dần" },
  { name: "Kinh Trập", lon: 345, branch: "Mão" },
  { name: "Thanh Minh", lon: 15, branch: "Thìn" },
  { name: "Lập Hạ", lon: 45, branch: "Tỵ" },
  { name: "Mang Chủng", lon: 75, branch: "Ngọ" },
  { name: "Tiểu Thử", lon: 105, branch: "Mùi" },
  { name: "Lập Thu", lon: 135, branch: "Thân" },
  { name: "Bạch Lộ", lon: 165, branch: "Dậu" },
  { name: "Hàn Lộ", lon: 195, branch: "Tuất" },
  { name: "Lập Đông", lon: 225, branch: "Hợi" },
  { name: "Đại Tuyết", lon: 255, branch: "Tý" },
  { name: "Tiểu Hàn", lon: 285, branch: "Sửu" },
];

const rad = (d) => (d * Math.PI) / 180;

/** ΔT (giây): chênh giữa Thời gian Động lực (TT) và giờ thế giới (UT).
 *  Đa thức Espenak & Meeus, chia đoạn theo năm. */
function deltaT(year) {
  if (year < 1920) {
    const t = year - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  if (year < 1941) {
    const t = year - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3;
  }
  if (year < 1961) {
    const t = year - 1950;
    return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
  }
  if (year < 1986) {
    const t = year - 1975;
    return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
  }
  if (year < 2005) {
    const t = year - 2000;
    return (
      63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 +
      0.000651814 * t ** 4 + 0.00002373599 * t ** 5
    );
  }
  if (year < 2050) {
    const t = year - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t ** 2;
  }
  return -20 + 32 * ((year - 1820) / 100) ** 2 - 0.5628 * (2150 - year);
}

/** Kinh độ biểu kiến của Mặt Trời (độ) tại Julian Day `jde` thang TT. */
function apparentLongitude(jde) {
  const T = (jde - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(rad(M)) +
    (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M)) +
    0.000289 * Math.sin(rad(3 * M));
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega));
  return ((lambda % 360) + 360) % 360;
}

/** Chênh góc có dấu, đưa về (-180, 180] — để lặp không nhảy vòng ở mốc 0°/360°. */
const angleDiff = (a, b) => (((a - b + 180) % 360) + 360) % 360 - 180;

const jdFromUTC = (ms) => ms / 86400000 + 2440587.5;
const utcFromJD = (jd) => (jd - 2440587.5) * 86400000;

/** Thời điểm (ms UTC) Mặt Trời đạt kinh độ `lon`, dò từ mốc đoán `guessMs`. */
function solveTerm(lon, guessMs, year) {
  let jd = jdFromUTC(guessMs);
  const dt = deltaT(year) / 86400;
  for (let i = 0; i < 40; i += 1) {
    const diff = angleDiff(lon, apparentLongitude(jd + dt));
    if (Math.abs(diff) < 1e-8) break;
    jd += diff / 0.9856473; // Mặt Trời đi ~0.9856°/ngày
  }
  return utcFromJD(jd);
}

const table = {};
for (let year = FROM; year <= TO; year += 1) {
  const yearStart = Date.UTC(year, 0, 1) - TZ_MINUTES * 60000;
  table[year] = JIE.map((jie, index) => {
    const guess = Date.UTC(year, 1, 4) + index * 30.44 * 86400000;
    return Math.round((solveTerm(jie.lon, guess, year) - yearStart) / 60000);
  });
}

const rows = Object.entries(table)
  .map(([year, mins]) => `  ${year}: [${mins.join(",")}],`)
  .join("\n");

process.stdout.write(`// SINH TỰ ĐỘNG bởi scripts/gen-solar-terms.mjs — đừng sửa tay.
//
// solarTermMinutes[Y] là 12 mốc mở đầu 12 tháng của NĂM BÁT TỰ Y, theo thứ tự
// Dần → Sửu. Vì năm Bát Tự chạy từ Lập Xuân năm Y tới Lập Xuân năm Y+1, mốc
// cuối (Tiểu Hàn) rơi vào tháng 1 DƯƠNG LỊCH của năm Y+1 — nên giá trị cuối
// mảng lớn hơn số phút của một năm. Đó là đúng, không phải lỗi.
//
// Đơn vị: số phút kể từ 00:00 ngày 1/1 năm Y theo giờ Việt Nam (UTC+7).
export const jieNames = ${JSON.stringify(JIE.map((j) => j.name))} as const;
export const jieBranches = ${JSON.stringify(JIE.map((j) => j.branch))} as const;
export const solarTermRange = { from: ${FROM}, to: ${TO} } as const;
export const solarTermMinutes: Record<number, number[]> = {
${rows}
};
`);
