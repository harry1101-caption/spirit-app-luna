import { z } from "zod";
import { zodiac, zodiacFromDate } from "./engine.ts";
import { hash } from "./seeded.ts";

/**
 * Phác hoạ người ấy (soulmate sketch).
 * Đặc điểm của "người ấy" được rút ổn định từ họ tên + ngày sinh + người muốn vẽ:
 * cùng thông tin thì luôn ra cùng một mô tả, chỉ nét vẽ của AI là khác mỗi lần.
 */

export const portraitStyles = ["pencil", "realistic"] as const;
export type PortraitStyle = (typeof portraitStyles)[number];
/** Kiểu vẽ miễn phí. "realistic" là gói trả phí, server từ chối nếu chưa mở khoá. */
export const FREE_STYLES: readonly PortraitStyle[] = ["pencil"];

export const phacHoaInputSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["Nam", "Nữ"]),
  target: z.enum(["Nam", "Nữ"]),
  style: z.enum(portraitStyles),
  /** Ảnh chân dung của người dùng (tuỳ chọn), data URL JPEG/PNG/WebP đã thu nhỏ ở trình duyệt */
  photo: z
    .string()
    .max(1_500_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .optional(),
});
export type PhacHoaInput = z.infer<typeof phacHoaInputSchema>;

type Trait = readonly [vi: string, en: string];

/** Nét tướng đọc từ ảnh chân dung người dùng (nếu có) */
export const faceShapes = ["thon", "tròn", "góc cạnh", "trái xoan"] as const;
export type FaceReading = {
  faceShape: (typeof faceShapes)[number];
  /** 1 câu mô tả thần thái, tiếng Việt */
  vibe: string;
  /** 2–3 nét nổi bật, tiếng Việt, trung tính */
  features: string[];
};
/** Tướng bổ trợ: mặt tròn hợp người góc cạnh, mặt thon hợp người phúc hậu… (index trong FACES) */
const COMPLEMENT_FACE: Record<FaceReading["faceShape"], number> = { thon: 1, tròn: 2, "góc cạnh": 0, "trái xoan": 3 };

const FACES: Trait[] = [
  ["gương mặt thon, đường nét mềm", "a slim face with soft features"],
  ["khuôn mặt tròn, trông phúc hậu", "a gentle round face"],
  ["đường quai hàm rõ, góc cạnh", "a defined, angular jawline"],
  ["khuôn mặt trái xoan", "an oval, heart-shaped face"],
];
const EYES: Trait[] = [
  ["đôi mắt một mí, sâu và tĩnh", "deep, calm monolid eyes"],
  ["mắt cười cong như trăng khuyết", "eyes that curve like crescents when smiling"],
  ["đôi mắt to, trong veo", "large, clear eyes"],
  ["ánh nhìn trầm, hay suy nghĩ", "a thoughtful, steady gaze"],
];
const HAIR: Record<PhacHoaInput["target"], Trait[]> = {
  Nam: [
    ["tóc ngắn gọn gàng", "neat short hair"],
    ["tóc rẽ ngôi, hơi bồng", "side-parted, slightly wavy hair"],
    ["tóc hơi dài, vén ra sau tai", "medium-length hair tucked behind the ears"],
    ["tóc xoăn nhẹ tự nhiên", "naturally soft curly hair"],
  ],
  Nữ: [
    ["tóc dài thẳng, buông tự nhiên", "long straight hair falling naturally"],
    ["tóc ngang vai, uốn nhẹ", "shoulder-length softly waved hair"],
    ["tóc búi thấp, vài sợi rơi bên má", "a low bun with loose strands framing the face"],
    ["tóc bob ngắn", "a short bob haircut"],
  ],
};
const SMILES: Trait[] = [
  ["nụ cười hiền, hơi ngại ngùng", "a shy, gentle smile"],
  ["cười rạng rỡ, rất dễ lây", "a bright, open smile"],
  ["khoé môi khẽ cong như đang giữ một bí mật", "a subtle, knowing smile"],
  ["vẻ mặt trầm tư, ấm áp", "a warm, pensive expression"],
];
const DETAILS: Trait[] = [
  ["một nốt ruồi nhỏ gần khoé mắt", "a small beauty mark near one eye"],
  ["đeo kính gọng mảnh", "thin-framed glasses"],
  ["lúm đồng tiền ở một bên má", "a dimple on one cheek"],
  ["hàng lông mày đậm, rất có hồn", "thick, expressive eyebrows"],
];
const OUTFITS: Trait[] = [
  ["áo sơ mi trắng đơn giản", "a simple white shirt"],
  ["áo len cổ lọ", "a turtleneck sweater"],
  ["áo khoác denim", "a denim jacket"],
  ["áo thun trơn, phong cách tối giản", "a plain minimalist t-shirt"],
];
const PLACES = [
  "một quán cà phê yên tĩnh, nơi có nhiều sách",
  "một chuyến đi xa, giữa đường",
  "một buổi gặp bạn bè chung",
  "nơi làm việc hoặc một lớp học",
  "một buổi chiều mưa, lúc cả hai cùng trú",
  "một sự kiện âm nhạc hoặc triển lãm",
];
const FIRST_IMPRESSIONS = [
  "Lần đầu gặp, bạn sẽ thấy người ấy hơi khó gần — nhưng chỉ vài câu chuyện là khác hẳn.",
  "Người ấy nhớ những chi tiết nhỏ bạn từng kể, kể cả khi bạn đã quên.",
  "Ở cạnh người ấy, im lặng không hề ngượng ngùng.",
  "Người ấy hay là người hỏi han trước khi bạn kịp nói mình mệt.",
];

const ELEMENTS = {
  Lửa: { signs: ["Bạch Dương", "Sư Tử", "Nhân Mã"], vibe: "nhiệt thành, chủ động, sống hết mình", match: "Khí" },
  Đất: { signs: ["Kim Ngưu", "Xử Nữ", "Ma Kết"], vibe: "điềm đạm, chắc chắn, đáng tin", match: "Nước" },
  Khí: { signs: ["Song Tử", "Thiên Bình", "Bảo Bình"], vibe: "hoạt ngôn, tò mò, nhiều ý tưởng", match: "Lửa" },
  Nước: { signs: ["Cự Giải", "Bọ Cạp", "Song Ngư"], vibe: "tinh tế, sâu sắc, giàu cảm xúc", match: "Đất" },
} as const;
type Element = keyof typeof ELEMENTS;

const elementOf = (sign: string) =>
  (Object.keys(ELEMENTS) as Element[]).find((e) => (ELEMENTS[e].signs as readonly string[]).includes(sign))!;

export function ageOn(birthDate: string, now = new Date()) {
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

export type SoulmateProfile = {
  target: PhacHoaInput["target"];
  age: number;
  yourSign: string;
  sign: string;
  element: Element;
  vibe: string;
  why: string;
  traits: string[];
  place: string;
  firstImpression: string;
  /** chỉ có khi người dùng tải chân dung lên */
  faceMatch?: { yours: FaceReading; text: string };
  /** mô tả tiếng Anh cho model vẽ */
  promptTraits: string[];
};

export function soulmateProfile(input: PhacHoaInput, face?: FaceReading | null): SoulmateProfile {
  const seed = `${input.fullName.toLowerCase()}|${input.birthDate}|${input.target}`;
  const pick = <T,>(list: readonly T[], salt: string) => list[hash(`${seed}|${salt}`) % list.length];

  const yourSign = zodiacFromDate(input.birthDate);
  const yourElement = elementOf(yourSign);
  // Nguyên tố hợp: Lửa–Khí, Đất–Nước (và cùng nguyên tố)
  const element: Element = hash(`${seed}|el`) % 3 === 0 ? yourElement : ELEMENTS[yourElement].match;
  const sign = pick(ELEMENTS[element].signs, "sign");

  const age = Math.min(70, Math.max(20, ageOn(input.birthDate) + (hash(`${seed}|age`) % 7) - 3));
  const chosen = [
    face ? FACES[COMPLEMENT_FACE[face.faceShape]] : pick(FACES, "face"),
    pick(EYES, "eyes"),
    pick(HAIR[input.target], "hair"),
    pick(SMILES, "smile"),
    pick(DETAILS, "detail"),
    pick(OUTFITS, "outfit"),
  ];

  const why =
    element === yourElement
      ? `Bạn thuộc cung ${yourSign} (nguyên tố ${yourElement}). Người ấy cùng nguyên tố với bạn nên hiểu nhịp sống của bạn mà không cần giải thích nhiều.`
      : `Bạn thuộc cung ${yourSign} (nguyên tố ${yourElement}). Người ấy mang nguyên tố ${element} — trong chiêm tinh, ${yourElement} và ${element} là cặp bổ trợ cho nhau.`;

  return {
    target: input.target,
    age,
    yourSign,
    sign,
    element,
    vibe: ELEMENTS[element].vibe,
    why,
    traits: chosen.map(([vi]) => vi),
    place: pick(PLACES, "place"),
    firstImpression: pick(FIRST_IMPRESSIONS, "first"),
    faceMatch: face
      ? {
          yours: face,
          text:
            FACES[COMPLEMENT_FACE[face.faceShape]] === FACES[3] && face.faceShape === "trái xoan"
              ? `Bạn có khuôn mặt trái xoan, người ấy cũng vậy — nhân tướng gọi là "tướng phu thê", hai người nhìn lâu sẽ thấy giống nhau.`
              : `Bạn có khuôn mặt ${face.faceShape}. Theo nhân tướng, người ấy mang ${chosen[0][0]} — hai nét tướng bổ trợ nhau, một người mềm thì người kia vững.`,
        }
      : undefined,
    promptTraits: chosen.map(([, en]) => en),
  };
}

export function portraitPrompt(profile: SoulmateProfile, style: PortraitStyle) {
  const person = `a Vietnamese ${profile.target === "Nam" ? "man" : "woman"} around ${profile.age} years old`;
  // promptTraits: [mặt, mắt, tóc, nụ cười, chi tiết, trang phục] — trang phục tách riêng để chỉ phác vài nét
  const outfit = profile.promptTraits[5];
  const look = profile.promptTraits.slice(0, 5).join(", ");
  const safety =
    "Head-and-shoulders portrait, fully clothed, friendly and wholesome, adult. No text, no letters, no signature, no watermark.";
  if (style === "pencil") {
    // Phong cách theo ảnh mẫu public/images/phac-hoa-sample.jpg
    return `Elegant, light-handed graphite pencil sketch on plain white textured paper, in the style of a refined illustrator's study: ${person} with ${look}. Three-quarter view, head tilted slightly upward, soft dreamy gaze into the distance. Attractive, gracefully idealized features rendered with delicate precision on the face only. Hair drawn with loose, sweeping, overlapping strands and wispy flyaway lines. Mostly line work with very light, sparse hatching; shoulders and ${outfit} only suggested with a few faint unfinished outline strokes that dissolve into the paper, no texture or shading on the clothes. At least 40% of the paper left blank white. Monochrome grey graphite, no color, no background. Serene, romantic, airy. ${safety}`;
  }
  return `Natural photographic portrait of ${person} with ${look}, wearing ${outfit}. Soft window light, shallow depth of field, warm tones, candid and kind expression. ${safety}`;
}

// Tiện cho UI: hiển thị tên cung có trong danh sách
export const allSigns = zodiac;
