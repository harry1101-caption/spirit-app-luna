import * as Astronomy from "astronomy-engine";

/**
 * Human Design — lập biểu đồ tại chỗ từ vị trí hành tinh thật.
 *
 * Khác hẳn các feature khác trong app: hệ này cần ephemeris đầy đủ, không chỉ
 * Mặt Trời. Dùng astronomy-engine (MIT, thuần JS) để lấy kinh độ hoàng đạo
 * địa tâm của 11 thiên thể tại HAI thời điểm.
 *
 * Quy ước đã chọn, ghi rõ để người đọc biết:
 *  - Personality (ý thức) lấy tại giờ sinh.
 *  - Design (vô thức) lấy tại lúc Mặt Trời còn cách giờ sinh đúng 88 ĐỘ cung
 *    hoàng đạo — không phải 88 ngày.
 *  - Bánh xe cổng bắt đầu ở Cổng 41 tại 302° (2° Bảo Bình), mỗi cổng 5.625°,
 *    mỗi hào 0.9375°.
 *  - Giờ sinh phải chính xác: Mặt Trăng đi ~13°/ngày, lệch 15 phút đã có thể
 *    đổi hào.
 */

/** Thứ tự 64 cổng trên bánh xe Rave, bắt đầu từ Cổng 41 ở 302°. */
const gateWheel = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

export const centers = [
  "Đầu", "Ajna", "Cổ Họng", "Bản Ngã G", "Tim", "Lá Lách", "Tùng", "Xương Cùng", "Gốc",
] as const;
export type Center = (typeof centers)[number];

/** Bốn trung tâm động cơ — quyết định Type. */
const motors: Center[] = ["Tim", "Tùng", "Xương Cùng", "Gốc"];

const centerGates: Record<Center, number[]> = {
  "Đầu": [61, 63, 64],
  "Ajna": [4, 11, 17, 24, 43, 47],
  "Cổ Họng": [8, 12, 16, 20, 23, 31, 33, 35, 45, 56, 62],
  "Bản Ngã G": [1, 2, 7, 10, 13, 15, 25, 46],
  "Tim": [21, 26, 40, 51],
  "Lá Lách": [18, 28, 32, 44, 48, 50, 57],
  "Tùng": [6, 22, 30, 36, 37, 49, 55],
  "Xương Cùng": [3, 5, 9, 14, 27, 29, 34, 42, 59],
  "Gốc": [19, 38, 39, 41, 52, 53, 54, 58, 60],
};

export const gateCenter: Record<number, Center> = Object.fromEntries(
  Object.entries(centerGates).flatMap(([center, gates]) =>
    gates.map((g) => [g, center as Center]),
  ),
) as Record<number, Center>;

/** 36 kênh, mỗi kênh nối hai cổng ở hai trung tâm khác nhau. */
export const channels: [number, number][] = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52],
  [10, 20], [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48],
  [17, 62], [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43],
  [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], [30, 41],
  [32, 54], [34, 57], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64],
];

export const bodies = [
  "Mặt Trời", "Trái Đất", "Mặt Trăng", "Bắc Giao Điểm", "Nam Giao Điểm",
  "Thuỷ", "Kim", "Hoả", "Mộc", "Thổ", "Thiên Vương", "Hải Vương", "Diêm Vương",
] as const;
export type BodyName = (typeof bodies)[number];

export type Activation = { body: BodyName; longitude: number; gate: number; line: number };

export type HumanDesignInput = {
  birthDate: string;   // YYYY-MM-DD
  birthTime: string;   // HH:mm
  tzOffset: number;    // phút lệch so với UTC, ví dụ 420 cho UTC+7
};

export type HumanDesignChart = {
  input: HumanDesignInput;
  designAt: string;
  personality: Activation[];
  design: Activation[];
  definedCenters: Center[];
  openCenters: Center[];
  activeChannels: { gates: [number, number]; centers: [Center, Center] }[];
  type: "Manifestor" | "Generator" | "Manifesting Generator" | "Projector" | "Reflector";
  strategy: string;
  authority: string;
  profile: string;
  notes: string[];
};

const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** Kinh độ hoàng đạo → cổng và hào. */
export function toGate(longitude: number) {
  // Bánh xe bắt đầu ở 302°; mỗi cổng 5.625°, mỗi hào 0.9375°.
  const offset = norm(longitude - 302);
  const index = Math.floor(offset / 5.625);
  const within = offset - index * 5.625;
  return { gate: gateWheel[index], line: Math.floor(within / 0.9375) + 1 };
}

function longitudeOf(body: BodyName, time: Astronomy.AstroTime): number {
  if (body === "Trái Đất") return norm(longitudeOf("Mặt Trời", time) + 180);
  if (body === "Nam Giao Điểm") return norm(longitudeOf("Bắc Giao Điểm", time) + 180);
  if (body === "Bắc Giao Điểm") {
    // Giao điểm trung bình: công thức tiêu chuẩn theo thế kỷ Julius.
    const T = (time.tt - 0) / 36525;
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
  }
  const map: Record<string, Astronomy.Body> = {
    "Mặt Trời": Astronomy.Body.Sun, "Mặt Trăng": Astronomy.Body.Moon,
    "Thuỷ": Astronomy.Body.Mercury, "Kim": Astronomy.Body.Venus,
    "Hoả": Astronomy.Body.Mars, "Mộc": Astronomy.Body.Jupiter,
    "Thổ": Astronomy.Body.Saturn, "Thiên Vương": Astronomy.Body.Uranus,
    "Hải Vương": Astronomy.Body.Neptune, "Diêm Vương": Astronomy.Body.Pluto,
  };
  return norm(Astronomy.Ecliptic(Astronomy.GeoVector(map[body], time, true)).elon);
}

const activationsAt = (time: Astronomy.AstroTime): Activation[] =>
  bodies.map((body) => {
    const longitude = longitudeOf(body, time);
    return { body, longitude, ...toGate(longitude) };
  });

/** Thời điểm Design: lúc Mặt Trời còn cách giờ sinh đúng 88 độ cung. */
function designTime(birth: Date): Date {
  const target = norm(longitudeOf("Mặt Trời", Astronomy.MakeTime(birth)) - 88);
  let guess = new Date(birth.getTime() - 88.5 * 86400000);
  for (let i = 0; i < 40; i += 1) {
    const current = longitudeOf("Mặt Trời", Astronomy.MakeTime(guess));
    let diff = target - current;
    diff = ((diff + 180) % 360 + 360) % 360 - 180;
    if (Math.abs(diff) < 1e-9) break;
    guess = new Date(guess.getTime() + (diff / 0.9856473) * 86400000);
  }
  return guess;
}

export function humanDesignChart(input: HumanDesignInput): HumanDesignChart {
  const [y, m, d] = input.birthDate.split("-").map(Number);
  const [hh, mm] = input.birthTime.split(":").map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm))
    throw new Error("Ngày hoặc giờ sinh chưa hợp lệ.");
  // Giờ nhập là giờ địa phương; quy về UTC bằng độ lệch múi giờ.
  const birth = new Date(Date.UTC(y, m - 1, d, hh, mm) - input.tzOffset * 60000);
  if (y < 1900 || y > 2100) throw new Error("Chỉ hỗ trợ năm sinh từ 1900 đến 2100.");

  const design = designTime(birth);
  const personalityActivations = activationsAt(Astronomy.MakeTime(birth));
  const designActivations = activationsAt(Astronomy.MakeTime(design));

  const activeGates = new Set(
    [...personalityActivations, ...designActivations].map((a) => a.gate),
  );
  const activeChannels = channels
    .filter(([a, b]) => activeGates.has(a) && activeGates.has(b))
    .map(([a, b]) => ({
      gates: [a, b] as [number, number],
      centers: [gateCenter[a], gateCenter[b]] as [Center, Center],
    }));

  const definedSet = new Set<Center>();
  for (const ch of activeChannels) {
    definedSet.add(ch.centers[0]);
    definedSet.add(ch.centers[1]);
  }
  const definedCenters = centers.filter((c) => definedSet.has(c));
  const openCenters = centers.filter((c) => !definedSet.has(c));

  // Có đường nối từ một động cơ tới Cổ Họng không (đi qua các kênh đang mở).
  const adjacency = new Map<Center, Set<Center>>();
  for (const ch of activeChannels) {
    const [a, b] = ch.centers;
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a)!.add(b);
    adjacency.get(b)!.add(a);
  }
  const reaches = (from: Center, to: Center) => {
    const seen = new Set<Center>([from]);
    const queue = [from];
    while (queue.length) {
      const node = queue.shift()!;
      if (node === to) return true;
      for (const next of adjacency.get(node) ?? []) {
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    return false;
  };
  const motorToThroat = motors.some(
    (motor) => definedSet.has(motor) && reaches(motor, "Cổ Họng"),
  );

  const sacral = definedSet.has("Xương Cùng");
  let type: HumanDesignChart["type"];
  if (!definedCenters.length) type = "Reflector";
  else if (sacral) type = motorToThroat ? "Manifesting Generator" : "Generator";
  else if (motorToThroat) type = "Manifestor";
  else type = "Projector";

  const strategy = {
    Manifestor: "Thông báo trước khi hành động",
    Generator: "Chờ phản hồi rồi đáp lại",
    "Manifesting Generator": "Chờ phản hồi, rồi thông báo trước khi hành động",
    Projector: "Chờ được mời",
    Reflector: "Chờ trọn một chu kỳ trăng rồi mới quyết",
  }[type];

  const authority = definedSet.has("Tùng")
    ? "Cảm xúc (Tùng)"
    : sacral
      ? "Xương Cùng"
      : definedSet.has("Lá Lách")
        ? "Lá Lách"
        : definedSet.has("Tim")
          ? "Ý chí (Tim)"
          : definedSet.has("Bản Ngã G")
            ? "Tự định hướng (G)"
            : definedCenters.length
              ? "Thuộc môi trường (không có nội quyền)"
              : "Theo chu kỳ trăng";

  const pSun = personalityActivations[0];
  const dSun = designActivations[0];
  const notes: string[] = [
    "Giờ sinh càng chính xác càng tốt: Mặt Trăng đi khoảng 13° mỗi ngày nên lệch 15 phút đã có thể đổi hào.",
  ];
  if (type === "Reflector")
    notes.push("Không trung tâm nào được định nghĩa — đây là dạng hiếm, khoảng 1% dân số.");

  return {
    input,
    designAt: design.toISOString().slice(0, 16).replace("T", " ") + " UTC",
    personality: personalityActivations,
    design: designActivations,
    definedCenters,
    openCenters,
    activeChannels,
    type,
    strategy,
    authority,
    profile: `${pSun.line}/${dSun.line}`,
    notes,
  };
}
