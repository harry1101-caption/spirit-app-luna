import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Font cho ảnh next/og (ảnh xem trước link, ảnh story). Font mặc định của next/og
 * không có dấu tiếng Việt nên phải nạp tay. Đường dẫn viết nguyên văn để bộ đóng gói
 * khi deploy nhận ra và mang theo file font.
 */
let fonts: Promise<{ name: string; data: Buffer; weight: 600 | 700 }[]> | null = null;

export function ogFonts() {
  fonts ??= Promise.all([
    readFile(path.join(process.cwd(), "src/assets/fonts/BeVietnamPro-SemiBold.ttf")).then((data) => ({ name: "Be Vietnam Pro", weight: 600 as const, data })),
    readFile(path.join(process.cwd(), "src/assets/fonts/BeVietnamPro-Bold.ttf")).then((data) => ({ name: "Be Vietnam Pro", weight: 700 as const, data })),
  ]);
  return fonts;
}

export const OG_BG = "linear-gradient(135deg, #fcf2f7 0%, #f1e6fb 55%, #e6d8f6 100%)";
