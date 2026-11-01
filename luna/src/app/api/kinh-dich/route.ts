import { castFrom, kinhDichInputSchema } from "@/lib/kinh-dich-api";

/** Gieo quẻ — tính tại chỗ, không gọi mạng. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Câu hỏi quá dài." }, { status: 413 });
    input = kinhDichInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Hãy viết câu hỏi rõ hơn, ít nhất một câu trọn vẹn." }, { status: 400 });
  }
  return Response.json({ cast: castFrom(input) });
}
