"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight, Camera, Check, Hand, LoaderCircle, LockKeyhole, RotateCcw, TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelatedTools } from "@/components/related-tools";
import { IconSelect } from "@/components/form-field";
import { PalmDiagram, PalmLegend } from "@/components/palm-diagram";
import {
  hands, palmLineGuide, palmLines, photoTips, type ChiTayResult, type Hand as HandSide,
} from "@/lib/chi-tay";

/**
 * Thu nhỏ ảnh ngay trên máy người dùng trước khi gửi.
 *
 * Vẽ lại qua canvas nên EXIF bị loại bỏ — ảnh điện thoại thường kèm toạ độ
 * GPS nơi chụp, không có lý do gì để thứ đó rời khỏi máy.
 */
async function prepareImage(file: File, maxSide = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.88);
}

function UploadSlot({
  label, value, onPick, mirrored,
}: {
  label: HandSide;
  value: string;
  onPick: (file?: File | null) => void;
  mirrored: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-[0.12em] text-[#654280] uppercase">{label}</p>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="relative flex h-[200px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[#d5c4e8] bg-[#faf7ff] p-3 text-[#6a5c7a] transition-colors hover:border-[#ac88cf] sm:h-[240px]"
      >
        {value ? (
          <Image src={value} alt={`Ảnh ${label}`} fill className="object-contain" unoptimized />
        ) : (
          <>
            <PalmDiagram className={`h-20 w-auto opacity-45 ${mirrored ? "-scale-x-100" : ""}`} />
            <span className="flex items-center gap-1.5 text-xs">
              <Camera size={14} /> Chạm để chụp
            </span>
          </>
        )}
      </button>
      {value ? (
        <button type="button" onClick={() => ref.current?.click()}
          className="mt-1.5 text-xs text-[#795493] underline">
          Chụp lại {label.toLowerCase()}
        </button>
      ) : null}
    </div>
  );
}

export function ChiTayFlow() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [result, setResult] = useState<ChiTayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function pick(side: "left" | "right", file?: File | null) {
    if (!file) return;
    setError("");
    try {
      const url = await prepareImage(file);
      if (side === "left") setLeft(url);
      else setRight(url);
    } catch {
      setError("Không đọc được tệp ảnh này. Hãy thử ảnh khác.");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!left || !right) return setError("Cần ảnh của cả hai tay.");
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/chi-tay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leftImage: left,
          rightImage: right,
          dominant: String(data.get("dominant") || hands[1]),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Chưa đọc được ảnh.");
      setResult(payload.result);
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setLeft("");
    setRight("");
    setError("");
  }

  // Gợi ý feature liên quan render ngoài thẻ, do RelatedToolsSlot ở luna-app.
  useRelatedTools(result ? "chi-tay" : null);

  if (!result) {
    return (
      <div className="flow-body chi-tay-flow is-configuring">
        <form className="tuvi-form tarot-setup-panel" onSubmit={submit}>
          <p className="tuvi-note mb-1">
            Chụp lòng bàn tay của cả hai bên. Tay thuận và tay không thuận nói
            hai chuyện khác nhau, nên có đủ hai ảnh mới so sánh được. Ảnh được
            thu nhỏ ngay trên máy bạn và bỏ toàn bộ thông tin kèm theo như vị
            trí GPS, rồi mới gửi đi.
          </p>

          {/* Sơ đồ minh hoạ: chỉ rõ đường nào nằm ở đâu */}
          <div className="mt-5 flex items-center gap-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
            <PalmDiagram className="h-40 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] leading-[1.7] text-[#5b5276]">
                Bốn đường được đọc, vẽ trên bàn tay phải. Tay trái là ảnh gương
                của hình này.
              </p>
              <PalmLegend className="mt-2" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 items-start gap-3">
            <UploadSlot label="Tay trái" value={left} mirrored onPick={(f) => void pick("left", f)} />
            <UploadSlot label="Tay phải" value={right} mirrored={false} onPick={(f) => void pick("right", f)} />
          </div>

          <ul className="mt-5 flex list-none flex-col gap-1 p-0">
            {photoTips.map((tip) => (
              <li key={tip} className="text-xs leading-[1.7] text-[#6a5c7a]">· {tip}</li>
            ))}
          </ul>

          <label className="mt-5 block">Bạn thuận tay nào?
            <IconSelect icon={Hand} name="dominant" required placeholder="Chọn tay thuận"
              options={[...hands]} defaultValue={hands[1]} />
          </label>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <Button className="tuvi-submit" type="submit" disabled={loading || !left || !right}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? "Đang đọc hai bàn tay…" : "Xem chỉ tay"}
            {loading ? null : <ArrowRight size={18} />}
          </Button>
          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="inline align-[-2px] mr-1" />
            Ảnh được gửi tới dịch vụ AI để đọc và không lưu lại trên máy chủ.
            Nếu bạn không muốn gửi ảnh bàn tay đi, hãy bỏ qua tính năng này.
          </p>
        </form>

        <section className="tarot-introduction" aria-label="Tìm hiểu về xem chỉ tay">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
              <section>
                <h2>Xem chỉ tay là gì?</h2>
                <p>
                  Đọc những đường hằn trên lòng bàn tay như một cách gợi mở về
                  tính khí và nhịp sống. Bốn đường hay được nhắc nhất là Sinh
                  Đạo, Trí Đạo, Tâm Đạo và Vận Mệnh — riêng Vận Mệnh thì nhiều
                  người không có, và đó là chuyện hoàn toàn bình thường.
                </p>
              </section>
              <section>
                <h2>Vì sao cần cả hai tay?</h2>
                <p>
                  Tay thuận thường được đọc về hiện tại và những gì bạn đang
                  chủ động tạo ra. Tay không thuận nói về khuynh hướng sẵn có.
                  Chỗ hai tay khác nhau mới là chỗ đáng chú ý nhất.
                </p>
              </section>
            </div>
            <section className="tarot-introduction-steps">
              <h2>Bốn đường được đọc</h2>
              <ol>
                {palmLines.map((name) => (
                  <li key={name}>
                    <strong>{name}</strong>
                    <span>{palmLineGuide[name].where}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>

        <div className="tarot-afterword">
          <h3>Đường chỉ tay gợi mở, không định đoạt</h3>
        </div>
        <div className="tarot-principles">
          <div>
            <span><TriangleAlert size={28} strokeWidth={1.2} /></span>
            <div><h4>Sinh Đạo không nói về tuổi thọ</h4>
              <p>Đây là hiểu lầm phổ biến và có hại. Đường ngắn không nghĩa là sống ngắn.</p></div>
          </div>
          <div>
            <span><Camera size={28} strokeWidth={1.2} /></span>
            <div><h4>Thấy gì nói nấy</h4>
              <p>Đường nào trong ảnh không nhìn rõ sẽ được ghi là không thấy, không đoán bừa.</p></div>
          </div>
          <div>
            <span><Check size={28} strokeWidth={1.2} /></span>
            <div><h4>Quyết định vẫn ở bạn</h4>
              <p>Giữ lại điều hữu ích và tự chọn bước tiếp theo.</p></div>
          </div>
        </div>
      </div>
    );
  }

  if (!result.usable) {
    return (
      <div className="tarot-setup-panel">
        <div className="flex items-start gap-3">
          <TriangleAlert size={22} className="mt-1 shrink-0 text-[#b0915f]" />
          <div>
            <h2 className="text-[22px] leading-tight text-[#1d1133]">Chưa đọc được ảnh</h2>
            <p className="mt-2 text-[14px] leading-[1.8] text-[#5b5276]">{result.issue}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-5 rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
          <PalmDiagram className="h-36 w-auto shrink-0" />
          <ul className="flex list-none flex-col gap-1 p-0">
            {photoTips.map((tip) => (
              <li key={tip} className="text-xs leading-[1.7] text-[#6a5c7a]">· {tip}</li>
            ))}
          </ul>
        </div>
        <Button variant="outline" className="mt-5" onClick={reset}>
          <RotateCcw size={15} /> Chụp lại
        </Button>
      </div>
    );
  }

  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">XEM CHỈ TAY</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">Hai bàn tay của bạn</h2>
          <p className="mt-1 text-xs text-[#6a5c7a]">Thuận {result.dominant.toLowerCase()}</p>
        </div>
        <Button variant="outline" onClick={reset}>
          <RotateCcw size={15} /> Chụp ảnh khác
        </Button>
      </div>

      {result.summary ? (
        <p className="mt-5 text-[15px] leading-[1.8] text-[#5b5276]">{result.summary}</p>
      ) : null}

      {result.hands.map((hand) => (
        <div key={hand.hand} className="mt-6">
          <div className="flex items-baseline gap-2">
            <p className="font-[family-name:var(--font-serif-app)] text-[21px] text-[#281b44]">
              {hand.hand}
            </p>
            <span className="rounded-full border border-[#e0d5f0] bg-[#f6f0fd] px-2 py-0.5 text-xs text-[#795493]">
              {hand.role}
            </span>
          </div>

          {hand.usable ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {hand.lines.map((line) => (
                <div key={line.name}
                  className={`rounded-2xl border p-4 ${
                    line.visibility !== "không thấy"
                      ? "border-[#e8ddef] bg-white/60"
                      : "border-[#efe6f6] bg-[#faf7ff]"
                  }`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-[family-name:var(--font-serif-app)] text-[18px] text-[#3e357e]">
                      {line.name}
                    </p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${
                      line.visibility === "rõ"
                        ? "border-[#8d7ac4] bg-[#e5dcf7] text-[#3e357e]"
                        : line.visibility === "mờ"
                          ? "border-[#d9c4a4] bg-[#f7f0e4] text-[#8a6f45]"
                          : "border-[#e0d5f0] bg-white text-[#9a8cab]"
                    }`}>
                      {line.visibility}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.7] text-[#5b5276]">{line.observation}</p>
                  {line.meaning ? (
                    <p className="mt-2 border-t border-[#efe6f6] pt-2 text-[13px] leading-[1.7] text-[#6b6287]">
                      {line.meaning}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-2xl border border-[#efe6f6] bg-[#faf7ff] p-3 text-[13px] leading-[1.7] text-[#6a5c7a]">
              {hand.issue}
            </p>
          )}
        </div>
      ))}

      {result.comparison ? (
        <div className="mt-6 rounded-2xl border border-[#e0d5f0] bg-[#f6f0fd]/70 p-4">
          <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Hai tay nói gì khi đặt cạnh nhau</p>
          <p className="mt-2 text-[14px] leading-[1.8] text-[#5b5276]">{result.comparison}</p>
        </div>
      ) : null}

      <ul className="mt-5 flex list-none flex-col gap-1 p-0">
        {result.notes.map((n) => (
          <li key={n} className="text-xs leading-[1.7] text-[#6a5c7a]">· {n}</li>
        ))}
      </ul>

    </div>
  );
}
