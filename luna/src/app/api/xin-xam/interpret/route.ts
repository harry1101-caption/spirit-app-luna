import { chartFrom, interpretChart, xinXamInputSchema } from "@/lib/xin-xam-api";

/** Luận giải AI. Rút lại quẻ phía server, không nhận quẻ do client gửi lên. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Câu hỏi quá dài." }, { status: 413 });
    input = xinXamInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ." }, { status: 400 });
  }
  try {
    return Response.json({ interpretation: await interpretChart(chartFrom(input)) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
