/**
 * "Bản đồ duyên": mỗi người yêu ra sao theo cung hoàng đạo, con giáp, mệnh, Số chủ đạo
 * và cung mệnh. Viết theo giọng chung của app (lib/interpretation-style.ts): lời thường,
 * nói mặt tốt trước, chỗ khác biệt là đặc điểm chứ không phải thiếu sót.
 */
import type { Element } from "@/lib/bat-tu";
import { numberMeanings } from "@/lib/than-so-hoc";
import type { PersonProfile } from "@/lib/hop-nhau";

export const ZODIAC_LOVE: Record<string, { dates: string; traits: string; love: string }> = {
  "Bạch Dương": { dates: "21/3 – 19/4", traits: "Chủ động · Nhiệt huyết · Thẳng thắn", love: "Thích là nói, không vòng vo. Cần một người theo kịp nhịp nhanh và không giận dai khi lỡ lời." },
  "Kim Ngưu": { dates: "20/4 – 20/5", traits: "Bền bỉ · Điềm tĩnh · Chung thuỷ", love: "Yêu chậm mà chắc, thể hiện bằng bữa ăn ngon và sự có mặt đều đặn. Ghét bị thay đổi kế hoạch phút chót." },
  "Song Tử": { dates: "21/5 – 20/6", traits: "Linh hoạt · Tò mò · Hoạt ngôn", love: "Rung động vì một cuộc nói chuyện hay. Cần người chịu nghe mình kể đủ chuyện trên đời và không bắt mình đứng yên." },
  "Cự Giải": { dates: "21/6 – 22/7", traits: "Tinh tế · Quan tâm · Sâu sắc", love: "Chăm người mình thương rất kỹ, nhớ cả chi tiết nhỏ. Cần cảm giác an toàn và được hỏi han lúc buồn." },
  "Sư Tử": { dates: "23/7 – 22/8", traits: "Ấm áp · Hào phóng · Tự tin", love: "Yêu rực rỡ, thích làm người kia vui. Cần được khen thật lòng và được tự hào về người mình yêu." },
  "Xử Nữ": { dates: "23/8 – 22/9", traits: "Tỉ mỉ · Thực tế · Chu đáo", love: "Thể hiện tình cảm bằng việc làm cụ thể: nhắc uống thuốc, sắp sẵn đồ. Cần người trân trọng những điều nhỏ ấy." },
  "Thiên Bình": { dates: "23/9 – 22/10", traits: "Hài hoà · Duyên dáng · Công bằng", love: "Lãng mạn, thích những buổi hẹn có không khí. Cần người cùng nói chuyện nhẹ nhàng thay vì to tiếng." },
  "Bọ Cạp": { dates: "23/10 – 21/11", traits: "Sâu sắc · Kiên định · Trực giác", love: "Yêu hết lòng và rất trung thành. Cần sự thật thà tuyệt đối — một lần giấu giếm là khó lấy lại niềm tin." },
  "Nhân Mã": { dates: "22/11 – 21/12", traits: "Cởi mở · Lạc quan · Phiêu lưu", love: "Muốn người yêu cũng là bạn đồng hành, cùng đi, cùng thử cái mới. Cần không gian tự do để thấy thoải mái." },
  "Ma Kết": { dates: "22/12 – 19/1", traits: "Ổn định · Kiên trì · Có trách nhiệm", love: "Ít nói lời ngọt nhưng nghĩ chuyện lâu dài rất nghiêm túc. Cần thời gian để mở lòng, và mở rồi thì rất đáng tin." },
  "Bảo Bình": { dates: "20/1 – 18/2", traits: "Độc lập · Sáng tạo · Khác biệt", love: "Bắt đầu từ tình bạn, thích người có suy nghĩ riêng. Cần được là chính mình, không bị ràng buộc quá chặt." },
  "Song Ngư": { dates: "19/2 – 20/3", traits: "Nhạy cảm · Mộng mơ · Đồng cảm", love: "Yêu bằng cả trái tim, dễ cảm nhận người kia đang buồn. Cần người dịu dàng và giúp mình đứng vững trên mặt đất." },
};

export const CON_GIAP_LOVE: Record<string, string> = {
  "Tý": "Nhanh nhạy, khéo vun vén. Trong tình cảm hay lo xa và chu toàn cho cả hai.",
  "Sửu": "Chậm rãi, thật thà. Đã thương thì bền, không thích những mối quan hệ chóng vánh.",
  "Dần": "Mạnh mẽ, che chở. Yêu là muốn bảo vệ, nhưng cũng cần được tôn trọng cái tôi.",
  "Mão": "Nhẹ nhàng, tinh tế. Thích sự yên bình, ngại xung đột, hợp người biết lắng nghe.",
  "Thìn": "Tự tin, nhiều hoài bão. Cần một người cùng mơ lớn và đủ vững để đứng cạnh.",
  "Tỵ": "Sâu sắc, kín đáo. Quan sát rất lâu trước khi mở lòng, mở rồi thì gắn bó.",
  "Ngọ": "Phóng khoáng, nhiệt tình. Yêu nhanh và vui, cần người không giữ mình quá chặt.",
  "Mùi": "Hiền hoà, giàu cảm xúc. Thể hiện tình cảm qua chăm sóc, cần được dỗ dành lúc buồn.",
  "Thân": "Lanh lợi, vui tính. Làm người kia cười là sở trường, cần người theo kịp sự lém lỉnh.",
  "Dậu": "Chỉn chu, thẳng tính. Thích rõ ràng trong tình cảm, nói được làm được.",
  "Tuất": "Trung thành, chính trực. Là chỗ dựa đáng tin, nhưng cần được tin lại trọn vẹn.",
  "Hợi": "Chân thành, hào phóng. Yêu không tính toán, hợp người biết trân trọng sự tốt bụng.",
};

export const ELEMENT_LOVE: Record<Element, string> = {
  "Kim": "Mệnh Kim: rõ ràng, có nguyên tắc. Yêu nghiêm túc và giữ lời hứa.",
  "Mộc": "Mệnh Mộc: ấm áp, bao dung. Thích cùng nhau lớn lên từng chút.",
  "Thủy": "Mệnh Thủy: mềm mại, linh hoạt. Hiểu cảm xúc người khác rất nhanh.",
  "Hỏa": "Mệnh Hỏa: nồng nhiệt, thẳng thắn. Yêu hết mình, vui buồn đều rõ.",
  "Thổ": "Mệnh Thổ: vững vàng, chịu đựng giỏi. Là chỗ dựa yên ổn cho người kia.",
};

const LIFE_LOVE: Record<number, string> = {
  1: "Thích chủ động, cần người tôn trọng sự độc lập của mình.",
  2: "Là người tinh ý và dịu dàng, rất cần được đáp lại sự quan tâm.",
  3: "Vui vẻ, nói chuyện có duyên, cần người cùng cười và cùng chơi.",
  4: "Chung thuỷ và có kế hoạch, cần một mối quan hệ rõ ràng, ổn định.",
  5: "Thích mới mẻ, cần người cùng khám phá và không gò bó.",
  6: "Chăm sóc chu đáo như người nhà, cần được chăm lại.",
  7: "Cần thời gian để tin, thích kết nối sâu hơn là ồn ào.",
  8: "Đáng tin và lo xa, cần người cùng xây dựng tương lai.",
  9: "Bao dung và rộng lòng, cần người hiểu mình hay nghĩ cho người khác.",
  11: "Nhạy cảm, cảm nhận được nhiều điều chưa nói ra.",
  22: "Nghiêm túc và vững vàng, muốn cùng nhau làm được điều lớn.",
  33: "Cho đi rất nhiều, cần nhớ để người kia chăm lại mình.",
};

const CUNG_MENH_NOTE: Record<string, string> = {
  "Khảm": "thuộc Thủy, Đông tứ mệnh",
  "Ly": "thuộc Hỏa, Đông tứ mệnh",
  "Chấn": "thuộc Mộc, Đông tứ mệnh",
  "Tốn": "thuộc Mộc, Đông tứ mệnh",
  "Càn": "thuộc Kim, Tây tứ mệnh",
  "Đoài": "thuộc Kim, Tây tứ mệnh",
  "Cấn": "thuộc Thổ, Tây tứ mệnh",
  "Khôn": "thuộc Thổ, Tây tứ mệnh",
};

// \uFE0E ép hiện dạng chữ (đổi màu theo thẻ) thay vì emoji ô tím của hệ điều hành
const ZODIAC_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"].map((g) => `${g}\uFE0E`);
const CON_GIAP_EMOJI: Record<string, string> = {
  "Tý": "🐭", "Sửu": "🐮", "Dần": "🐯", "Mão": "🐱", "Thìn": "🐲", "Tỵ": "🐍",
  "Ngọ": "🐴", "Mùi": "🐐", "Thân": "🐵", "Dậu": "🐔", "Tuất": "🐶", "Hợi": "🐷",
};
const ELEMENT_GLYPH: Record<Element, string> = { "Kim": "金", "Mộc": "木", "Thủy": "水", "Hỏa": "火", "Thổ": "土" };

/** Màu nền / chữ cho từng thẻ — mỗi hệ một sắc để nhìn là phân biệt được. */
const ELEMENT_TONE: Record<Element, Tone> = {
  "Kim": { bg: "linear-gradient(145deg,#fdf6e3,#f3e3b8)", fg: "#8a6512" },
  "Mộc": { bg: "linear-gradient(145deg,#eef8ee,#cfe9d2)", fg: "#2f6b3c" },
  "Thủy": { bg: "linear-gradient(145deg,#eaf3fc,#c9def5)", fg: "#2c5a91" },
  "Hỏa": { bg: "linear-gradient(145deg,#fdeeea,#f7cfc3)", fg: "#a8432c" },
  "Thổ": { bg: "linear-gradient(145deg,#f8f0e6,#e9d4b9)", fg: "#7d5528" },
};
const ZODIAC_TONE: Record<string, Tone> = {
  "Lửa": { bg: "linear-gradient(145deg,#fff0ea,#fbd3c2)", fg: "#b2462a" },
  "Đất": { bg: "linear-gradient(145deg,#f6f1e7,#e3d3b6)", fg: "#6f5326" },
  "Khí": { bg: "linear-gradient(145deg,#eef6fd,#cfe3f7)", fg: "#2f6aa3" },
  "Nước": { bg: "linear-gradient(145deg,#eef0fd,#cdd3f6)", fg: "#3b4aa0" },
};
export type Tone = { bg: string; fg: string };

export type TraitCard = {
  key: string;
  label: string;
  /** Biểu tượng lớn trên thẻ: ký hiệu cung, con số, con vật, chữ Hán của hành. */
  glyph: string;
  value: string;
  tone: Tone;
  /** Vài từ khoá ngắn hiện dạng chip. */
  tags: string[];
  /** Một câu: người này yêu ra sao. */
  love: string;
  /** Ảnh nền thay cho dải màu (đang dùng cho thẻ cung hoàng đạo). */
  image?: string;
};

/** Các thẻ "bản đồ duyên" của một người. */
export function traitCards(p: PersonProfile): TraitCard[] {
  const z = ZODIAC_LOVE[p.zodiac];
  const num = numberMeanings[p.lifePath];
  const cards: TraitCard[] = [
    {
      key: "cung",
      label: "Cung hoàng đạo",
      glyph: ZODIAC_GLYPH[p.zodiacIndex],
      value: p.zodiac,
      tone: ZODIAC_TONE[p.zodiacElement],
      tags: z.traits.split(" · "),
      love: z.love,
      image: "/images/duyen/zodiac-card.webp",
    },
    {
      key: "so",
      label: "Số chủ đạo",
      glyph: String(p.lifePath),
      value: num ? num.title.replace(/ \(số bậc thầy\)/, "") : `Số ${p.lifePath}`,
      tone: { bg: "linear-gradient(145deg,#f5eefd,#dccaf3)", fg: "#5b3a86" },
      tags: p.lifePath > 9 ? ["Số bậc thầy"] : [],
      love: LIFE_LOVE[p.lifePath] ?? "",
      image: "/images/duyen/number-card.webp",
    },
    {
      key: "tuoi",
      label: "Con giáp",
      glyph: CON_GIAP_EMOJI[p.conGiap],
      value: `Tuổi ${p.conGiap}`,
      tone: { bg: "linear-gradient(145deg,#fdf0f5,#f6d1e1)", fg: "#9c3b66" },
      tags: [p.canChi],
      love: CON_GIAP_LOVE[p.conGiap],
      image: "/images/duyen/con-giap-card.webp",
    },
    {
      key: "menh",
      label: "Ngũ hành",
      glyph: ELEMENT_GLYPH[p.element],
      value: `Mệnh ${p.element}`,
      tone: ELEMENT_TONE[p.element],
      tags: p.cungMenh ? [`Cung ${p.cungMenh}`, CUNG_MENH_NOTE[p.cungMenh].split(", ")[1]] : [],
      love: ELEMENT_LOVE[p.element].replace(/^Mệnh [^:]+: /, ""),
      image: "/images/duyen/zodiac-card.webp",
    },
  ];
  return cards;
}
