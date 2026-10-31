/**
 * Danh sách công cụ, dùng chung cho lưới ở trang chủ và menu "Trải nghiệm" trên
 * header. Giữ một nơi duy nhất để thêm feature mới không phải sửa hai chỗ.
 */
import { Hand, Layers, Leaf, Orbit, UserRound } from "lucide-react";
import {
  AstrologyIcon,
  BatTuEmblemIcon,
  DailyCardImgIcon,
  DreamIcon,
  FaceReadingIcon,
  HumanDesignIcon,
  IChingIcon,
  LenormandCardsIcon,
  MoonSignIcon,
  NumerologyIcon,
  PalmistryIcon,
  PastLifeIcon,
  PlayingCardsIcon,
  TarotCardsIcon,
  XinXamIcon,
  ZodiacWheelIcon,
} from "@/components/tool-icons";

export const toolGroups = [
  {
    title: "Bói bài",
    icon: Layers,
    tools: [
      { title: "Xem Tarot cùng AI", description: "Lắng nghe góc nhìn từ ba lá bài.", icon: TarotCardsIcon, action: "tarot", bare: true },
      { title: "Bói bài Lenormand", description: "Đọc những biểu tượng đời thường.", icon: LenormandCardsIcon, action: "lenormand", bare: true },
      { title: "Bói bài Tây", description: "Một cách khác để soi chiếu câu hỏi.", icon: PlayingCardsIcon, bare: true },
      { title: "Lá bài hôm nay", description: "Một lá bài cho ngày mới.", icon: DailyCardImgIcon, action: "dailycard", bare: true },
    ],
  },
  {
    title: "Lá số & Ngày sinh",
    icon: Orbit,
    tools: [
      { title: "Xem Tử Vi", description: "Lập và luận giải lá số của bạn.", icon: ZodiacWheelIcon, action: "tuvi", bare: true },
      { title: "Bát tự (Tứ trụ)", description: "Tìm hiểu bốn trụ ngày giờ sinh.", icon: BatTuEmblemIcon, action: "bat-tu", bare: true },
      { title: "Thần số học", description: "Khám phá những con số cá nhân.", icon: NumerologyIcon, action: "than-so-hoc", bare: true },
      { title: "Chiêm tinh", description: "Thông điệp theo cung hoàng đạo.", icon: AstrologyIcon, action: "daily", bare: true },
      { title: "Human Design", description: "Tìm hiểu bản đồ năng lượng.", icon: HumanDesignIcon, action: "human-design", bare: true },
    ],
  },
  {
    title: "Soi tướng & Hình ảnh",
    icon: Hand,
    tools: [
      { title: "Xem chỉ tay", description: "Quan sát dấu hiệu trên bàn tay.", icon: PalmistryIcon, action: "chi-tay", bare: true },
      { title: "Nhân tướng học", description: "Tìm hiểu các nét trên khuôn mặt.", icon: FaceReadingIcon, bare: true },
      { title: "Khuôn mặt kiếp trước", description: "Một trải nghiệm khám phá hình ảnh.", icon: PastLifeIcon, clip: true },
      { title: "Giải mã giấc mơ", description: "Ghi lại những biểu tượng trong mơ.", icon: DreamIcon, action: "giac-mo", bare: true },
    ],
  },
  {
    title: "Gieo quẻ & Lễ Việt Nam",
    icon: Leaf,
    tools: [
      { title: "Xin Xăm Quan Âm", description: "Một lời gợi mở để suy ngẫm.", icon: XinXamIcon, action: "xin-xam", bare: true },
      { title: "Xem Kinh Dịch", description: "Khám phá ý nghĩa của các quẻ.", icon: IChingIcon, action: "kinh-dich", bare: true },
      { title: "Cung mặt trăng", description: "Tìm hiểu thế giới cảm xúc.", icon: MoonSignIcon, bare: true },
      { title: "Trắc nghiệm tính cách", description: "Hiểu rõ hơn xu hướng của bạn.", icon: UserRound, action: "personality" },
    ],
  },
] as const;

export type ToolAction = string;

/**
 * Feature nào có URL riêng. Dùng chung cho gợi ý cuối trang kết quả và cho
 * footer — thêm route mới chỉ phải khai ở đây một lần.
 */
export const toolRoutes: Record<string, string> = {
  tarot: "/tarot",
  lenormand: "/lenormand",
  tuvi: "/tu-vi",
  "bat-tu": "/bat-tu",
  "than-so-hoc": "/than-so-hoc",
  daily: "/chiem-tinh",
  "human-design": "/human-design",
  "giac-mo": "/giac-mo",
  "chi-tay": "/chi-tay",
  personality: "/tinh-cach",
  "xin-xam": "/xin-xam",
  "kinh-dich": "/kinh-dich",
};
