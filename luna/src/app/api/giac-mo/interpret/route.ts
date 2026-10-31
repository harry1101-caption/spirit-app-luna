import { chartFrom, giacMoInputSchema, interpretChart } from "@/lib/giac-mo-api";

/** Luận giải AI. Dò lại biểu tượng phía server, không nhận kết quả từ client. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 8000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = giacMoInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ." }, { status: 400 });
  }
  try {
    return Response.json({ interpretation: await interpretChart(chartFrom(input)) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
