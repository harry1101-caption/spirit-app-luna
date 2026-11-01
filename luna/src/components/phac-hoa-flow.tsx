"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Crown,
  Download,
  ImagePlus,
  Info,
  LoaderCircle,
  LockKeyhole,
  PencilLine,
  RotateCcw,
  Sparkles,
  UserRound,
  VenusAndMars,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRelatedTools } from "@/components/related-tools";
import { FormIntro, IconField, IconSelect, ValidatedForm } from "@/components/form-field";
import type { PortraitStyle, SoulmateProfile } from "@/lib/phac-hoa";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Result = {
  profile: Omit<SoulmateProfile, "promptTraits">;
  image: string | null;
  source: "ai" | "none";
};

const STYLE_OPTIONS = [
  {
    value: "pencil",
    title: "Bút chì",
    note: "Nét chì mảnh trên giấy trắng",
    image: "/images/phac-hoa-sample.jpg",
    icon: PencilLine,
    locked: false,
  },
  {
    value: "realistic",
    title: "Người thật",
    note: "Chân dung chân thực như ảnh chụp",
    image: "/images/phac-hoa-real-sample.jpg",
    icon: Sparkles,
    locked: true,
  },
] as const satisfies readonly { value: PortraitStyle; title: string; note: string; image: string; icon: unknown; locked: boolean }[];

const TARGETS = [
  { value: "Nam", label: "Bạn trai", note: "Vẽ chàng trai dành cho bạn" },
  { value: "Nữ", label: "Bạn gái", note: "Vẽ cô gái dành cho bạn" },
] as const;

/** Thu nhỏ ảnh ở trình duyệt (cạnh dài 768px, JPEG) trước khi gửi, để nhẹ và nhanh. */
async function shrinkPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 768 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  // JPEG không có kênh trong suốt: lót nền trắng, nếu không ảnh PNG trong suốt sẽ thành nền đen
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function PhacHoaFlow() {
  const [result, setResult] = useState<Result | null>(null);
  const [target, setTarget] = useState<"Nam" | "Nữ">("Nữ");
  const [style, setStyle] = useState<PortraitStyle>("pencil");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  /** Chân dung người thật chưa mở — báo bằng toast, đồng thời đếm lượt quan tâm */
  function premiumNotice(from: string) {
    track("phac_hoa_premium_click", { from });
    setToast("Chân dung người thật chưa được hỗ trợ. Lunara sẽ mở tính năng này sớm nhé!");
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useRelatedTools(result ? "phac-hoa" : null);

  async function onPhoto(file: File | undefined) {
    setPhotoError("");
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) return setPhotoError("Hãy chọn ảnh JPG, PNG hoặc WebP.");
    if (file.size > 15 * 1024 * 1024) return setPhotoError("Ảnh lớn quá (tối đa 15MB).");
    try {
      setPhoto(await shrinkPhoto(file));
      track("phac_hoa_photo_added");
    } catch {
      setPhotoError("Không đọc được ảnh này, bạn thử ảnh khác nhé.");
    }
  }

  async function submit(form: HTMLFormElement) {
    if (style !== "pencil") return premiumNotice("submit");
    const data = new FormData(form);
    setLoading(true);
    setError("");
    track("phac_hoa_submit", { target, withPhoto: photo ? 1 : 0 });
    try {
      const response = await fetch("/api/phac-hoa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(data.get("fullName") || "").trim(),
          birthDate: String(data.get("birthDate") || ""),
          gender: String(data.get("gender") || "Nam"),
          target,
          style,
          ...(photo ? { photo } : {}),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Chưa phác hoạ được, bạn thử lại nhé.");
      setResult(payload);
      track(payload.image ? "phac_hoa_result_view" : "phac_hoa_no_image");
      track("experience_complete", { method: "phac-hoa" });
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (err) {
      setError((err as Error).message);
      track("phac_hoa_error");
    } finally {
      setLoading(false);
    }
  }

  if (!result) {
    return (
      <div className="flow-body phac-hoa-flow is-configuring">
        <ValidatedForm className="tuvi-form tarot-setup-panel" onValidSubmit={(form) => void submit(form)}>
          <FormIntro>
            Dựa vào họ tên, ngày sinh và cung hoàng đạo của bạn, Lunara phác hoạ gương mặt người dành cho bạn.
          </FormIntro>

          <label>Họ và tên
            <IconField icon={UserRound} name="fullName" required maxLength={80} placeholder="Nguyễn Văn An" />
          </label>
          <div className="tuvi-grid">
            <label>Ngày sinh (dương lịch)
              <IconField icon={CalendarDays} type="date" name="birthDate" required min="1900-01-01" max="2100-12-31" />
            </label>
            <label>Giới tính của bạn
              <IconSelect icon={VenusAndMars} name="gender" required placeholder="Chọn giới tính" options={["Nam", "Nữ"]} />
            </label>
          </div>

          <p className="mt-6! text-[12px] font-medium text-[#654280]">Bạn muốn vẽ</p>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Bạn muốn vẽ">
            {TARGETS.map((t) => (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={target === t.value}
                onClick={() => setTarget(t.value)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition-colors",
                  target === t.value
                    ? "border-[#ac88cf] bg-[#eae0f7]"
                    : "border-[#e4d6f2] bg-[#f6f0fd] hover:border-[#c9a9e0]",
                )}
              >
                <span className="block font-[family-name:var(--font-serif-app)] text-[20px] text-[#221c2b]">{t.label}</span>
                <span className="block text-[12px] text-[#4a4257]">{t.note}</span>
              </button>
            ))}
          </div>

          <p className="mt-6! text-[12px] font-medium text-[#654280]">
            Chân dung của bạn <span className="font-normal text-[#8a7d99]">không bắt buộc</span>
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="user"
            className="hidden"
            onChange={(e) => void onPhoto(e.target.files?.[0])}
          />
          {photo ? (
            <div className="mt-2 flex items-center gap-4 rounded-2xl border border-[#e4d6f2] bg-[#f6f0fd] p-3 sm:gap-5 sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt="Chân dung bạn vừa tải lên"
                className="aspect-square w-[96px] shrink-0 rounded-[16px] object-cover shadow-[0_10px_26px_#5b3f7a33] ring-4 ring-white sm:w-[132px] sm:rounded-[20px]"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[14px] font-medium text-[#221c2b]">
                  <Check size={16} className="text-[#3c6b45]" /> Đã thêm chân dung
                </p>
                <p className="mt-1! text-[13px] leading-[1.6] text-[#4a4257]">
                  Lunara sẽ đọc nét tướng của bạn để chọn người ấy có nét hợp với bạn.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#ac88cf] bg-white px-4 text-[13px] font-medium text-[#5b3f7a] hover:bg-[#f6f0fd]"
                  >
                    <ImagePlus size={15} /> Đổi ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#4a4257] hover:bg-[#eae0f7]"
                  >
                    <X size={15} /> Bỏ ảnh
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-2 flex w-full items-center gap-4 rounded-2xl border border-dashed border-[#c9a9e0] bg-[#fbf8ff] p-4 text-left hover:bg-[#f6f0fd]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eae0f7] text-[#5b3f7a]">
                <ImagePlus size={22} />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-[#221c2b]">Tải ảnh chân dung lên</span>
                <span className="block text-[12px] text-[#4a4257]">
                  Ảnh chính diện, đủ sáng. Lunara đọc nét tướng của bạn để tìm người hợp tướng.
                </span>
              </span>
              <Camera size={18} className="ml-auto text-[#8a7d99]" />
            </button>
          )}
          {photoError ? <p className="tuvi-form-error" role="alert">{photoError}</p> : null}

          <p className="mt-6! text-[12px] font-medium text-[#654280]">Kiểu vẽ</p>
          <div className="mt-2 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Kiểu vẽ">
            {STYLE_OPTIONS.map((o) => {
              const selected = style === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    if (o.locked) return premiumNotice("form");
                    setStyle(o.value);
                  }}
                  className={cn(
                    "group relative aspect-[3/4] overflow-hidden sm:aspect-[5/4] rounded-[22px] text-left transition-all duration-300",
                    selected
                      ? "shadow-[0_18px_40px_#5b3f7a40] ring-[3px] ring-[#d9b46a] ring-offset-2 ring-offset-[#fdfbff]"
                      : "shadow-[0_10px_26px_#5b3f7a1f] ring-1 ring-[#e4d6f2] hover:-translate-y-0.5 hover:ring-[#c9a9e0]",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[50%_30%] transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#1d1133]/90 via-[#1d1133]/35 to-transparent" />

                  {o.locked ? (
                    <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#f6d98c] to-[#e2b25e] px-2.5 py-1 text-[10px] sm:top-3 sm:left-3 sm:gap-1.5 sm:px-3 sm:text-[11px] font-semibold tracking-wide text-[#3a2a0c] shadow-[0_4px_14px_#00000033]">
                      <Crown size={12} /> TRẢ PHÍ
                    </span>
                  ) : (
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] sm:top-3 sm:left-3 sm:px-3 sm:text-[11px] font-semibold tracking-wide text-[#3c6b45] shadow-[0_4px_14px_#00000022]">
                      MIỄN PHÍ
                    </span>
                  )}
                  <span
                    className={cn(
                      "absolute top-2.5 right-2.5 flex h-7 w-7 sm:top-3 sm:right-3 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-colors",
                      o.locked ? "bg-[#1d1133]/55 text-white backdrop-blur" : selected ? "bg-[#d9b46a] text-[#1d1133]" : "bg-white/70 text-transparent",
                    )}
                  >
                    {o.locked ? <LockKeyhole size={15} /> : <Check size={16} strokeWidth={2.5} />}
                  </span>

                  <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <span className="flex items-center gap-2 font-[family-name:var(--font-serif-app)] text-[21px] leading-none text-white sm:text-[26px]">
                      <o.icon size={20} /> {o.title}
                    </span>
                    <span className="mt-1.5 hidden text-[12px] leading-snug text-white/80 sm:block">{o.note}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <Button className="tuvi-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? "Đang phác hoạ người thương… (khoảng 30 giây)" : "Phác hoạ người thương"}
            {loading ? null : <ArrowRight size={18} />}
          </Button>
          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="inline align-[-2px] mr-1" />
            Thông tin và ảnh chỉ dùng để phác hoạ, không lưu lại trên máy chủ.
          </p>
        </ValidatedForm>

        <section className="tarot-introduction" aria-label="Tìm hiểu về Phác hoạ người ấy">
          <div className="tarot-introduction-body">
            <div className="tarot-introduction-context">
              <section>
                <h2>Phác hoạ người ấy là gì?</h2>
                <p>
                  Một trò chơi chiêm nghiệm quen thuộc: từ cung hoàng đạo và nguyên tố của bạn,
                  Lunara chọn những nét tính cách và gương mặt bổ trợ cho bạn, rồi phác lại bằng nét chì.
                  Nếu bạn gửi kèm chân dung, Lunara đọc thêm nét tướng để chọn người hợp tướng.
                </p>
              </section>
              <section>
                <h2>Xem để làm gì?</h2>
                <p>
                  Để vui, và để tự hỏi mình đang tìm kiếm điều gì ở một người. Bức vẽ do AI tạo,
                  không phải ảnh của một người có thật.
                </p>
              </section>
            </div>
          </div>
        </section>
      {toast ? (
        <div className="toast" role="status">
          <Info size={17} />
          {toast}
          <button type="button" aria-label="Đóng thông báo" onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      ) : null}
      </div>
    );
  }

  const p = result.profile;
  const who = p.target === "Nam" ? "Chàng trai" : "Cô gái";
  return (
    <div className="tarot-setup-panel">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">PHÁC HOẠ NGƯỜI ẤY</p>
          <h2 className="mt-1 text-[30px] leading-tight text-[#1d1133]">{who} dành cho bạn</h2>
        </div>
        <Button variant="outline" onClick={() => { track("phac_hoa_restart"); setResult(null); }}>
          <RotateCcw size={15} /> Vẽ lại
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="rounded-[20px] border border-[#e8ddef] bg-white p-3 shadow-[0_20px_50px_#5b3f7a22]">
            {result.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.image} alt={`Bản phác chì ${who.toLowerCase()} dành cho bạn`} className="aspect-square w-full rounded-[14px] object-cover" />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-[14px] bg-[#f7f6f3] p-6 text-center text-[14px] text-[#4a4257]">
                <PencilLine size={32} />
                Hôm nay Lunara chưa vẽ được bức phác hoạ. Bạn vẫn có thể đọc chân dung người ấy bên cạnh, và thử vẽ lại sau ít phút.
              </div>
            )}
          </div>
          {result.image ? (
            <div className="mt-4 flex justify-center">
              <a
                href={result.image}
                download="nguoi-thuong-lunara.jpg"
                onClick={() => track("phac_hoa_download")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#765091] px-8 text-[16px] font-medium text-white shadow-[0_10px_22px_#7650913b] transition-transform hover:-translate-y-0.5"
              >
                <Download size={18} /> Tải ảnh
              </a>
            </div>
          ) : null}

          {/* Gợi ý bản người thật (trả phí) */}
          <button
            type="button"
            onClick={() => premiumNotice("result")}
            className="mt-4 flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-[#e9d6a8] bg-[#fdf7e8] p-3 text-left hover:border-[#d9bb73]"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eadfc4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/phac-hoa-real-sample.jpg" alt="" className="h-full w-full scale-110 object-cover blur-[3px]" />
              <LockKeyhole size={20} className="absolute inset-0 m-auto text-white drop-shadow" />
            </span>
            <span className="flex-1">
              <span className="block text-[15px] font-medium text-[#221c2b]">Xem người ấy ngoài đời thật</span>
              <span className="block text-[12px] text-[#6b5a35]">Chân dung chân thực từ chính bản phác này · Trả phí</span>
            </span>
            <ArrowRight size={18} className="text-[#7a5a1e]" />
          </button>
        </div>

        <div className="space-y-4 text-[#2e2838]">
          <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
            <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Người ấy</p>
            <p className="mt-2! font-[family-name:var(--font-serif-app)] text-[24px] text-[#221c2b]">
              Cung {p.sign} · nguyên tố {p.element}
            </p>
            <p className="mt-1! text-[14px] leading-[1.7]">Tính cách {p.vibe}. Trạc tuổi {p.age}.</p>
            <p className="mt-2! text-[13px] leading-[1.7] text-[#4a4257]">{p.why}</p>
          </div>

          {p.faceMatch ? (
            <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
              <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Hợp tướng với bạn</p>
              {p.faceMatch.yours.vibe ? <p className="mt-2! text-[14px] leading-[1.7]">{p.faceMatch.yours.vibe}</p> : null}
              <p className="mt-1! text-[13px] leading-[1.7] text-[#4a4257]">{p.faceMatch.text}</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
            <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Gương mặt</p>
            <ul className="mt-2 space-y-1.5 text-[14px] leading-[1.6]">
              {p.traits.map((t) => (
                <li key={t} className="flex gap-2"><span className="text-[#b0915f]">✦</span>{t}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
            <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Dấu hiệu nhận ra</p>
            <p className="mt-2! text-[14px] leading-[1.7]">Có thể hai bạn gặp nhau ở {p.place}.</p>
            <p className="mt-1! text-[14px] leading-[1.7]">{p.firstImpression}</p>
          </div>
        </div>
      </div>
      {toast ? (
        <div className="toast" role="status">
          <Info size={17} />
          {toast}
          <button type="button" aria-label="Đóng thông báo" onClick={() => setToast("")}>
            <X size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
