import { lenormandFallback } from "@/lib/lenormand";

export type Method = "tarot" | "daily" | "personality";
export type ReadingType = Method | "lenormand";
export type Report = {
  id: string;
  type: ReadingType;
  title: string;
  subtitle: string;
  summary: string;
  sections: { title: string; text: string }[];
  reflection: string;
  source: "fallback" | "ai";
  date: string;
  cards?: number[];
  reversed?: boolean[];
  scores?: number[];
  context?: string;
  deepQuestions?: string[];
  followUpQuestions?: string[];
  previousReading?: { question: string; summary: string; sections: {title: string; text: string}[]; cards: number[]; reversed: boolean[] };
};
export const intents = [
  "Hôm nay của tôi",
  "Tình yêu & Mối quan hệ",
  "Công việc & Sự nghiệp",
  "Khám phá bản thân",
  "Tương lai & Định hướng",
];
export function recommend(intent: string): Method {
  return intent === intents[3]
    ? "personality"
    : intent === intents[1] || intent === intents[2]
      ? "tarot"
      : "daily";
}
export const methods: {
  id: Method;
  title: string;
  description: string;
  duration: string;
  tag: string;
}[] = [
  {
    id: "tarot",
    title: "Lắng nghe những lá bài",
    description: "Một góc nhìn mới cho điều đang ở trong tâm trí bạn.",
    duration: "3–5 phút",
    tag: "TAROT",
  },
  {
    id: "daily",
    title: "Nhịp điệu ngày hôm nay",
    description: "Chậm lại một chút, đón nhận năng lượng của riêng bạn.",
    duration: "2 phút",
    tag: "CHIÊM TINH",
  },
  {
    id: "personality",
    title: "Gặp một phiên bản của bạn",
    description: "Hiểu những điều làm nên một bạn rất riêng.",
    duration: "5 phút",
    tag: "KHÁM PHÁ TÍNH CÁCH",
  },
];
const names = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];
const vietnamese = [
  "Kẻ Khờ",
  "Pháp Sư",
  "Nữ Tư Tế",
  "Hoàng Hậu",
  "Hoàng Đế",
  "Giáo Hoàng",
  "Tình Nhân",
  "Cỗ Xe",
  "Sức Mạnh",
  "Ẩn Sĩ",
  "Bánh Xe Số Phận",
  "Công Lý",
  "Người Treo Ngược",
  "Cái Chết",
  "Tiết Độ",
  "Ác Quỷ",
  "Tòa Tháp",
  "Ngôi Sao",
  "Mặt Trăng",
  "Mặt Trời",
  "Phán Xét",
  "Thế Giới",
];
const meanings = [
  "cởi mở với một bước khởi đầu và cho phép mình học từ trải nghiệm",
  "nhận ra các nguồn lực đã có trong tay để bắt đầu hành động",
  "lắng nghe trực giác nhưng vẫn kiểm chứng những điều chưa rõ",
  "chăm sóc điều quan trọng với sự dịu dàng và kiên nhẫn",
  "xây dựng ranh giới và một nền tảng vững vàng",
  "xem lại những giá trị và lời khuyên bạn đang tin tưởng",
  "tìm sự đồng điệu trong giá trị và cách giao tiếp",
  "chọn hướng đi rõ ràng và tiến từng bước nhỏ",
  "tiếp cận khó khăn với lòng kiên nhẫn thay vì ép buộc",
  "dành không gian riêng để hiểu rõ nhu cầu của mình",
  "đón nhận thay đổi và nhận biết điều bạn có thể chủ động",
  "cân nhắc sự công bằng cùng trách nhiệm trong mỗi lựa chọn",
  "thử nhìn vấn đề từ một vị trí khác trước khi hành động",
  "cho phép một thói quen cũ kết thúc để tạo không gian mới",
  "điều chỉnh nhịp sống và dung hòa các nhu cầu khác nhau",
  "nhận diện những thói quen hoặc kỳ vọng đang giới hạn mình",
  "xem lại một nền tảng không còn phù hợp, từng bước và an toàn",
  "nuôi dưỡng hy vọng bằng những việc nhỏ có thể thực hiện",
  "đón nhận cảm xúc, đồng thời phân biệt lo lắng với dữ kiện",
  "ghi nhận niềm vui và điều đang giúp bạn cảm thấy sống động",
  "suy ngẫm điều đã học và lựa chọn phù hợp hơn với bản thân",
  "ghi nhận hành trình và dành thời gian cảm nhận sự đủ đầy",
];
export const cards = names.map((name, id) => ({
  id,
  name,
  vi: vietnamese[id],
  meaning: meanings[id],
  reversedMeaning: [
    "cân nhắc sự chuẩn bị để tránh hành động chỉ vì bốc đồng",
    "nhận diện nguồn lực chưa được dùng đúng chỗ",
    "dành không gian nghe mình thay vì chỉ tìm câu trả lời bên ngoài",
    "xem lại sự cho đi quá mức và nhu cầu được chăm sóc",
    "điều chỉnh kiểm soát để giữ ranh giới linh hoạt",
    "phân biệt giá trị của mình với khuôn mẫu được tiếp nhận",
    "làm rõ giá trị khác biệt và điều cần đối thoại",
    "điều chỉnh hướng đi thay vì chỉ tăng tốc",
    "thay tự phê bình bằng sự kiên nhẫn với bản thân",
    "phân biệt khoảng lặng cần thiết với việc tự cô lập",
    "tập trung vào phần có thể chủ động khi thấy mất nhịp",
    "xem lại trách nhiệm và những thiên kiến của mình",
    "nhận diện sự trì hoãn không còn tạo thêm góc nhìn",
    "cho phép mình thích nghi khi việc buông bỏ còn khó",
    "nhận diện điều khiến nhịp sống mất cân bằng",
    "từng bước nới lỏng một thói quen hoặc sự ràng buộc",
    "chăm sóc cảm giác an toàn khi nền tảng đang thay đổi",
    "tìm lại hy vọng qua một việc nhỏ có thể làm",
    "kiểm chứng điều chưa rõ khi lo lắng đang lớn hơn dữ kiện",
    "cho mình thời gian đón nhận niềm vui thay vì ép phải tích cực",
    "nhẹ nhàng xem lại sự tự phán xét đang cản bước",
    "ghi nhận điều đã hoàn thành dù hành trình vẫn còn dang dở",
  ][id],
  arcana: "major" as "major" | "minor",
  suit: "Ẩn chính",
  theme: "Chủ đề lớn & hành trình",
  image: [
    "/images/tarot/RWS_Tarot_00_Fool.jpg",
    "/images/tarot/RWS_Tarot_01_Magician.jpg",
    "/images/tarot/RWS_Tarot_02_High_Priestess.jpg",
    "/images/tarot/RWS_Tarot_03_Empress.jpg",
    "/images/tarot/RWS_Tarot_04_Emperor.jpg",
    "/images/tarot/RWS_Tarot_05_Hierophant.jpg",
    "/images/tarot/RWS_Tarot_06_Lovers.jpg",
    "/images/tarot/RWS_Tarot_07_Chariot.jpg",
    "/images/tarot/RWS_Tarot_08_Strength.jpg",
    "/images/tarot/RWS_Tarot_09_Hermit.jpg",
    "/images/tarot/RWS_Tarot_10_Wheel_of_Fortune.jpg",
    "/images/tarot/RWS_Tarot_11_Justice.jpg",
    "/images/tarot/RWS_Tarot_12_Hanged_Man.jpg",
    "/images/tarot/RWS_Tarot_13_Death.jpg",
    "/images/tarot/RWS_Tarot_14_Temperance.jpg",
    "/images/tarot/RWS_Tarot_15_Devil.jpg",
    "/images/tarot/RWS_Tarot_16_Tower.jpg",
    "/images/tarot/RWS_Tarot_17_Star.jpg",
    "/images/tarot/RWS_Tarot_18_Moon.jpg",
    "/images/tarot/RWS_Tarot_19_Sun.jpg",
    "/images/tarot/RWS_Tarot_20_Judgement.jpg",
    "/images/tarot/RWS_Tarot_21_World.jpg",
  ][id],
}));
cards.push(
  ...[
    {
      id: 22,
      name: "Ace of Cups",
      vi: "Át Cốc",
      meaning: "đón nhận một khởi đầu cảm xúc và lòng trắc ẩn",
      reversedMeaning: "chăm sóc cảm xúc bên trong trước khi trao đi",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups01.jpg",
    },
    {
      id: 23,
      name: "Two of Cups",
      vi: "Hai Cốc",
      meaning: "nuôi dưỡng sự tương hỗ và giao tiếp chân thành",
      reversedMeaning: "nhận diện sự lệch nhịp và điều hai bên cần nói rõ",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups02.jpg",
    },
    {
      id: 24,
      name: "Three of Cups",
      vi: "Ba Cốc",
      meaning: "trân trọng tình bạn, sự nâng đỡ và niềm vui sẻ chia",
      reversedMeaning: "xem lại nhu cầu thuộc về và ranh giới trong nhóm",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups03.jpg",
    },
    {
      id: 25,
      name: "Four of Cups",
      vi: "Bốn Cốc",
      meaning: "nhìn lại điều mình đang bỏ qua khi thiếu hứng thú",
      reversedMeaning: "cởi mở trở lại với một cơ hội nhỏ thay vì khép mình",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups04.jpg",
    },
    {
      id: 26,
      name: "Five of Cups",
      vi: "Năm Cốc",
      meaning: "cho phép mình buồn, đồng thời nhận ra điều vẫn còn",
      reversedMeaning: "đi từng bước để tiếp nhận mất mát và sự hỗ trợ",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups05.jpg",
    },
    {
      id: 27,
      name: "Six of Cups",
      vi: "Sáu Cốc",
      meaning: "trân trọng kỷ niệm, lòng tốt và những kết nối quen thuộc",
      reversedMeaning:
        "phân biệt sự ấm áp của quá khứ với việc mắc kẹt trong đó",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups06.jpg",
    },
    {
      id: 28,
      name: "Seven of Cups",
      vi: "Bảy Cốc",
      meaning: "làm rõ điều mình thực sự muốn giữa nhiều lựa chọn",
      reversedMeaning: "thu hẹp lựa chọn bằng dữ kiện và ưu tiên thực tế",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups07.jpg",
    },
    {
      id: 29,
      name: "Eight of Cups",
      vi: "Tám Cốc",
      meaning: "cân nhắc rời một điều không còn nuôi dưỡng mình",
      reversedMeaning: "hiểu điều khiến mình chần chừ trước một sự thay đổi",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups08.jpg",
    },
    {
      id: 30,
      name: "Nine of Cups",
      vi: "Chín Cốc",
      meaning: "ghi nhận niềm vui và sự đủ đầy bên trong",
      reversedMeaning: "phân biệt mong muốn bên ngoài với nhu cầu thật sự",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups09.jpg",
    },
    {
      id: 31,
      name: "Ten of Cups",
      vi: "Mười Cốc",
      meaning: "nuôi dưỡng cảm giác thuộc về và giá trị chung",
      reversedMeaning: "điều chỉnh kỳ vọng về một mối quan hệ hoàn hảo",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups10.jpg",
    },
    {
      id: 32,
      name: "Page of Cups",
      vi: "Tiểu đồng Cốc",
      meaning: "lắng nghe cảm xúc mới và sự tò mò dịu dàng",
      reversedMeaning: "gọi tên cảm xúc trước khi phản ứng theo cảm tính",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups11.jpg",
    },
    {
      id: 33,
      name: "Knight of Cups",
      vi: "Kỵ sĩ Cốc",
      meaning: "bày tỏ thiện chí bằng hành động phù hợp với thực tế",
      reversedMeaning: "cân bằng lý tưởng lãng mạn với sự nhất quán",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups12.jpg",
    },
    {
      id: 34,
      name: "Queen of Cups",
      vi: "Hoàng hậu Cốc",
      meaning: "đồng cảm và lắng nghe trực giác cùng ranh giới lành mạnh",
      reversedMeaning:
        "chăm sóc mình để tránh hấp thụ quá nhiều cảm xúc của người khác",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups13.jpg",
    },
    {
      id: 35,
      name: "King of Cups",
      vi: "Vua Cốc",
      meaning: "đón nhận cảm xúc mà vẫn giữ bình tĩnh khi lựa chọn",
      reversedMeaning:
        "nhận diện cảm xúc bị dồn nén và tìm cách bày tỏ an toàn",
      arcana: "minor" as const,
      suit: "Cốc",
      theme: "Cảm xúc & kết nối",
      image: "/images/tarot/Cups14.jpg",
    },
    {
      id: 36,
      name: "Ace of Pentacles",
      vi: "Át Tiền",
      meaning: "nuôi dưỡng một cơ hội thực tế bằng bước đi nhỏ",
      reversedMeaning: "kiểm tra sự chuẩn bị trước khi cam kết nguồn lực",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents01.jpg",
    },
    {
      id: 37,
      name: "Two of Pentacles",
      vi: "Hai Tiền",
      meaning: "sắp xếp ưu tiên và linh hoạt giữa các trách nhiệm",
      reversedMeaning: "giảm việc ôm đồm để lấy lại nhịp cân bằng",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents02.jpg",
    },
    {
      id: 38,
      name: "Three of Pentacles",
      vi: "Ba Tiền",
      meaning: "phối hợp và ghi nhận kỹ năng của từng người",
      reversedMeaning: "làm rõ vai trò, kỳ vọng và cách phản hồi khi hợp tác",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents03.jpg",
    },
    {
      id: 39,
      name: "Four of Pentacles",
      vi: "Bốn Tiền",
      meaning: "giữ gìn nền tảng nhưng tránh níu giữ vì sợ thiếu",
      reversedMeaning: "phân biệt sự an toàn với kiểm soát quá mức",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents04.jpg",
    },
    {
      id: 40,
      name: "Five of Pentacles",
      vi: "Năm Tiền",
      meaning: "thừa nhận khó khăn và chủ động tìm sự hỗ trợ",
      reversedMeaning: "nhận ra những nguồn hỗ trợ và bước phục hồi nhỏ",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents05.jpg",
    },
    {
      id: 41,
      name: "Six of Pentacles",
      vi: "Sáu Tiền",
      meaning: "cân bằng cho và nhận với sự tôn trọng",
      reversedMeaning:
        "xem lại điều kiện hoặc sự lệch quyền lực trong việc hỗ trợ",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents06.jpg",
    },
    {
      id: 42,
      name: "Seven of Pentacles",
      vi: "Bảy Tiền",
      meaning: "kiên nhẫn đánh giá điều đã đầu tư công sức",
      reversedMeaning: "xem lại hướng đi khi nỗ lực chưa đem lại điều mong đợi",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents07.jpg",
    },
    {
      id: 43,
      name: "Eight of Pentacles",
      vi: "Tám Tiền",
      meaning: "rèn kỹ năng và tiến bộ qua thực hành đều đặn",
      reversedMeaning: "điều chỉnh sự cầu toàn hoặc nhịp làm việc quá sức",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents08.jpg",
    },
    {
      id: 44,
      name: "Nine of Pentacles",
      vi: "Chín Tiền",
      meaning: "trân trọng sự tự chủ và thành quả từ nỗ lực cá nhân",
      reversedMeaning: "xem lại cách thành tích đang chi phối cảm giác đủ đầy",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents09.jpg",
    },
    {
      id: 45,
      name: "Ten of Pentacles",
      vi: "Mười Tiền",
      meaning: "chăm sóc nền tảng lâu dài và những giá trị được truyền lại",
      reversedMeaning:
        "đối thoại về kỳ vọng và giá trị khác nhau trong gia đình",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents10.jpg",
    },
    {
      id: 46,
      name: "Page of Pentacles",
      vi: "Tiểu đồng Tiền",
      meaning: "học một kỹ năng thực tế và biến ý tưởng thành kế hoạch",
      reversedMeaning: "chọn việc nhỏ có thể bắt đầu thay vì chỉ lập kế hoạch",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents11.jpg",
    },
    {
      id: 47,
      name: "Knight of Pentacles",
      vi: "Kỵ sĩ Tiền",
      meaning: "tiến bước bền bỉ và giữ lời với những cam kết phù hợp",
      reversedMeaning:
        "thử thay đổi một thói quen khi sự ổn định thành trì trệ",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents12.jpg",
    },
    {
      id: 48,
      name: "Queen of Pentacles",
      vi: "Hoàng hậu Tiền",
      meaning: "chăm sóc đời sống và nguồn lực một cách thiết thực",
      reversedMeaning: "cân bằng việc chăm người khác với nhu cầu của mình",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents13.jpg",
    },
    {
      id: 49,
      name: "King of Pentacles",
      vi: "Vua Tiền",
      meaning: "sử dụng kinh nghiệm và nguồn lực có trách nhiệm",
      reversedMeaning:
        "xem lại sự cứng nhắc hoặc việc gắn giá trị bản thân với vật chất",
      arcana: "minor" as const,
      suit: "Tiền",
      theme: "Nguồn lực & đời sống",
      image: "/images/tarot/Pents14.jpg",
    },
    {
      id: 50,
      name: "Ace of Swords",
      vi: "Át Kiếm",
      meaning: "tìm sự sáng rõ và nói điều cần nói một cách tử tế",
      reversedMeaning:
        "kiểm chứng thông tin khi suy nghĩ còn rối hoặc vội kết luận",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords01.jpg",
    },
    {
      id: 51,
      name: "Two of Swords",
      vi: "Hai Kiếm",
      meaning: "nhận diện một lựa chọn khó và tìm thêm thông tin",
      reversedMeaning:
        "đối diện việc né tránh hoặc quá tải trước nhiều luồng ý kiến",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords02.jpg",
    },
    {
      id: 52,
      name: "Three of Swords",
      vi: "Ba Kiếm",
      meaning: "thừa nhận tổn thương và cho mình thời gian hồi phục",
      reversedMeaning: "dần buông nỗi đau mà không phủ nhận trải nghiệm",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords03.jpg",
    },
    {
      id: 53,
      name: "Four of Swords",
      vi: "Bốn Kiếm",
      meaning: "nghỉ ngơi và lùi lại để phục hồi sự sáng rõ",
      reversedMeaning: "nhận ra lúc mình cần nghỉ thay vì cố gắng liên tục",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords04.jpg",
    },
    {
      id: 54,
      name: "Five of Swords",
      vi: "Năm Kiếm",
      meaning: "cân nhắc cái giá của việc thắng một cuộc tranh luận",
      reversedMeaning: "tìm cách hóa giải bất đồng mà vẫn giữ ranh giới",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords05.jpg",
    },
    {
      id: 55,
      name: "Six of Swords",
      vi: "Sáu Kiếm",
      meaning: "chấp nhận một quá trình chuyển tiếp về phía nhẹ nhàng hơn",
      reversedMeaning:
        "nhận diện điều còn níu mình lại trong một sự chuyển đổi",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords06.jpg",
    },
    {
      id: 56,
      name: "Seven of Swords",
      vi: "Bảy Kiếm",
      meaning: "xem xét chiến lược, sự minh bạch và điều chưa được nói",
      reversedMeaning:
        "chọn sự thành thật và chịu trách nhiệm với cách hành động",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords07.jpg",
    },
    {
      id: 57,
      name: "Eight of Swords",
      vi: "Tám Kiếm",
      meaning: "xem lại những niềm tin đang khiến mình cảm thấy bị giới hạn",
      reversedMeaning: "nhận ra một quyền lựa chọn nhỏ mình vẫn đang có",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords08.jpg",
    },
    {
      id: 58,
      name: "Nine of Swords",
      vi: "Chín Kiếm",
      meaning: "phân biệt lo lắng với sự việc thực tế và tìm sự nâng đỡ",
      reversedMeaning: "chia sẻ nỗi lo thay vì âm thầm gánh chịu một mình",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords09.jpg",
    },
    {
      id: 59,
      name: "Ten of Swords",
      vi: "Mười Kiếm",
      meaning: "cho phép một giai đoạn mệt mỏi khép lại và ưu tiên hồi phục",
      reversedMeaning:
        "ghi nhận sự phục hồi dần dần, không ép mình phải ổn ngay",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords10.jpg",
    },
    {
      id: 60,
      name: "Page of Swords",
      vi: "Tiểu đồng Kiếm",
      meaning: "đặt câu hỏi và tìm hiểu kỹ trước khi hình thành kết luận",
      reversedMeaning: "tránh suy đoán và chọn cách trao đổi rõ ràng",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords11.jpg",
    },
    {
      id: 61,
      name: "Knight of Swords",
      vi: "Kỵ sĩ Kiếm",
      meaning: "hành động quyết đoán nhưng dành chỗ cho việc lắng nghe",
      reversedMeaning: "chậm lại khi sự vội vàng dễ khiến mình bỏ sót dữ kiện",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords12.jpg",
    },
    {
      id: 62,
      name: "Queen of Swords",
      vi: "Hoàng hậu Kiếm",
      meaning: "giữ sự sáng rõ, độc lập và ranh giới trong giao tiếp",
      reversedMeaning: "cân bằng sự thẳng thắn với lòng cảm thông",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords13.jpg",
    },
    {
      id: 63,
      name: "King of Swords",
      vi: "Vua Kiếm",
      meaning: "lựa chọn dựa trên lý lẽ, sự công bằng và trách nhiệm",
      reversedMeaning:
        "xem lại việc dùng lý lẽ để kiểm soát hoặc gạt cảm xúc sang bên",
      arcana: "minor" as const,
      suit: "Kiếm",
      theme: "Tư duy & sự rõ ràng",
      image: "/images/tarot/Swords14.jpg",
    },
    {
      id: 64,
      name: "Ace of Wands",
      vi: "Át Gậy",
      meaning: "đón nhận một tia cảm hứng và thử hành động nhỏ",
      reversedMeaning: "tìm lại điều tạo động lực trước khi cố bắt đầu",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands01.jpg",
    },
    {
      id: 65,
      name: "Two of Wands",
      vi: "Hai Gậy",
      meaning: "nhìn xa hơn và cân nhắc hướng đi phù hợp",
      reversedMeaning: "làm rõ nỗi sợ đang cản trở một lựa chọn",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands02.jpg",
    },
    {
      id: 66,
      name: "Three of Wands",
      vi: "Ba Gậy",
      meaning: "mở rộng tầm nhìn và chuẩn bị cho bước tiếp theo",
      reversedMeaning: "điều chỉnh kế hoạch khi kỳ vọng chưa khớp thực tế",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands03.jpg",
    },
    {
      id: 67,
      name: "Four of Wands",
      vi: "Bốn Gậy",
      meaning: "ghi nhận một cột mốc và cảm giác được nâng đỡ",
      reversedMeaning: "chăm sóc cảm giác ổn định và những kết nối gần gũi",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands04.jpg",
    },
    {
      id: 68,
      name: "Five of Wands",
      vi: "Năm Gậy",
      meaning: "tiếp nhận khác biệt như cơ hội học cách phối hợp",
      reversedMeaning: "giải quyết xung đột nhỏ thay vì dồn nén hoặc né tránh",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands05.jpg",
    },
    {
      id: 69,
      name: "Six of Wands",
      vi: "Sáu Gậy",
      meaning:
        "ghi nhận tiến bộ và đón nhận sự công nhận một cách khiêm nhường",
      reversedMeaning: "tìm sự công nhận bên trong thay vì chỉ chờ lời khen",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands06.jpg",
    },
    {
      id: 70,
      name: "Seven of Wands",
      vi: "Bảy Gậy",
      meaning: "bảo vệ điều quan trọng với ranh giới rõ ràng",
      reversedMeaning: "chọn điều đáng giữ thay vì chống đỡ mọi yêu cầu",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands07.jpg",
    },
    {
      id: 71,
      name: "Eight of Wands",
      vi: "Tám Gậy",
      meaning: "tận dụng nhịp tiến triển và giao tiếp kịp thời",
      reversedMeaning: "kiên nhẫn làm rõ trở ngại thay vì thúc ép tốc độ",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands08.jpg",
    },
    {
      id: 72,
      name: "Nine of Wands",
      vi: "Chín Gậy",
      meaning: "giữ sự bền bỉ đồng thời cho phép mình nghỉ",
      reversedMeaning: "nhận ra sự cảnh giác quá mức và nhu cầu được hỗ trợ",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Tarot_Nine_of_Wands.jpg",
    },
    {
      id: 73,
      name: "Ten of Wands",
      vi: "Mười Gậy",
      meaning: "xem lại gánh nặng và chia sẻ trách nhiệm",
      reversedMeaning: "đặt xuống điều không thuộc trách nhiệm của riêng mình",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands10.jpg",
    },
    {
      id: 74,
      name: "Page of Wands",
      vi: "Tiểu đồng Gậy",
      meaning: "khám phá ý tưởng mới với sự hào hứng và tinh thần học hỏi",
      reversedMeaning: "thử một bước nhỏ khi cảm hứng thiếu hướng đi",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands11.jpg",
    },
    {
      id: 75,
      name: "Knight of Wands",
      vi: "Kỵ sĩ Gậy",
      meaning: "hành động với nhiệt huyết và một hướng đi đủ rõ",
      reversedMeaning: "chậm lại khi hứng thú nhất thời dễ dẫn tới vội vàng",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands12.jpg",
    },
    {
      id: 76,
      name: "Queen of Wands",
      vi: "Hoàng hậu Gậy",
      meaning: "thể hiện sự tự tin, ấm áp và sáng tạo của mình",
      reversedMeaning:
        "chăm sóc sự tự tin mà không so sánh mình với người khác",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands13.jpg",
    },
    {
      id: 77,
      name: "King of Wands",
      vi: "Vua Gậy",
      meaning: "dẫn dắt bằng tầm nhìn và trao không gian cho người khác",
      reversedMeaning:
        "cân bằng tham vọng với sự kiên nhẫn và khả năng lắng nghe",
      arcana: "minor" as const,
      suit: "Gậy",
      theme: "Động lực & hành động",
      image: "/images/tarot/Wands14.jpg",
    },
  ],
);
export const zodiac = [
  "Bạch Dương",
  "Kim Ngưu",
  "Song Tử",
  "Cự Giải",
  "Sư Tử",
  "Xử Nữ",
  "Thiên Bình",
  "Bọ Cạp",
  "Nhân Mã",
  "Ma Kết",
  "Bảo Bình",
  "Song Ngư",
];
export const zodiacSymbols = [
  "♈︎",
  "♉︎",
  "♊︎",
  "♋︎",
  "♌︎",
  "♍︎",
  "♎︎",
  "♏︎",
  "♐︎",
  "♑︎",
  "♒︎",
  "♓︎",
];
export function zodiacFromDate(value: string) {
  const [, month, day] = value.split("-").map(Number);
  const boundaries = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22];
  const mapped = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  return zodiac[
    (mapped[month - 1] + (day >= boundaries[month - 1] ? 1 : 0)) % 12
  ];
}
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function dateLabel() {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}
export const dimensions = [
  "Cởi mở",
  "Chủ động & kỷ luật",
  "Hướng ngoại",
  "Đồng cảm",
  "Cân bằng cảm xúc",
];
export const questions = [
  "Tôi thích thử một hoạt động mình chưa từng làm.",
  "Tôi thường sắp xếp những việc quan trọng trước khi bắt đầu ngày mới.",
  "Tôi thấy có thêm năng lượng sau khi gặp gỡ mọi người.",
  "Tôi cố gắng hiểu cảm xúc của người khác trước khi phản hồi.",
  "Tôi thường lấy lại sự bình tĩnh sau một việc không như ý.",
  "Tôi hứng thú khi được nghe một góc nhìn khác với mình.",
  "Tôi thường hoàn thành những điều đã cam kết.",
  "Tôi dễ bắt đầu cuộc trò chuyện với một người mới.",
  "Tôi sẵn lòng điều chỉnh kế hoạch để hỗ trợ người khác.",
  "Tôi có thể dừng lại và nhìn sự việc rõ hơn khi căng thẳng.",
  "Tôi thích tìm hiểu những ý tưởng sáng tạo.",
  "Tôi thấy thoải mái khi công việc có một kế hoạch rõ ràng.",
  "Tôi thích các hoạt động có nhiều người tham gia.",
  "Tôi chú ý đến nhu cầu của những người ở bên cạnh.",
  "Tôi thường chấp nhận được sự không chắc chắn trong cuộc sống.",
];
export function scoreAnswers(answers: number[]) {
  return dimensions.map((_, i) =>
    Math.round(
      ((answers[i] + answers[i + 5] + answers[i + 10] - 3) / 12) * 100,
    ),
  );
}
export function drawCards(count: number) {
  const deck = cards.map((c) => c.id);
  for (let i = deck.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1);
    const range = i + 1;
    const limit = Math.floor(0x100000000 / range) * range;
    do {
      crypto.getRandomValues(bytes);
    } while (bytes[0] >= limit);
    const j = bytes[0] % range;
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, count);
}
export function drawOrientations(count: number) {
  const values = new Uint8Array(count);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => (v & 1) === 1);
}
export type InterpretationInput = {
  type: ReadingType;
  topic?: string;
  question?: string;
  deepQuestions?: string[];
  previousReading?: Report["previousReading"];
  cards?: number[];
  reversed?: boolean[];
  sign?: string;
  scores?: number[];
  day?: string;
};
function topicPrompt(topic?: string) {
  return (
    (
      {
        "Tình yêu":
          "Trong kết nối hiện tại, điều gì bạn có thể trao đổi rõ hơn mà vẫn tôn trọng ranh giới của cả hai?",
        "Công việc":
          "Hãy chọn một bước cụ thể trong công việc mà bạn có thể chủ động, dựa trên điều kiện thực tế.",
        "Bản thân":
          "Thử viết lại cảm xúc đang xuất hiện và một nhu cầu bạn muốn chăm sóc.",
        "Cuộc sống":
          "Hãy chọn một thay đổi nhỏ, thực tế và phù hợp với nhịp sống của bạn.",
      } as Record<string, string>
    )[topic || "Cuộc sống"] ||
    "Dành thời gian suy ngẫm và chọn một hành động trong khả năng của bạn."
  );
}
function tarotSummary(input: InterpretationInput) {
  const selected = (input.cards || []).map((id) => cards[id]);
  if (selected.length === 1)
    return `Lá ${selected[0].vi} mở ra góc nhìn về ${selected[0].theme.toLowerCase()}. ${topicPrompt(input.topic)} Đây là gợi ý chiêm nghiệm, không phải kết luận hay dự đoán chắc chắn.`;
  const themes = Array.from(
    new Set(selected.map((c) => c.theme.toLowerCase())),
  ).join("; ");
  return `Trải bài kết nối ${themes}. ${selected[0].vi} soi chiếu quá khứ; ${selected[1].vi} gợi hiện tại; ${selected[2].vi} gợi xu hướng tương lai nếu tiếp tục theo hướng hiện tại, có thể thay đổi theo hành động. Hãy đọc chúng như ba phần của cùng một câu chuyện, thay vì ba dự đoán riêng lẻ. ${topicPrompt(input.topic)}`;
}
const dailyCache = new Map<string, Report>();
export function fallback(input: InterpretationInput): Report {
  const base = {
    id: crypto.randomUUID(),
    type: input.type,
    date: new Date().toISOString(),
    source: "fallback" as const,
  };
  if (input.type === "lenormand") {
    const reading = lenormandFallback(input.topic || "Tổng quan", input.question || "", input.cards || []);
    return { ...base, title: "Câu chuyện từ ba biểu tượng", subtitle: input.topic || "Tổng quan", context: input.question, cards: input.cards, ...reading };
  }
  if (input.type === "tarot")
    return {
      ...base,
      title: "Một góc nhìn dành cho bạn",
      subtitle: input.topic || "Cuộc sống",
      cards: input.cards,
      reversed: input.reversed || input.cards?.map(() => false),
      context: input.question,
      deepQuestions: input.deepQuestions,
      previousReading: input.previousReading,
      followUpQuestions: input.deepQuestions ? undefined : [
        `Tôi cần hiểu rõ điều gì hơn về ${input.topic?.toLowerCase() || "câu chuyện này"}?`,
        "Điều gì đang khiến tôi gặp khó khăn trong tình huống này?",
        "Tôi có thể đang bỏ qua nhu cầu hoặc nguồn lực nào?",
        "Tôi có thể chủ động làm gì để tiến gần điều mình mong muốn?",
        "Trong thời gian tới, tôi cần ưu tiên điều gì và trong bao lâu?",
      ],
      summary: input.deepQuestions ? "Ba lá bài mới đã được rút cho 5 câu hỏi của bạn. AI hiện chưa khả dụng; chưa có phần trả lời cá nhân hóa cho lượt đào sâu này." : tarotSummary(input),
      sections: input.deepQuestions ? input.deepQuestions.map((question) => ({title: question, text: "AI hiện chưa khả dụng để trả lời câu hỏi này theo câu chuyện của bạn. Hãy thử lại sau; các lá bài đã rút được giữ ở trên."})) : (input.cards || []).map((id, i) => ({
        title: `${(input.cards || []).length === 1 ? "Lời nhắn hiện tại" : ["Quá khứ", "Hiện tại", "Tương lai — xu hướng có thể thay đổi"][i]} · ${cards[id].vi}${input.reversed?.[i] ? " · Lá ngược" : ""}`,
        text: `${cards[id].name}${input.reversed?.[i] ? " (ngược)" : ""} gợi nhắc bạn ${input.reversed?.[i] ? cards[id].reversedMeaning : cards[id].meaning}. ${topicPrompt(input.topic)}`,
      })),
      reflection:
        "Nếu bỏ qua kỳ vọng của người khác, bạn thực sự muốn điều gì cho mình?",
    };
  if (input.type === "personality") {
    const scores = input.scores!;
    const strongest = scores.indexOf(Math.max(...scores));
    return {
      ...base,
      title: "Bạn, qua một góc nhìn mới",
      subtitle: "Bản đồ khuynh hướng cá nhân",
      scores,
      summary: `Trong những câu trả lời lần này, ${dimensions[strongest].toLowerCase()} là khuynh hướng nổi bật của bạn. Đây là một lát cắt ở thời điểm hiện tại, không phải nhãn tính cách cố định.`,
      sections: dimensions
        .map((d, i) => ({
          title: d,
          text:
            scores[i] >= 60
              ? "Bạn có xu hướng thể hiện điều này khá thường xuyên. Hãy ghi nhận cách khuynh hướng này giúp bạn trong cuộc sống và khi nào bạn muốn điều chỉnh."
              : "Bạn có thể thể hiện điều này tùy tình huống hoặc có nhu cầu khác ở thời điểm hiện tại. Điểm thấp hơn không có nghĩa là kém hơn.",
        }))
        .concat([
          {
            title: "Giao tiếp & mối quan hệ",
            text: "Thử chia sẻ một nhu cầu cụ thể và hỏi người đối diện điều họ cần. Sự khác biệt là cơ hội hiểu nhau hơn.",
          },
          {
            title: "Phong cách làm việc",
            text: "Quan sát khi nào bạn tập trung tốt nhất: làm một mình hay cùng người khác, có kế hoạch hay có không gian thử nghiệm. Chọn một điều chỉnh nhỏ cho tuần tới.",
          },
        ]),
      reflection:
        "Khuynh hướng nào trong kết quả khiến bạn thấy gần với mình nhất?",
    };
  }
  const key = `${input.sign}:${input.day || today()}`;
  const cached = dailyCache.get(key);
  if (cached) return cached;
  const hash = Array.from(key).reduce(
    (v, c) => (v * 31 + c.charCodeAt(0)) >>> 0,
    0,
  );
  const themes = [
    "Chậm lại để nghe mình rõ hơn",
    "Dành chỗ cho một điều mới",
    "Một bước nhỏ cũng là tiến về phía trước",
    "Kết nối bắt đầu từ sự chân thành",
  ];
  const report: Report = {
    ...base,
    title: themes[hash % 4],
    subtitle: `${input.sign} · ${input.day || today()}`,
    summary:
      "Hôm nay, hãy dành năng lượng cho những điều thực sự quan trọng với bạn. Bạn không cần có mọi câu trả lời ngay bây giờ. Một khoảng lặng có thể giúp bạn nhận ra bước tiếp theo.",
    sections: [
      {
        title: "Tình yêu & kết nối",
        text: [
          "Hỏi thăm một người bạn quý mến. Một cuộc trò chuyện không vội có thể mang lại cảm giác gần gũi.",
          "Thử nói ra một điều bạn trân trọng ở người bên cạnh.",
        ][hash % 2],
      },
      {
        title: "Công việc & định hướng",
        text: "Chọn một việc quan trọng để hoàn thành trước. Cho phép những việc còn lại có thứ tự và thời gian riêng.",
      },
      {
        title: "Năng lượng & cảm xúc",
        text: "Dành mười phút không có màn hình. Đi bộ, uống nước hoặc viết xuống điều đang chiếm nhiều tâm trí.",
      },
      {
        title: "Một chút cảm hứng",
        text: `Màu gợi ý: ${["Tím lavender", "Xanh sage", "Vàng kem", "Hồng đất"][hash % 4]} · Con số vui: ${(hash % 9) + 1}. Chỉ là một chi tiết để làm ngày hôm nay thú vị hơn.`,
      },
    ],
    reflection: "Một điều nhỏ nào có thể khiến hôm nay nhẹ nhàng hơn với bạn?",
  };
  dailyCache.set(key, report);
  if (dailyCache.size > 500) dailyCache.delete(dailyCache.keys().next().value!);
  return report;
}
