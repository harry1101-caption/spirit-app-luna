import { batTuInputSchema, chartFrom, interpretChart } from "@/lib/bat-tu-api";

/**
 * Luận giải AI cho một lá số Bát Tự.
 *
 * Nhận lại ngày giờ sinh chứ KHÔNG nhận lá số từ client: lập lại phía server
 * tốn 0.007ms, đổi lại không ai nhét được lá số giả vào prompt.
 */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = batTuInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ." }, { status: 400 });
  }
  try {
    return Response.json({ interpretation: await interpretChart(chartFrom(input)) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
