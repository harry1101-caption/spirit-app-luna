import { chartFrom, xinXamInputSchema } from "@/lib/xin-xam-api";

/** Rút quẻ — tra bảng tại chỗ, không gọi mạng. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Câu hỏi quá dài." }, { status: 413 });
    input = xinXamInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Hãy viết câu hỏi rõ hơn, ít nhất một câu trọn vẹn." }, { status: 400 });
  }
  try {
    return Response.json({ chart: chartFrom(input) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
