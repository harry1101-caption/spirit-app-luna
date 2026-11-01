/**
 * Băm ổn định cho các tính năng "mỗi câu hỏi trong ngày một quẻ" (Xin xăm,
 * Kinh Dịch): cùng câu hỏi, cùng máy, cùng ngày thì luôn ra cùng kết quả.
 */

/**
 * FNV-1a kèm bước trộn cuối của murmur3.
 *
 * Bước trộn là bắt buộc chứ không phải trang trí: FNV-1a trần cho ra giá trị
 * rất gần nhau khi đầu vào chỉ khác một ký tự, mà đầu vào ở đây là chuỗi ngày
 * tháng chỉ đổi một chữ số mỗi hôm. Thiếu bước này thì hai ngày liên tiếp hay
 * rơi vào cùng một quẻ.
 */
export function hash(seed: string) {
  let value = 2166136261;
  for (const char of seed) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  value ^= value >>> 16;
  value = Math.imul(value, 2246822507);
  value ^= value >>> 13;
  value = Math.imul(value, 3266489909);
  value ^= value >>> 16;
  return value >>> 0;
}

/** Bỏ dấu và gom khoảng trắng, để "Có nên đổi việc?" và "co nen doi viec" ra cùng một quẻ. */
export function normalizeQuestion(question: string) {
  return question
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Chuỗi ổn định mỗi máy, để hai người hỏi cùng câu không nhận chung một quẻ. Chỉ gọi phía trình duyệt. */
export function deviceSeed() {
  let seed = localStorage.getItem("luna:device:v1");
  if (!seed) {
    seed = crypto.randomUUID();
    localStorage.setItem("luna:device:v1", seed);
  }
  return seed;
}
