import { chartFrom, humanDesignInputSchema } from "@/lib/human-design-api";

/** Lập biểu đồ Human Design — tính tại chỗ từ ephemeris, không gọi mạng. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = humanDesignInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ. Hãy kiểm tra ngày và giờ sinh." }, { status: 400 });
  }
  try {
    return Response.json({ chart: chartFrom(input) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
