import { castFrom, interpretCast, kinhDichInputSchema } from "@/lib/kinh-dich-api";

/** Luận giải AI. Gieo lại quẻ phía server, không nhận quẻ do client gửi lên. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Câu hỏi quá dài." }, { status: 413 });
    input = kinhDichInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ." }, { status: 400 });
  }
  return Response.json({ interpretation: await interpretCast(castFrom(input)) });
}
