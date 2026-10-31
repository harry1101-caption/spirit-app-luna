import { chartFrom, thanSoHocInputSchema } from "@/lib/than-so-hoc-api";

/** Tính các con số — thuần số học, không gọi mạng, trả về tức thì. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = thanSoHocInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ. Hãy kiểm tra họ tên và ngày sinh." }, { status: 400 });
  }
  try {
    return Response.json({ chart: chartFrom(input) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
