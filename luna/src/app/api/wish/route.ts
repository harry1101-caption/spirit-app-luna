import { supabaseServer } from "@/lib/supabase/server";
import { localCheck, reviewWish, wishInputSchema } from "@/lib/wish-tree-api";
import type { MyWish } from "@/lib/wish-tree";

/**
 * Treo một điều ước. Đây là đường duy nhất để thêm điều ước: RPC wish_create
 * đòi WISH_SERVER_KEY nên không ai lách được phần kiểm duyệt dưới đây.
 */
export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Nội dung quá dài." }, { status: 413 });
    input = wishInputSchema.parse(JSON.parse(body));
  } catch {
    return Response.json({ error: "Điều ước chưa hợp lệ." }, { status: 400 });
  }
  if (!process.env.WISH_SERVER_KEY) {
    return Response.json({ error: "Cây ước nguyện đang bảo trì, bạn quay lại sau nhé." }, { status: 503 });
  }

  // Phải đăng nhập mới treo được (RPC cũng chặn, đây là để báo lỗi sớm và rõ)
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return Response.json({ error: "Bạn cần đăng nhập để treo điều ước." }, { status: 401 });

  let isPublic = input.isPublic;
  if (isPublic) {
    const problem = localCheck(input.content) ?? (input.nickname ? localCheck(input.nickname) : null);
    if (problem) {
      const field = localCheck(input.content) ? "content" : "nickname";
      return Response.json({ error: problem, field }, { status: 422 });
    }
  }
  const review = await reviewWish(input);
  if (isPublic && review.verdict === "unsafe") {
    return Response.json(
      { error: "Điều ước này chưa hợp để treo công khai. Bạn sửa lại, hoặc chọn “Chỉ mình tôi thấy” nhé.", field: "content" },
      { status: 422 },
    );
  }
  // Nghe như đang rất nặng lòng thì giữ riêng tư dù người viết chọn công khai
  if (review.verdict === "care") isPublic = false;

  const { data: id, error } = await supabase.rpc("wish_create", {
    p_key: process.env.WISH_SERVER_KEY,
    p_device: input.device,
    p_nickname: input.nickname,
    p_content: input.content,
    p_topic: input.topic,
    p_public: isPublic,
    p_blessing: review.blessing,
    p_color: input.color,
  });
  if (error) {
    if (error.message.includes("not_signed_in")) {
      return Response.json({ error: "Bạn cần đăng nhập để treo điều ước." }, { status: 401 });
    }
    if (error.message.includes("rate_limited")) {
      return Response.json({ error: "Mỗi ngày bạn treo được tối đa 5 điều ước. Hẹn bạn ngày mai nhé." }, { status: 429 });
    }
    if (error.message.includes("busy")) {
      return Response.json({ error: "Cây đang đông quá, bạn thử lại sau ít phút nhé." }, { status: 503 });
    }
    return Response.json({ error: "Chưa treo được điều ước, bạn thử lại nhé." }, { status: 500 });
  }

  const wish: MyWish = {
    id: id as string,
    nickname: input.nickname || null,
    content: input.content,
    topic: input.topic,
    color: input.color,
    bless_count: 0,
    created_at: new Date().toISOString(),
    is_public: isPublic,
    blessing: review.blessing,
    hidden: false,
  };
  return Response.json({ wish, keptPrivate: input.isPublic && !isPublic });
}
