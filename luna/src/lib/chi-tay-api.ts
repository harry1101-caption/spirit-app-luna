import { z } from "zod";
import { PLAIN_STYLE } from "./interpretation-style.ts";
import {
  checkImage, handRoleMeaning, hands, palmLineGuide, palmLines, sanitizeReading,
  visibilities, type ChiTayResult, type Hand, type HandReading,
} from "./chi-tay.ts";

export const chiTayInputSchema = z.object({
  leftImage: z.string().min(100),
  rightImage: z.string().min(100),
  dominant: z.enum(hands),
});
export type ChiTayApiInput = z.infer<typeof chiTayInputSchema>;

const lineSchema = z.object({
  name: z.enum(palmLines),
  visibility: z.enum(visibilities),
  observation: z.string().trim().max(400),
  meaning: z.string().trim().max(800),
});
const handSchema = z.object({
  hand: z.enum(hands),
  usable: z.boolean(),
  issue: z.string().trim().max(300).optional(),
  lines: z.array(lineSchema).max(4).default([]),
});
const outputSchema = z.object({
  hands: z.array(handSchema).max(2).default([]),
  comparison: z.string().trim().max(1200).default(""),
  summary: z.string().trim().max(1500).default(""),
});

const SYSTEM = `Bạn quan sát ảnh lòng bàn tay và mô tả những gì THỰC SỰ NHÌN THẤY. Tiếng Việt, ấm áp, không Markdown.
Bạn nhận HAI ảnh: ảnh thứ nhất là TAY TRÁI, ảnh thứ hai là TAY PHẢI. Đọc riêng từng tay.

QUAN TRỌNG NHẤT — không được bịa:
- Với mỗi đường của mỗi tay, khai "visibility" trung thực: "rõ", "mờ", hoặc "không thấy".
- Nếu không nhìn rõ một đường, PHẢI khai "không thấy" và để observation trống. TUYỆT ĐỐI không mô tả đường mình không thấy.
- Nếu một ảnh không phải lòng bàn tay, hoặc quá tối, quá mờ, tay khum, ngón che mất đường chỉ: đặt usable=false cho tay đó và ghi "issue" nói rõ cần chụp lại thế nào, để lines rỗng.
- Hai tay được xét độc lập: một tay hỏng ảnh không làm tay kia hỏng theo.

Trả JSON: hands (mảng 2 phần tử, mỗi phần tử có hand, usable, issue, lines), comparison, summary.
"comparison" so sánh điểm giống và khác giữa hai tay — CHỈ viết khi cả hai tay đều usable, nếu không thì để chuỗi rỗng.
Mỗi "observation" tả đúng cái nhìn thấy (dài, ngắn, sâu, mảnh, đứt đoạn, có nhánh…). Mỗi "meaning" diễn giải nhẹ nhàng, 40–90 từ.

${PLAIN_STYLE}
Ba phần ở trên áp cho mỗi "meaning": nói thẳng nghĩa là gì, một tình huống đời thường, rồi một việc nhỏ thử được. "summary" cũng viết theo lối đó.
Tên đường chỉ tay phải kèm nghĩa ngay: Sinh Đạo nói về nhịp sống và sức bền chứ KHÔNG phải độ dài cuộc đời; Trí Đạo là cách nghĩ và ra quyết định; Tâm Đạo là cách bộc lộ tình cảm; Vận Mệnh là cảm nhận về hướng đi, và rất nhiều người không có đường này — không có là chuyện bình thường, đừng viết như thiếu sót.

TUYỆT ĐỐI KHÔNG:
- Đoán tuổi thọ, thời điểm qua đời, bệnh tật. Đường Sinh Đạo ngắn KHÔNG có nghĩa là sống ngắn — đây là hiểu lầm phổ biến và có hại, nếu nhắc tới thì phải nói rõ là hiểu lầm.
- Đoán sự kiện tương lai, tai nạn, chuyện tình cảm tan vỡ, chuyện tiền bạc cụ thể.
- Khuyên quyết định y tế, tài chính, pháp lý.
- Nhận dạng hay suy đoán danh tính, giới tính, tuổi, chủng tộc của người trong ảnh.
Chỉ tay là nội dung chiêm nghiệm, không phải khoa học đã kiểm chứng.`;

const fail = (input: ChiTayApiInput, issue: string): ChiTayResult => ({
  usable: false, issue, dominant: input.dominant, hands: [], comparison: "", summary: "", notes: [],
});

export async function readPalm(input: ChiTayApiInput): Promise<ChiTayResult> {
  for (const [label, image] of [["Tay trái", input.leftImage], ["Tay phải", input.rightImage]] as const) {
    const check = checkImage(image);
    if (!check.ok) return fail(input, `${label}: ${check.error}`);
  }
  if (!process.env.AI_API_KEY)
    return fail(input, "Tính năng này cần dịch vụ AI để đọc ảnh, hiện chưa được cấu hình.");

  try {
    const response = await fetch(
      `${process.env.AI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(90000),
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4.1-mini",
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    imageOrder: ["Tay trái", "Tay phải"],
                    dominant: input.dominant,
                    lineOrder: palmLines,
                    lineGuide: palmLineGuide,
                  }),
                },
                { type: "image_url", image_url: { url: input.leftImage, detail: "high" } },
                { type: "image_url", image_url: { url: input.rightImage, detail: "high" } },
              ],
            },
          ],
        }),
      },
    );
    if (!response.ok) return fail(input, "Dịch vụ AI đang không phản hồi. Hãy thử lại sau.");
    const data = await response.json();
    const parsed = outputSchema.parse(JSON.parse(data.choices[0].message.content));

    const notes: string[] = [];
    const readings: HandReading[] = hands.map((hand: Hand) => {
      const raw = parsed.hands.find((h) => h.hand === hand);
      const role = hand === input.dominant ? "Tay thuận" : "Tay không thuận";
      if (!raw || !raw.usable)
        return {
          hand, role, usable: false, lines: [],
          issue: raw?.issue || "Ảnh tay này chưa đủ rõ để đọc đường chỉ.",
        };
      const clean = sanitizeReading(raw.lines);
      // Thấy dưới hai đường thì coi như không đọc được — thà bảo chụp lại
      // còn hơn đưa ra bài đọc dựng trên gần như không có gì.
      if (clean.visibleCount < 2)
        return {
          hand, role, usable: false, lines: [],
          issue: "Chỉ nhận ra được rất ít đường trong ảnh tay này. Hãy chụp lại rõ hơn.",
        };
      notes.push(...clean.notes.map((n) => `${hand} — ${n}`));
      return { hand, role, usable: true, lines: clean.lines };
    });

    const ok = readings.filter((r) => r.usable);
    if (!ok.length)
      return fail(input, readings.map((r) => `${r.hand}: ${r.issue}`).join(" "));

    return {
      usable: true,
      dominant: input.dominant,
      hands: readings,
      // Chỉ giữ phần so sánh khi THẬT SỰ đọc được cả hai tay.
      comparison: ok.length === 2 ? parsed.comparison : "",
      summary: parsed.summary,
      notes: [
        ...notes,
        ...(ok.length === 1 ? ["Chỉ đọc được một tay nên không có phần so sánh hai bên."] : []),
        ...readings.filter((r) => r.usable).map((r) => `${r.hand} là ${r.role.toLowerCase()}. ${handRoleMeaning[r.role]}`),
        "Chỉ tay là nội dung chiêm nghiệm, không phải phép đo đã được kiểm chứng. Đường Sinh Đạo ngắn không nói gì về tuổi thọ.",
      ],
    };
  } catch {
    return fail(input, "Chưa đọc được ảnh này. Hãy thử lại hoặc chụp ảnh khác.");
  }
}
