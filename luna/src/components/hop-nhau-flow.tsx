"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  Heart,
  LockKeyhole,
  MapPin,
  RotateCcw,
  Send,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError, IconField, SearchSelect, FormIntro, ValidatedForm } from "@/components/form-field";
import { CITY_ALIASES } from "@/lib/dating-shared";
import { useRelatedTools } from "@/components/related-tools";
import { compatibility, decodePerson, encodePerson, firstName, type Compatibility, type Gender, type Person, type PersonProfile } from "@/lib/hop-nhau";
import { track } from "@/lib/analytics";
import { traitCards } from "@/lib/love-traits";
import { cn } from "@/lib/utils";

/**
 * "Xem độ hợp đôi" (trước là "Hợp nhau bao nhiêu %"). Mặc định tự nhập cả hai người; vẫn có thể gửi link cho người ấy tự điền.
 *
 * Vòng lặp: A nhập thông tin → nhận link riêng → gửi người ấy. Người ấy mở link chỉ
 * thấy "?%" bị khoá, phải nhập ngày sinh của mình mới mở được. Ở trang kết quả,
 * người ấy có nút "Gửi kết quả cho A" và "Thử với người khác" → thành A mới.
 *
 * Trạng thái nằm hết trong URL (`?m=` người mời, `&b=` người được mời), không lưu
 * server: link nào cũng mở lại được kết quả, và trang server dựng được ảnh xem trước.
 */

const ME_KEY = "luna.hopnhau.me";

function readMe(): Person | null {
  try {
    const raw = localStorage.getItem(ME_KEY);
    return raw ? (JSON.parse(raw) as Person) : null;
  } catch {
    return null;
  }
}
function writeMe(p: Person) {
  try {
    localStorage.setItem(ME_KEY, JSON.stringify(p));
  } catch {
    /* chế độ ẩn danh: bỏ qua */
  }
}

function urlFor(a: Person, b?: Person) {
  const params = new URLSearchParams({ m: encodePerson(a) });
  if (b) params.set("b", encodePerson(b));
  return `${window.location.origin}/hop-nhau?${params}`;
}

/** Mở bảng chia sẻ của máy (Zalo, Messenger…), không có thì chép link. */
export async function shareLink(url: string, text: string): Promise<"shared" | "copied" | "cancel"> {
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "cancel";
    }
  }
  await navigator.clipboard.writeText(`${text} ${url}`);
  return "copied";
}

function personFrom(form: HTMLFormElement, prefix: string): Person {
  const data = new FormData(form);
  const g = String(data.get(`${prefix}Gender`) || "");
  return {
    name: String(data.get(`${prefix}Name`) || "").trim(),
    birthDate: String(data.get(`${prefix}Date`) || ""),
    gender: g === "nam" || g === "nu" ? g : null,
  };
}

export function HopNhauFlow({ inviteToken, partnerToken }: { inviteToken?: string; partnerToken?: string }) {
  const inviter = useMemo(() => decodePerson(inviteToken), [inviteToken]);
  const partner = useMemo(() => decodePerson(partnerToken), [partnerToken]);
  const [pair, setPair] = useState<{ a: Person; b: Person } | null>(() => (inviter && partner ? { a: inviter, b: partner } : null));
  const [link, setLink] = useState<{ me: Person; url: string } | null>(null);
  // Vừa mở khoá từ link mời → nút chính là "Gửi kết quả cho <người mời>"
  const [justInvited, setJustInvited] = useState(false);

  useEffect(() => {
    if (inviter && partner) track("hop_nhau_result_view", { source: "link" });
    else if (inviter) track("hop_nhau_invite_view");
  }, [inviter, partner]);

  const result = useMemo(() => (pair ? safeCompat(pair.a, pair.b) : null), [pair]);
  useRelatedTools(result ? "hop-nhau" : null);

  function showPair(a: Person, b: Person, source: string) {
    setPair({ a, b });
    window.history.replaceState(null, "", urlFor(a, b).replace(window.location.origin, ""));
    window.scrollTo({ top: 0, behavior: "auto" });
    track("hop_nhau_result_view", { source });
    track("experience_complete", { method: "hop-nhau" });
  }

  function restart() {
    setPair(null);
    setJustInvited(false);
    setLink(null);
    window.history.replaceState(null, "", "/hop-nhau");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (pair && result) return <ResultView result={result} pair={pair} invited={justInvited} onRestart={restart} />;
  if (link) return <LinkReady link={link} onRestart={restart} />;
  if (inviter)
    return (
      <InviteForm
        inviter={inviter}
        onSubmit={(b) => {
          writeMe(b);
          setJustInvited(true);
          track("hop_nhau_invite_complete");
          showPair(inviter, b, "invite");
        }}
      />
    );
  return (
    <StartForm
      onLink={(a) => {
        writeMe(a);
        setLink({ me: a, url: urlFor(a) });
        track("hop_nhau_link_create");
        window.scrollTo({ top: 0, behavior: "auto" });
      }}
      onBoth={(a, b) => {
        writeMe(a);
        showPair(a, b, "self");
      }}
    />
  );
}

function safeCompat(a: Person, b: Person) {
  try {
    return compatibility(a, b);
  } catch {
    return null;
  }
}

// ───────────────────────── Form bắt đầu ─────────────────────────

/**
 * `prefillExcept`: điền sẵn thông tin của chính mình từ lần trước (localStorage), trừ khi
 * trùng tên người mời. Ghi thẳng vào DOM sau khi mount — đọc localStorage lúc render
 * sẽ lệch HTML với server.
 */
export function PersonFields({
  prefix,
  who,
  prefill,
  prefillExcept,
  nameOptional,
  cities,
}: {
  prefix: string;
  who: string;
  prefill?: boolean;
  prefillExcept?: string;
  /** Hồ sơ duyên: người ghép có thể để trống tên (ẩn danh). */
  nameOptional?: boolean;
  /** Hồ sơ duyên: thêm ô chọn tỉnh/thành đang sống (không bắt buộc). */
  cities?: readonly string[];
}) {
  const [gender, setGender] = useState<Gender | "">("");
  const filled = useRef(false);
  // Callback ref chạy một lần sau khi gắn vào DOM: điền sẵn rồi thôi.
  const prefillRef = (box: HTMLSpanElement | null) => {
    if (!box || filled.current) return;
    filled.current = true;
    const form = box.closest("form");
    const me = prefill ? readMe() : null;
    if (!form || !me || me.name === prefillExcept) return;
    const name = form.elements.namedItem(`${prefix}Name`) as HTMLInputElement | null;
    const date = form.elements.namedItem(`${prefix}Date`) as HTMLInputElement | null;
    if (name && !name.value) name.value = me.name;
    if (date && !date.value) date.value = me.birthDate;
    if (me.gender) setGender(me.gender);
  };
  return (
    <>
      <span ref={prefillRef} hidden />
      <label>{who === "bạn" ? "Họ tên của bạn" : `Họ tên ${who}`}{nameOptional ? <span className="font-normal text-[#8a7b99]"> (để trống nếu muốn ẩn danh)</span> : null}
        <IconField icon={UserRound} name={`${prefix}Name`} required={!nameOptional} maxLength={60} placeholder={who === "bạn" ? "Nguyễn Minh Anh" : "Trần Gia Huy"} />
      </label>
      <label className="mt-4 block">{who === "bạn" ? "Ngày sinh của bạn" : `Ngày sinh ${who}`}
        <IconField icon={CalendarDays} type="date" name={`${prefix}Date`} required min="1940-01-01" max="2025-12-31" />
      </label>
      <GenderChips name={`${prefix}Gender`} value={gender} onChange={setGender} label={who === "bạn" ? "Giới tính của bạn" : `Giới tính ${who}`} />
      {cities ? (
        <label className="mt-4 block">Bạn đang sống ở <span className="font-normal text-[#8a7b99]">(không bắt buộc)</span>
          <SearchSelect icon={MapPin} name={`${prefix}City`} placeholder="Gõ để tìm tỉnh, thành" options={cities} aliases={CITY_ALIASES} />
        </label>
      ) : null}
    </>
  );
}

/** Chọn nhanh giới tính — không bắt buộc; có thì tính thêm Cung mệnh. */
export function GenderChips({ name, value, onChange, label }: { name: string; value: Gender | ""; onChange: (g: Gender | "") => void; label: string }) {
  return (
    <div className="mt-4" data-field={name}>
      <span className="block text-[13px] font-medium text-[#3d2f4f]">{label} <span className="font-normal text-[#8a7b99]">(để tính thêm cung mệnh)</span></span>
      <input type="hidden" name={name} value={value} />
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-3 gap-2">
        {([["nam", "Nam"], ["nu", "Nữ"], ["", "Không nói"]] as const).map(([key, text]) => (
          <button
            key={text}
            type="button"
            role="radio"
            aria-checked={value === key}
            onClick={() => onChange(key)}
            className={cn(
              "h-10 rounded-full border text-[13px]! transition-colors",
              value === key ? "border-[#ac88cf] bg-[#eae0f7] text-[#221c2b]" : "border-[#e4d6f2] bg-[#f6f0fd] text-[#5b4a6b] hover:border-[#c9a9e0]",
            )}
          >
            {text}
          </button>
        ))}
      </div>
      <FieldError name={name} />
    </div>
  );
}

function StartForm({ onLink, onBoth }: { onLink: (a: Person) => void; onBoth: (a: Person, b: Person) => void }) {
  const [mode, setMode] = useState<"invite" | "both">("both");
  return (
    <div className="flow-body is-configuring">
      <ValidatedForm
        className="tuvi-form tarot-setup-panel"
        onValidSubmit={(form) => (mode === "invite" ? onLink(personFrom(form, "a")) : onBoth(personFrom(form, "a"), personFrom(form, "b")))}
      >
        <FormIntro>
          Ghép con giáp, ngũ hành, cung hoàng đạo và Thần số học của hai người thành một con số. Nhập thông tin
          hai người để xem ngay, hoặc gửi link để người ấy tự điền phần của họ.
        </FormIntro>

        <div role="radiogroup" aria-label="Cách xem" className="mb-5 grid grid-cols-2 gap-2">
          {([
            ["both", UsersRound, "Tự nhập cả hai"],
            ["invite", Send, "Gửi link cho người ấy"],
          ] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={mode === key}
              onClick={() => setMode(key)}
              className={cn(
                "flex h-12 items-center justify-center gap-2 rounded-full border px-3 text-[14px]! font-medium transition-colors",
                mode === key ? "border-[#ac88cf] bg-[#eae0f7] text-[#221c2b]" : "border-[#e4d6f2] bg-[#f6f0fd] text-[#5b4a6b] hover:border-[#c9a9e0]",
              )}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <PersonFields prefix="a" who="bạn" prefill />

        {mode === "both" ? (
          <div className="mt-6 border-t border-dashed border-[#e4d6f2] pt-5">
            <PersonFields prefix="b" who="người ấy" />
          </div>
        ) : (
          <p className="tuvi-note">
            Người ấy mở link sẽ thấy kết quả đang bị khoá — nhập ngày sinh là mở được, không cần tài khoản.
          </p>
        )}

        <Button className="tuvi-submit" type="submit">
          {mode === "invite" ? "Tạo link gửi người ấy" : "Xem độ hợp đôi"}
          <ArrowRight size={18} />
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
          Không lưu trên máy chủ. Link chỉ chứa tên và ngày sinh để tính ra kết quả.
        </p>
      </ValidatedForm>
      <HowItWorks />
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="tarot-introduction" aria-label="Cách tính độ hợp nhau">
      <div className="tarot-introduction-body">
        <div className="tarot-introduction-context">
          <section>
            <h2>Xem hợp nhau bằng gì?</h2>
            <p>
              Bốn góc nhìn quen thuộc: con giáp (tam hợp, lục hợp hay lục xung), ngũ hành theo năm sinh, nhóm nguyên
              tố của cung hoàng đạo, và Số Đường Đời trong Thần số học. Mỗi góc chấm một điểm, gộp lại thành con số
              cuối cùng.
            </p>
          </section>
          <section>
            <h2>Điểm thấp có sao không?</h2>
            <p>
              Không. Điểm chỉ nói hai bạn giống hay khác nhau ở đâu. Cặp khác nhau nhiều thường là cặp học được ở nhau
              nhiều nhất — kết quả luôn kèm gợi ý nên làm gì cùng nhau.
            </p>
          </section>
        </div>
        <section className="tarot-introduction-steps">
          <h2>Bốn bước</h2>
          <ol>
            <li><strong>Nhập thông tin hai người</strong><span>Họ tên và ngày sinh dương lịch.</span></li>
            <li><strong>Xem điểm hợp đôi</strong><span>Tính ngay tại chỗ, không cần tài khoản.</span></li>
            <li><strong>Đọc chi tiết</strong><span>Điểm hợp, chỗ dễ lệch và việc nên làm cùng nhau.</span></li>
            <li><strong>Gửi cho người ấy</strong><span>Không biết ngày sinh của họ? Gửi link để họ tự điền.</span></li>
          </ol>
        </section>
      </div>
    </section>
  );
}

// ───────────────────────── Link đã tạo ─────────────────────────

function LinkReady({ link, onRestart }: { link: { me: Person; url: string }; onRestart: () => void }) {
  const [status, setStatus] = useState<"" | "copied" | "shared">("");
  const text = `${firstName(link.me.name)} muốn biết hai bạn hợp nhau bao nhiêu % 👀 Nhập ngày sinh của bạn để mở kết quả nhé:`;
  async function share() {
    const r = await shareLink(link.url, text);
    if (r !== "cancel") setStatus(r);
    track("hop_nhau_link_share", { method: r });
  }
  async function copy() {
    await navigator.clipboard.writeText(link.url);
    setStatus("copied");
    track("hop_nhau_link_share", { method: "copy" });
  }
  return (
    <div className="tarot-setup-panel text-center">
      <LockedScore name={firstName(link.me.name)} />
      <h2 className="mt-6! font-[family-name:var(--font-serif-app)]! text-[28px]! leading-tight text-[#281b44]">Link của bạn đã sẵn sàng</h2>
      <p className="mx-auto mt-2! max-w-[440px] text-[14px] leading-[1.7] text-[#6a5c7a]">
        Gửi cho crush, người yêu hay bạn thân. Khi người ấy nhập ngày sinh, kết quả mở ra cho người ấy, kèm nút gửi lại
        cho bạn.
      </p>
      <div className="mx-auto mt-6 flex max-w-[480px] items-center gap-2 rounded-full border border-[#e4d6f2] bg-[#fdfafc] py-1 pr-1 pl-4">
        <span className="min-w-0 flex-1 truncate text-left text-[13px] text-[#6a5c7a]">{link.url}</span>
        <Button variant="outline" onClick={() => void copy()} className="rounded-full!">
          {status === "copied" ? <Check size={16} /> : <Copy size={16} />} {status === "copied" ? "Đã chép" : "Chép link"}
        </Button>
      </div>
      <Button className="tuvi-submit mx-auto! max-w-[480px]!" onClick={() => void share()}>
        <Send size={18} /> Gửi cho người ấy
      </Button>
      {status === "shared" ? <p className="mt-3! text-[13px] text-[#2f5d38]">Đã gửi! Gửi thêm cho người khác cũng được.</p> : null}
      <button type="button" onClick={onRestart} className="mt-5 text-[13px]! text-[#6a5c7a] underline underline-offset-4">
        Sửa thông tin của bạn
      </button>
    </div>
  );
}

function LockedScore({ name }: { name: string }) {
  return (
    <div className="mx-auto flex h-40 w-40 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fbe7f1,#eadcf8_60%,#dccbf2)] shadow-[0_16px_40px_#6b4b8233]">
      <LockKeyhole size={24} className="text-[#6e4a92]" />
      <span className="mt-1 font-[family-name:var(--font-sans-app)] text-[44px] leading-none font-bold text-[#4b2a6e]">?%</span>
      <span className="mt-1 text-[12px] text-[#6e4a92]">{name} & bạn</span>
    </div>
  );
}

// ───────────────────────── Người được mời ─────────────────────────

function InviteForm({ inviter, onSubmit }: { inviter: Person; onSubmit: (b: Person) => void }) {
  const name = firstName(inviter.name);
  return (
    <div className="flow-body is-configuring">
      <ValidatedForm className="tuvi-form tarot-setup-panel" onValidSubmit={(form) => onSubmit(personFrom(form, "b"))}>
        <LockedScore name={name} />
        <h2 className="mt-6! text-center font-[family-name:var(--font-serif-app)]! text-[26px]! leading-tight text-[#281b44]">
          {name} muốn biết hai bạn hợp nhau bao nhiêu %
        </h2>
        <p className="mx-auto mt-2! mb-6! max-w-[420px] text-center text-[14px] leading-[1.7] text-[#6a5c7a]">
          {name} đã điền phần của mình. Nhập họ tên và ngày sinh của bạn để mở kết quả.
        </p>
        <PersonFields prefix="b" who="bạn" prefill prefillExcept={inviter.name} />
        <Button className="tuvi-submit" type="submit">
          <Heart size={18} /> Mở kết quả
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
          Không cần tài khoản, không lưu trên máy chủ. Trang kết quả chỉ hiện tên, không hiện ngày sinh.
        </p>
      </ValidatedForm>
    </div>
  );
}

// ───────────────────────── Kết quả ─────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 176 176" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="88" cy="88" r={r} fill="none" stroke="#efe5f8" strokeWidth="12" />
        <circle cx="88" cy="88" r={r} fill="none" stroke="url(#hn-grad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(c * score) / 100} ${c}`} />
        <defs>
          <linearGradient id="hn-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e889b5" />
            <stop offset="100%" stopColor="#6e4a92" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-sans-app)] text-[48px] leading-none font-bold text-[#3a1f5c]">{score}%</span>
        <span className="mt-1 text-[12px] tracking-[0.12em] text-[#8a6fa3] uppercase">hợp nhau</span>
      </div>
    </div>
  );
}

/** Phần đầu kết quả: tên hai người, vòng điểm, tiêu đề. Dùng chung với Se duyên. */
export function CompatibilityHeader({ result }: { result: Compatibility }) {
  const { a, b } = result;
  return (
      <div className="text-center">
        <p className="eyebrow">HỢP NHAU BAO NHIÊU %</p>
        <p className="mt-2! font-[family-name:var(--font-serif-app)] text-[24px] text-[#281b44]">
          {a.firstName} <Heart size={18} className="mx-1 inline align-[-1px] text-[#e889b5]" fill="#e889b5" /> {b.firstName}
        </p>
        <div className="mt-5"><ScoreRing score={result.score} /></div>
        <h2 className="mt-5! font-[family-name:var(--font-serif-app)]! text-[32px]! leading-tight text-[#281b44]">{result.headline}</h2>
        <p className="mt-1! text-[15px] text-[#6a5c7a]">{result.tagline}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-[12px] text-[#5b4a6b]">
          {[a, b].map((p) => (
            <span key={p.name} className="rounded-full bg-[#f6f0fd] px-3 py-1">
              {p.firstName}: tuổi {p.conGiap} · {p.zodiac} · số {p.lifePath}{p.cungMenh ? ` · cung ${p.cungMenh}` : ""}
            </span>
          ))}
        </div>
      </div>

  );
}

/**
 * "Bản đồ duyên" của một người: bốn thẻ màu (cung, số, con giáp, mệnh) với biểu tượng lớn,
 * rồi mỗi thứ một câu ngắn "yêu ra sao" có huy hiệu cùng màu — lướt mắt là nắm được.
 */
export function LovePortrait({
  person,
  title,
  tilesOnly,
  twoCols,
}: {
  person: PersonProfile;
  title?: string;
  tilesOnly?: boolean;
  /** Luôn xếp 2×2 (khung hẹp như xem trước) thay vì 4 thẻ một hàng trên màn rộng. */
  twoCols?: boolean;
}) {
  const cards = traitCards(person);
  return (
    <section>
      {title ? <h3 className="text-center font-[family-name:var(--font-serif-app)]! text-[24px]! text-[#281b44]">{title}</h3> : null}
      <div className={cn("mt-4 grid auto-rows-fr grid-cols-2 gap-3", tilesOnly || twoCols ? "" : "sm:grid-cols-4")}>
        {cards.map((c) => (
          <div
            key={c.key}
            className={cn("flex flex-col items-center rounded-[24px] px-3 py-4 text-center shadow-[0_8px_24px_#6b4b8214]", c.image && "pt-9")}
            // Ảnh nền có ngôi sao trang trí ở mép trên → pt-9 để nhãn không đè lên
            style={{ background: c.image ? `url(${c.image}) center / 100% 100% no-repeat` : c.tone.bg }}
          >
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase opacity-70" style={{ color: c.tone.fg }}>{c.label}</span>
            <span
              className={cn(
                "mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-[36px] leading-none font-semibold shadow-[inset_0_0_0_1px_#ffffff]",
                glyphFont(c.glyph),
                /^\d+$/.test(c.glyph) && "text-[32px]",
              )}
              style={{ color: c.tone.fg }}
            >
              {c.glyph}
            </span>
            <span className="mt-2 text-[15px] font-semibold leading-tight" style={{ color: c.tone.fg }}>{c.value}</span>
            {c.tags.length ? (
              <span className="mt-2 flex flex-wrap justify-center gap-1">
                {c.tags.map((t) => (
                  <span key={t} className="rounded-full bg-white/60 px-2 py-0.5 text-[11px]" style={{ color: c.tone.fg }}>{t}</span>
                ))}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {tilesOnly ? null : <ul className="mt-4 flex flex-col gap-2 text-left">
        {cards.map((c) => (
          <li key={c.key} className="flex items-center gap-3 rounded-2xl border border-[#efe4f7] bg-white/85 px-4 py-3 shadow-[0_4px_16px_#6b4b8212] backdrop-blur-sm">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold", glyphFont(c.glyph))} style={{ background: c.tone.bg, color: c.tone.fg }}>
              {c.glyph}
            </span>
            <span className="min-w-0 flex-1 text-[15px] leading-[1.6] text-[#4a4257]"><strong className="font-semibold text-[#3a1f5c]">{c.value}:</strong> {c.love}</span>
          </li>
        ))}
      </ul>}
    </section>
  );
}

/** Con số dùng font không chân (Cormorant vẽ số 1 giống chữ I); ký hiệu cung, chữ Hán dùng font có chân. */
const glyphFont = (glyph: string) => (/^\d+$/.test(glyph) ? "font-[family-name:var(--font-sans-app)]" : "font-[family-name:var(--font-serif-app)]");

const ASPECT_ICON: Record<string, string> = { "con-giap": "🐾", "ngu-hanh": "☯", cung: "✦", "than-so-hoc": "#", "cung-menh": "☰" };

/** Hai người đặt đối diện theo từng hệ: A — tên hệ — B. Dùng trong trang kết quả. */
function PairBoard({ a, b }: { a: PersonProfile; b: PersonProfile }) {
  const ca = traitCards(a);
  const cb = traitCards(b);
  const Tile = ({ c }: { c: (typeof ca)[number] }) => (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center sm:flex-row sm:gap-2 sm:px-3 sm:py-2 sm:text-left" style={{ background: c.tone.bg }}>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-[20px] font-semibold", glyphFont(c.glyph))} style={{ color: c.tone.fg }}>{c.glyph}</span>
      <span className="text-[13px] leading-tight font-semibold" style={{ color: c.tone.fg }}>{c.value}</span>
    </div>
  );
  return (
    <section className="mt-8">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 text-center">
        <span className="truncate text-[15px] font-semibold text-[#3a1f5c]">{a.firstName}</span>
        <Heart size={16} className="mb-1 text-[#e889b5]" fill="#e889b5" />
        <span className="truncate text-[15px] font-semibold text-[#3a1f5c]">{b.firstName}</span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {ca.map((c, i) => (
          <div key={c.key} className="flex items-center gap-2">
            <Tile c={c} />
            <span className="w-14 shrink-0 text-center text-[10px] leading-tight tracking-[0.06em] text-[#8a7b99] uppercase">{c.label}</span>
            <Tile c={cb[i]} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Các góc nhìn, điểm hợp, chỗ dễ lệch, việc nên làm. Dùng chung với Se duyên. */
export function CompatibilityDetails({ result }: { result: Compatibility }) {
  return (
    <>
      <PairBoard a={result.a} b={result.b} />
      <section className="mt-8">
        <h3 className="font-[family-name:var(--font-serif-app)]! text-[21px]! text-[#281b44]">{result.aspects.length === 5 ? "Năm" : "Bốn"} góc nhìn</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {result.aspects.map((x) => (
            <div key={x.key} className="rounded-2xl border border-[#ece2f4] bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[14px] font-semibold text-[#3a1f5c]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3eafb] text-[15px] text-[#6e4a92]">{ASPECT_ICON[x.key]}</span>
                  {x.label}
                </span>
                <span className="text-[14px] font-semibold text-[#6e4a92]">{x.score}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[#efe5f8]">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,#e889b5,#6e4a92)]" style={{ width: `${x.score}%` }} />
              </div>
              <p className="mt-3! text-[13px] leading-[1.7] text-[#5b5276]">{x.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="rounded-2xl bg-[#fdf1e4] p-4">
          <h3 className="flex items-center gap-2 text-[15px]! font-semibold text-[#8a5a1f]"><Heart size={16} /> Chỗ dễ lệch nhau</h3>
          <p className="mt-2! text-[13px] leading-[1.7] text-[#5c4630]">{result.friction}</p>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-[#e4d6f2] bg-[#f8f3fd] p-4">
        <h3 className="text-[15px]! font-semibold text-[#3a1f5c]">Nên làm gì cùng nhau tuần này</h3>
        <ul className="mt-2 space-y-2 text-[13px] leading-[1.7] text-[#5b5276]">
          {result.todo.map((t) => (
            <li key={t} className="flex gap-2"><Check size={16} className="mt-1 shrink-0 text-[#6e4a92]" /> {t}</li>
          ))}
        </ul>
      </section>


    </>
  );
}

function ResultView({ result, pair, invited, onRestart }: { result: Compatibility; pair: { a: Person; b: Person }; invited: boolean; onRestart: () => void }) {
  const [status, setStatus] = useState("");
  const { a, b } = result;
  const url = typeof window === "undefined" ? "" : urlFor(pair.a, pair.b);

  async function sendResult() {
    const text = `${a.firstName} & ${b.firstName} hợp nhau ${result.score}% — "${result.headline}" 💞 Xem chi tiết:`;
    const r = await shareLink(url, text);
    if (r === "copied") setStatus("Đã chép link kết quả");
    track("hop_nhau_result_share", { method: r });
  }

  return (
    <div className="tarot-setup-panel">
      <CompatibilityHeader result={result} />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={() => void sendResult()}>
          <Send size={16} /> {invited ? `Gửi kết quả cho ${a.firstName}` : "Gửi kết quả cho người ấy"}
        </Button>
      </div>
      {status ? <p className="mt-2! text-center text-[13px] text-[#2f5d38]">{status}</p> : null}

      <CompatibilityDetails result={result} />

      <div className="mt-8 rounded-[24px] bg-[linear-gradient(100deg,#fcf5f9,#f3e9fb)] p-5 text-center">
        <p className="text-[15px] font-medium text-[#3a1f5c]">Tò mò với người khác?</p>
        <p className="mt-1! text-[13px] text-[#6a5c7a]">Thử với crush, bạn thân hay cả người yêu cũ.</p>
        <Button
          className="mt-4"
          onClick={() => {
            track("hop_nhau_try_another");
            onRestart();
          }}
        >
          <RotateCcw size={16} /> Thử với người khác
        </Button>
      </div>

      <p className="mt-6! text-center text-[12px] text-[#8a7b99]">
        Để vui và hiểu nhau hơn, không phải lời phán. Muốn xem sâu hơn? <Link href="/tu-vi" className="underline underline-offset-2">Lập lá số Tử Vi</Link>.
      </p>
    </div>
  );
}
