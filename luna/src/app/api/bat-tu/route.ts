import { batTuInputSchema, chartFrom } from "@/lib/bat-tu-api";

/**
 * Lập lá số Bát Tự. Thuần toán lịch, không gọi mạng — trả về gần như tức thì.
 * Phần luận giải AI nằm ở /api/bat-tu/interpret để người dùng thấy lá số ngay
 * thay vì chờ ~10 giây cho một thứ đã tính xong trong 0.007ms.
 */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = batTuInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json(
      { error: "Thông tin chưa hợp lệ. Hãy kiểm tra lại ngày và giờ sinh." },
      { status: 400 },
    );
  }
  try {
    return Response.json({ chart: chartFrom(input) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
