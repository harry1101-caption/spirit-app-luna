/**
 * Yêu cầu tư vấn 1-1 với reader — dùng chung cho form (client) và route
 * /api/consultation (server). Giá trị lưu DB viết tiếng Anh, nhãn hiển thị
 * tiếng Việt; khớp với check constraint trong migration consultation_requests.
 */

export const CONSULT_CHANNELS = [
  { value: "zalo", label: "Zalo" },
  { value: "facebook", label: "Facebook" },
  { value: "phone", label: "Gọi điện" },
  { value: "video", label: "Gọi video (Google Meet)" },
] as const;

export const CONSULT_TIMES = [
  { value: "morning", label: "Buổi sáng (8h – 12h)" },
  { value: "afternoon", label: "Buổi chiều (13h – 18h)" },
  { value: "evening", label: "Buổi tối (19h – 22h)" },
  { value: "any", label: "Lúc nào cũng được" },
] as const;

export type ConsultChannel = (typeof CONSULT_CHANNELS)[number]["value"];
export type ConsultTime = (typeof CONSULT_TIMES)[number]["value"];

export const CONSULT_NAME_MAX = 60;
export const CONSULT_CONTACT_MAX = 120;
export const CONSULT_NOTE_MAX = 600;

const PHONE_RE = /^(\+?84|0)\d{9,10}$/;
/** Link trang cá nhân (facebook.com/…, fb.com/…, m.facebook.com/…) hoặc tên người dùng Facebook. */
const FACEBOOK_RE = /^((https?:\/\/)?((www|m|web)\.)?(facebook|fb)\.com\/\S+|[a-z0-9.]{5,50})$/i;

export function isPhone(contact: string) {
  return PHONE_RE.test(contact.replace(/[\s.-]/g, ""));
}

export function isFacebook(contact: string) {
  return FACEBOOK_RE.test(contact.trim());
}

/** Câu báo lỗi cho ô liên hệ theo kênh đã chọn, hoặc null nếu hợp lệ. */
export function contactError(contact: string, channel: string): string | null {
  const value = contact.trim();
  if (!value) return "Mục này cần được điền.";
  if (channel === "facebook") {
    return isFacebook(value) ? null : "Hãy dán link trang Facebook của bạn, ví dụ facebook.com/ten.cua.ban.";
  }
  // Zalo, gọi điện và Google Meet đều cần số điện thoại (link Meet gửi qua tin nhắn).
  return isPhone(value) ? null : "Hãy nhập số điện thoại Việt Nam, ví dụ 0901234567.";
}
