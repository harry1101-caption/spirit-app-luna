/**
 * Trang tra cứu "Xăm số N Quan Âm" (/xin-xam/xam-so-N) cho đủ 100 quẻ.
 *
 * Nguyên văn chữ Hán và cấp quẻ lấy từ data/xin-xam.json (văn bản thật, cũng là
 * nguồn của công cụ xin xăm). Phần tiếng Việt (âm Hán-Việt, nghĩa từng câu,
 * điển tích, lời giải) viết sẵn trong data/xin-xam-vi-*.json theo luật giọng văn
 * chung: dễ hiểu, hơi tích cực, quẻ Hạ không phải điềm gở, không đoán sự kiện.
 */

import source from "../data/xin-xam.json" with { type: "json" };
import part1 from "../data/xin-xam-vi-1.json" with { type: "json" };
import part2 from "../data/xin-xam-vi-2.json" with { type: "json" };
import part3 from "../data/xin-xam-vi-3.json" with { type: "json" };
import part4 from "../data/xin-xam-vi-4.json" with { type: "json" };
import { gradeMeaning, type Grade } from "@/lib/xin-xam";

type StickText = {
  so: number;
  hanViet: string[];
  nghia: string[];
  dienTich: string;
  dienTichText: string;
  summary: string;
  areas: { title: string; text: string }[];
  question: string;
};

export type FortuneStick = StickText & {
  slug: string;
  grade: Grade;
  gradeMeaning: string;
  /** Bốn câu thơ chữ Hán nguyên văn */
  poem: string[];
};

const texts = new Map(([...part1, ...part2, ...part3, ...part4] as StickText[]).map((t) => [t.so, t]));

export const FORTUNE_STICKS: FortuneStick[] = (source as { so: number; cap: Grade; tho: string[] }[])
  .filter((s) => texts.has(s.so))
  .map((s) => ({
    ...texts.get(s.so)!,
    slug: `xam-so-${s.so}`,
    grade: s.cap,
    gradeMeaning: gradeMeaning[s.cap],
    poem: s.tho,
  }));

export function fortuneStick(slug: string) {
  return FORTUNE_STICKS.find((s) => s.slug === slug);
}

export function stickTitle(s: FortuneStick) {
  return `Xăm số ${s.so} Quan Âm: quẻ ${s.grade}${s.dienTich ? `, ${s.dienTich}` : ""}`;
}

export function stickDescription(s: FortuneStick) {
  const story = s.dienTich ? `điển tích ${s.dienTich} ` : "";
  return `Giải xăm số ${s.so} Quan Âm (${s.grade}): bài thơ, âm Hán-Việt, nghĩa từng câu, ${story}và lời giải cho công việc, tình cảm.`;
}
