/**
 * Xem chỉ tay từ ảnh lòng bàn tay.
 *
 * Đây là feature DUY NHẤT trong app không có engine tính toán — không có gì để
 * tính từ một tấm ảnh. Vì vậy phần "tại chỗ" ở đây là KIỂM SOÁT CHẤT LƯỢNG:
 * kiểm ảnh trước khi gửi, và kiểm câu trả lời của AI sau khi nhận.
 *
 * Rủi ro lớn nhất của hướng này là AI nhìn ảnh mờ rồi MÔ TẢ ĐẠI một đường chỉ
 * tay nó không hề thấy. Nên model buộc phải khai `visibility` cho từng đường;
 * đường nào khai "không thấy" thì phần mô tả và diễn giải bị gỡ bỏ ở server,
 * không để lọt ra giao diện.
 */

export const palmLines = ["Sinh Đạo", "Trí Đạo", "Tâm Đạo", "Vận Mệnh"] as const;
export type PalmLine = (typeof palmLines)[number];

export const palmLineGuide: Record<PalmLine, { where: string; about: string }> = {
  "Sinh Đạo": {
    where: "Vòng cung bao quanh gò ngón cái, bắt đầu giữa ngón cái và ngón trỏ.",
    about: "Thường được đọc về sức sống và nhịp sống, KHÔNG phải độ dài cuộc đời.",
  },
  "Trí Đạo": {
    where: "Đường chạy ngang giữa lòng bàn tay, bên dưới Tâm Đạo.",
    about: "Cách bạn suy nghĩ và ra quyết định: nhanh gọn hay cân nhắc kỹ.",
  },
  "Tâm Đạo": {
    where: "Đường ngang nằm trên cùng, gần gốc các ngón tay.",
    about: "Cách bạn biểu đạt tình cảm và kết nối với người khác.",
  },
  "Vận Mệnh": {
    where: "Đường dọc chạy từ cổ tay lên giữa lòng bàn tay. Nhiều người không có đường này.",
    about: "Cảm nhận về hướng đi và công việc. Không có đường này là hoàn toàn bình thường.",
  },
};

export const visibilities = ["rõ", "mờ", "không thấy"] as const;
export type Visibility = (typeof visibilities)[number];

export const hands = ["Tay trái", "Tay phải"] as const;
export type Hand = (typeof hands)[number];
export const handRoles = ["Tay thuận", "Tay không thuận"] as const;
export type HandRole = (typeof handRoles)[number];

export const handRoleMeaning: Record<HandRole, string> = {
  "Tay thuận": "Thường được đọc về hiện tại và những gì bạn đang chủ động tạo ra.",
  "Tay không thuận": "Thường được đọc về khuynh hướng sẵn có, chưa hẳn là điều bạn đang sống.",
};

export type PalmReading = {
  name: PalmLine;
  visibility: Visibility;
  observation: string;
  meaning: string;
};

export type HandReading = {
  hand: Hand;
  role: HandRole;
  usable: boolean;
  /** Lý do ảnh tay này không đọc được. */
  issue?: string;
  lines: PalmReading[];
};

export type ChiTayResult = {
  /** Đọc được ít nhất một tay. */
  usable: boolean;
  issue?: string;
  dominant: Hand;
  hands: HandReading[];
  /** So sánh hai tay — phần chỉ có khi chụp đủ hai bên. */
  comparison: string;
  summary: string;
  notes: string[];
};

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Kiểm ảnh đã mã hoá base64 trước khi gửi đi. Chỉ chấp nhận JPEG/PNG/WebP để
 * không đẩy định dạng lạ sang provider.
 */
export function checkImage(dataUrl: string): { ok: true; mime: string } | { ok: false; error: string } {
  const match = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return { ok: false, error: "Ảnh không hợp lệ. Hãy chọn tệp JPEG, PNG hoặc WebP." };
  const bytes = Math.floor((match[3].length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES)
    return { ok: false, error: "Ảnh quá lớn. Hãy chụp lại hoặc chọn ảnh nhỏ hơn 4MB." };
  if (bytes < 4096)
    return { ok: false, error: "Ảnh quá nhỏ để nhìn rõ đường chỉ tay." };
  return { ok: true, mime: match[1] };
}

/**
 * Gỡ phần mô tả của những đường mà model khai là KHÔNG THẤY, và quyết định
 * ảnh có dùng được hay không. Đây là chốt chặn chính chống bịa dữ kiện.
 */
export function sanitizeReading(
  lines: PalmReading[],
): { lines: PalmReading[]; visibleCount: number; notes: string[] } {
  const notes: string[] = [];
  const cleaned = lines.map((line) =>
    line.visibility === "không thấy"
      ? { ...line, observation: "Không nhìn rõ đường này trong ảnh.", meaning: "" }
      : line,
  );
  const hidden = cleaned.filter((l) => l.visibility === "không thấy").map((l) => l.name);
  if (hidden.length) notes.push(`Không nhìn rõ trong ảnh: ${hidden.join(", ")}.`);
  const blurry = cleaned.filter((l) => l.visibility === "mờ").map((l) => l.name);
  if (blurry.length) notes.push(`Chỉ thấy mờ: ${blurry.join(", ")} — phần đọc về các đường này chỉ nên tham khảo.`);
  return {
    lines: cleaned,
    visibleCount: cleaned.filter((l) => l.visibility !== "không thấy").length,
    notes,
  };
}

export const photoTips = [
  "Chụp lòng bàn tay, không phải mu bàn tay.",
  "Chụp đủ cả hai tay — tay thuận và tay không thuận nói hai chuyện khác nhau.",
  "Duỗi phẳng các ngón, đừng khum tay lại.",
  "Lấy ánh sáng tự nhiên, tránh đèn flash làm bóng loá.",
  "Để bàn tay chiếm gần hết khung hình và lấy nét vào các đường chỉ.",
];
