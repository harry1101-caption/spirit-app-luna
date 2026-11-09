import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import {
  CONSULT_CHANNELS,
  CONSULT_CONTACT_MAX,
  CONSULT_NAME_MAX,
  CONSULT_NOTE_MAX,
  CONSULT_TIMES,
  contactError,
} from "@/lib/consultation";

const inputSchema = z.object({
  feature: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(CONSULT_NAME_MAX),
  contact: z.string().trim().min(5).max(CONSULT_CONTACT_MAX),
  channel: z.enum(CONSULT_CHANNELS.map((c) => c.value) as [string, ...string[]]),
  preferredTime: z.enum(CONSULT_TIMES.map((t) => t.value) as [string, ...string[]]),
  note: z.string().trim().max(CONSULT_NOTE_MAX).optional().default(""),
  resultTitle: z.string().trim().max(200).optional(),
});

/** Ghi nhận một yêu cầu tư vấn 1-1. Đăng nhập thì gắn owner, không thì vẫn nhận. */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = inputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Thông tin chưa hợp lệ, bạn kiểm tra lại giúp nhé." }, { status: 400 });
  }

  const problem = contactError(input.contact, input.channel);
  if (problem) return Response.json({ error: problem, field: "contact" }, { status: 422 });

  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  // Không .select() sau insert: anon chỉ có quyền ghi, không có quyền đọc lại.
  const { error } = await supabase.from("consultation_requests").insert({
    owner: auth.user?.id ?? null,
    feature: input.feature,
    name: input.name,
    contact: input.contact,
    channel: input.channel,
    preferred_time: input.preferredTime,
    note: input.note || null,
    result_title: input.resultTitle || null,
  });
  if (error) {
    if (error.message.includes("rate_limited")) {
      return Response.json(
        { error: "Bạn đã gửi khá nhiều yêu cầu hôm nay. Reader sẽ liên hệ sớm, bạn chờ một chút nhé." },
        { status: 429 },
      );
    }
    console.error("consultation insert failed", error);
    return Response.json({ error: "Chưa gửi được yêu cầu. Bạn thử lại sau ít phút nhé." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
