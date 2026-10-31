import { chartFrom, giacMoInputSchema } from "@/lib/giac-mo-api";

/** Dò biểu tượng trong lời kể — tra từ điển tại chỗ, không gọi mạng. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 8000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = giacMoInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Hãy kể lại giấc mơ dài hơn một chút." }, { status: 400 });
  }
  try {
    return Response.json({ chart: chartFrom(input) });
  } catch (error) {
    return Response.json({ error: String((error as Error).message) }, { status: 400 });
  }
}
