import { ImageResponse } from "next/og";
import { getDatingProfile } from "@/lib/dating-server";
import { firstName, profileOf } from "@/lib/hop-nhau";
import { toPublicPerson } from "@/lib/dating-shared";
import { ogFonts, OG_BG } from "@/lib/og-fonts";

/**
 * Ảnh của hồ sơ duyên:
 *  - mặc định: ảnh xem trước link (1200×630) "Ai hợp với X nhất?"
 *  - `?format=story`: ảnh dọc 1080×1920 cho chủ hồ sơ đăng story
 *  - `?format=story&s=87&n=Lan`: ảnh story của người vừa ghép ("Lan hợp với X 87%")
 * `s`/`n` chỉ để vẽ ảnh, không ghi gì vào database — sửa tay cũng không hại ai.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getDatingProfile(slug);
  if (!p) return new Response("Not found", { status: 404 });
  const q = new URL(request.url).searchParams;
  const story = q.get("format") === "story";
  const scoreRaw = q.get("s") ? Number(q.get("s")) : NaN;
  const score = Number.isInteger(scoreRaw) && scoreRaw >= 0 && scoreRaw <= 100 ? scoreRaw : null;
  const visitor = (q.get("n") || "").slice(0, 20);
  const prof = profileOf(toPublicPerson(p));
  const name = firstName(p.name);
  const k = story ? 1.5 : 1;

  const title = score !== null ? `${visitor || "Mình"} hợp với ${name}` : `Ai hợp với ${name} nhất?`;
  const sub = score !== null ? "Còn bạn thì sao?" : "Nhập ngày sinh của bạn để biết";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: OG_BG, fontFamily: "Be Vietnam Pro", color: "#3a1f5c", padding: story ? 96 : 48 }}>
        <div style={{ fontSize: 24 * k, letterSpacing: 6, color: "#8a6fa3", fontWeight: 600 }}>HỒ SƠ DUYÊN</div>
        <div style={{ marginTop: 20 * k, fontSize: 52 * k, fontWeight: 700, textAlign: "center", lineHeight: 1.2, display: "flex" }}>{title}</div>
        <div style={{ marginTop: 16 * k, fontSize: 22 * k, color: "#6a5c7a", fontWeight: 600, display: "flex" }}>
          {[`Sinh năm ${p.birth_year ?? p.lunar_year}`, p.city, prof.zodiac, `Tuổi ${prof.conGiap}`].filter(Boolean).join(" · ")}
        </div>
        <div
          style={{
            marginTop: 32 * k,
            flexShrink: 0,
            width: 240 * k,
            height: 240 * k,
            borderRadius: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 30% 25%, #ffffff, #f3e8fb 60%, #e2d0f5)",
            border: `${10 * k}px solid #6e4a92`,
            boxShadow: "0 20px 50px rgba(107,75,130,0.25)",
          }}
        >
          <span style={{ fontSize: 76 * k, fontWeight: 700, lineHeight: 1 }}>{score !== null ? `${score}%` : "?%"}</span>
        </div>
        <div style={{ marginTop: 28 * k, fontSize: 30 * k, fontWeight: 700, display: "flex" }}>{sub}</div>
        <div style={{ marginTop: story ? 96 : 20, fontSize: 22 * k, color: "#8a6fa3", fontWeight: 600, display: "flex" }}>{`lunara.haohn.tech/duyen/${slug}`}</div>
      </div>
    ),
    { width: story ? 1080 : 1200, height: story ? 1920 : 630, fonts: await ogFonts(), headers: { "Cache-Control": "public, max-age=300" } },
  );
}
