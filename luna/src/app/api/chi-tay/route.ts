import { chiTayInputSchema, readPalm } from "@/lib/chi-tay-api";

/**
 * Đọc ảnh lòng bàn tay. Ảnh được chuyển thẳng tới provider và KHÔNG lưu lại
 * ở bất kỳ đâu trên máy chủ.
 */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 7_000_000)
      return Response.json({ error: "Ảnh quá lớn. Hãy chụp lại hoặc chọn ảnh nhỏ hơn." }, { status: 413 });
    input = chiTayInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ." }, { status: 400 });
  }
  return Response.json({ result: await readPalm(input) });
}
