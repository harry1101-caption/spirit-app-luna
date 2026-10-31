import { chartFrom, humanDesignInputSchema, interpretChart } from "@/lib/human-design-api";

/** Luận giải AI. Lập lại biểu đồ phía server, không nhận kết quả từ client. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = humanDesignInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ." }, { status: 400 });
  }
  try {
    return Response.json({ interpretation: await interpretChart(chartFrom(input)) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
