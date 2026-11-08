import { ImageResponse } from "next/og";
import { ogFonts, OG_BG as BG } from "@/lib/og-fonts";
import { compatibility, decodePerson, firstName } from "@/lib/hop-nhau";

/**
 * Ảnh cho "Xem độ hợp đôi":
 *  - `?m=`            → ảnh xem trước link mời (1200×630): "?%" bị khoá, gây tò mò để bấm.
 *  - `?m=&b=`         → ảnh xem trước link kết quả, có điểm.
 *  - `&format=story`  → ảnh dọc 1080×1920 để đăng story.
 * Font tiếng Việt phải nạp tay: font mặc định của next/og không có dấu.
 */

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const a = decodePerson(params.get("m"));
  const b = decodePerson(params.get("b"));
  const story = params.get("format") === "story";
  const result = a && b ? safe(() => compatibility(a, b)) : null;
  const [width, height] = story ? [1080, 1920] : [1200, 630];
  const nameA = a ? firstName(a.name) : "Bạn";
  const nameB = b ? firstName(b.name) : "người ấy";

  const scoreText = result ? `${result.score}%` : "?%";
  const scale = story ? 1.5 : 1;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          fontFamily: "Be Vietnam Pro",
          color: "#3a1f5c",
          padding: story ? 96 : 48,
        }}
      >
        <div style={{ fontSize: 26 * scale, letterSpacing: 6, color: "#8a6fa3", fontWeight: 600 }}>HỢP NHAU BAO NHIÊU %</div>
        <div style={{ marginTop: 24 * scale, fontSize: 52 * scale, fontWeight: 700, display: "flex", alignItems: "center", gap: 24 * scale }}>
          <span>{nameA}</span>
          <span style={{ color: "#e889b5" }}>&</span>
          <span>{nameB}</span>
        </div>
        <div
          style={{
            marginTop: 32 * scale,
            flexShrink: 0,
            width: 240 * scale,
            height: 240 * scale,
            borderRadius: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 30% 25%, #ffffff, #f3e8fb 60%, #e2d0f5)",
            border: `${10 * scale}px solid #6e4a92`,
            boxShadow: "0 20px 50px rgba(107,75,130,0.25)",
          }}
        >
          <span style={{ fontSize: 96 * scale, fontWeight: 700, lineHeight: 1 }}>{scoreText}</span>
          {result ? null : <span style={{ marginTop: 8 * scale, fontSize: 22 * scale, color: "#6e4a92", fontWeight: 600 }}>chờ mở khoá</span>}
        </div>
        <div style={{ marginTop: 28 * scale, fontSize: 40 * scale, fontWeight: 700, textAlign: "center", lineHeight: 1.3, display: "flex" }}>
          {result ? result.headline : "Bạn có tò mò không?"}
        </div>
        <div style={{ marginTop: 16 * scale, fontSize: 24 * scale, color: "#6a5c7a", fontWeight: 600, textAlign: "center", lineHeight: 1.3, display: "flex" }}>
          {result ? result.tagline : "Nhập ngày sinh của bạn để mở kết quả"}
        </div>
        <div style={{ marginTop: (story ? 120 : 32), fontSize: 22 * scale, color: "#8a6fa3", fontWeight: 600 }}>lunara.haohn.tech/hop-nhau</div>
      </div>
    ),
    {
      width,
      height,
      fonts: await ogFonts(),
      headers: { "Cache-Control": "public, max-age=86400, immutable" },
    },
  );
  return image;
}

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}
