"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  Copy,
  Crown,
  Download,
  Eye,
  Heart,
  HeartHandshake,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  MapPin,
  Cake,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldCheckbox, FormIntro, IconField, SearchSelect, ValidatedForm } from "@/components/form-field";
import { CompatibilityDetails, CompatibilityHeader, LovePortrait, GenderChips, PersonFields, shareLink } from "@/components/hop-nhau-flow";
import { useRelatedTools } from "@/components/related-tools";
import { checkMatchFields, defaultMatchChoice, MatchFields, Matchmaking, readContacts, type MatchChoice } from "@/components/matchmaking";
import { saveMatchSettings, type WantGender } from "@/lib/matchmaking";
import { compatibilityOf, firstName, profile, profileOf, toPublic, type Compatibility, type Gender } from "@/lib/hop-nhau";
import { normalizeName } from "@/lib/than-so-hoc";
import { ageGapText, CITIES, CITY_ALIASES, INTERESTS, joinInterests, MAX_INTERESTS, parseInterests } from "@/lib/dating-shared";
import {
  addCheck,
  createProfile,
  deleteCheck,
  deleteProfile,
  datingError,
  LOOKING_LABEL,
  manage,
  manageUrl,
  updateProfile,
  readOwned,
  rememberOwned,
  syncOwned,
  toPublicPerson,
  type CompatibilityCheck,
  type DatingProfile,
  type LookingFor,
  type OwnedProfile,
} from "@/lib/dating";
import { signInWithGoogle } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/saved-results";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Se duyên: một link hồ sơ, nhiều người ghép vào.
 *  - /duyen            tạo hồ sơ (không cần đăng nhập)
 *  - /duyen/<slug>     người xem nhập ngày sinh → thấy % hợp, lượt ghép được lưu cho chủ hồ sơ
 *  - /duyen/quan-ly    chủ hồ sơ xem "Ai hợp với mình", chia sẻ link, mời đăng nhập để giữ hồ sơ
 */

export type DatingView = { view: "home" } | { view: "manage" } | { view: "profile"; profile: DatingProfile };

export function DatingFlow(props: DatingView) {
  if (props.view === "profile") return <ProfileView profile={props.profile} />;
  if (props.view === "manage") return <ManageView />;
  return <CreateView />;
}

const profileUrl = (slug: string) => `${window.location.origin}/duyen/${slug}`;
const storyUrl = (slug: string, extra?: Record<string, string>) => `/duyen/${slug}/og?${new URLSearchParams({ format: "story", ...extra })}`;

/** Đủ 18 tuổi tính tới hôm nay, theo đúng ngày sinh (server chỉ kiểm được theo năm). Chỉ gọi lúc bấm gửi. */
function isAdult(birthDate: string) {
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return false;
  const now = new Date();
  const age = now.getFullYear() - y - (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d) ? 1 : 0);
  return age >= 18;
}
const UNDER_18 = "Hồ sơ duyên dành cho người từ 18 tuổi trở lên.";

/** Năm sinh + nơi sống — hai thứ người xem hồ sơ duyên nhìn đầu tiên. */
function MetaLine({ p }: { p: Pick<DatingProfile, "birth_year" | "lunar_year" | "city"> }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f5] px-3 py-1.5 text-[13px] font-medium text-[#9c3b66]">
        <Cake size={14} /> Sinh năm {p.birth_year ?? p.lunar_year}
      </span>
      {p.city ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3fc] px-3 py-1.5 text-[13px] font-medium text-[#2c5a91]">
          <MapPin size={14} /> {p.city}
        </span>
      ) : null}
    </div>
  );
}

type Draft = { name: string; date: string; city: string; bio: string };

/** Ngày sinh hợp lệ thì dựng hồ sơ thật (cung, số, con giáp, mệnh) từ bản nháp; chưa thì null. */
function draftProfile(d: Draft, gender: Gender | "") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return null;
  const y = Number(d.date.slice(0, 4));
  if (y < 1900 || y > 2100) return null;
  try {
    // Số Đường Đời chỉ lấy từ ngày sinh; tên tạm để hàm Thần số học có chữ cái
    return profileOf(toPublic({ name: d.name.trim() || "Ban", birthDate: d.date, gender: gender || null }));
  } catch {
    return null;
  }
}

/**
 * Xem trước hồ sơ duyên khi đang điền: đúng khung người xem sẽ thấy. Chưa có ngày sinh thì
 * hiện bốn thẻ "?" mờ để người dùng biết phần nào sẽ hiện ra.
 */
function ProfilePreview({
  draft,
  gender,
  looking,
  compact,
  current,
}: {
  draft: Draft;
  gender: Gender | "";
  looking: LookingFor;
  compact?: boolean;
  /** Đang sửa hồ sơ: chưa nhập lại ngày sinh thì xem trước bằng dữ liệu đang có. */
  current?: DatingProfile;
}) {
  const fresh = draftProfile(draft, gender);
  const prof = fresh ?? (current ? profileOf({ ...toPublicPerson(current), name: draft.name || current.name, gender: gender || null }) : null);
  const name = draft.name.trim();
  const year = fresh ? Number(draft.date.slice(0, 4)) : current ? (current.birth_year ?? current.lunar_year) : null;
  return (
    <div className={cn("rounded-[24px] border border-[#e6d6f3] bg-[linear-gradient(160deg,#fffafc,#f6effc)] text-center shadow-[0_16px_40px_#6b4b821a]", compact ? "p-4" : "p-5")}>
      <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-[#8a6fa3] uppercase">
        <Eye size={13} /> Xem trước hồ sơ của bạn
      </p>
      <p className={cn("mt-3! font-[family-name:var(--font-serif-app)] leading-tight", compact ? "text-[24px]" : "text-[32px]", name ? "text-[#281b44]" : "text-[#c4b3d3]")}>
        {name || "Tên của bạn"}
      </p>
      {year || draft.city ? (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {year ? <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf0f5] px-2.5 py-1 text-[12px] font-medium text-[#9c3b66]"><Cake size={12} /> Sinh năm {year}</span> : null}
          {draft.city ? <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf3fc] px-2.5 py-1 text-[12px] font-medium text-[#2c5a91]"><MapPin size={12} /> {draft.city}</span> : null}
        </div>
      ) : null}
      <p className="mt-2! text-[12px] font-medium text-[#8a5a9f]">{LOOKING_LABEL[looking]}</p>
      <InterestTags bio={draft.bio} className="mt-3" />

      <div className="mt-4">
        {prof ? (
          <LovePortrait person={prof} tilesOnly />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {["Cung hoàng đạo", "Số chủ đạo", "Con giáp", "Ngũ hành"].map((l) => (
              <div key={l} className="flex flex-col items-center rounded-[24px] border border-dashed border-[#e4d6f2] bg-white/50 px-3 py-4">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-[#b9a6cb] uppercase">{l}</span>
                <span className="mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f0fd] text-[24px] text-[#c4b3d3]">?</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="mt-3! text-[12px] text-[#8a7b99]">
        {prof ? "Người xem sẽ thấy hồ sơ như thế này, rồi nhập ngày sinh để biết hợp với bạn bao nhiêu %." : "Nhập ngày sinh để xem cung, số chủ đạo, con giáp và mệnh của bạn."}
      </p>
    </div>
  );
}

// ───────────────────────── Tạo hồ sơ ─────────────────────────

function CreateView() {
  const router = useRouter();
  const { user } = useAuthUser();
  // Mỗi người một hồ sơ: đã có (trên máy này hoặc trong tài khoản) thì chuyển sang trang hồ sơ
  const [redirecting, setRedirecting] = useState(false);
  const [gender, setGender] = useState<Gender | "">("");
  const [looking, setLooking] = useState<LookingFor>("ca-hai");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Bản nháp để xem trước hồ sơ ngay khi đang điền
  const [draft, setDraft] = useState<Draft>({ name: "", date: "", city: "", bio: "" });
  // Se duyên ngay lúc tạo hồ sơ (cần đăng nhập). "Muốn gặp" mặc định theo giới tính vừa chọn.
  const [matchOn, setMatchOn] = useState(true);
  const [choice, setChoice] = useState<MatchChoice>(() => defaultMatchChoice(null, null));
  const [wantTouched, setWantTouched] = useState(false);
  const matchChoice = wantTouched ? choice : { ...choice, want: defaultMatchChoice(gender, null).want };
  const matching = Boolean(user) && matchOn;
  const readDraft = (el: HTMLElement) => {
    const form = el.querySelector("form");
    if (!form) return;
    const d = new FormData(form);
    setDraft({ name: String(d.get("name") || ""), date: String(d.get("date") || ""), city: String(d.get("city") || ""), bio: String(d.get("bio") || "") });
  };
  // Đọc sau khi mount để không lệch HTML với server (form vẫn render sẵn cho SEO)
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!readOwned().length) return;
      setRedirecting(true);
      router.replace("/duyen/quan-ly");
    }, 0);
    return () => window.clearTimeout(t);
  }, [router]);
  // Đã đăng nhập mà máy này chưa có: kéo hồ sơ từ tài khoản về
  useEffect(() => {
    if (!user) return;
    let alive = true;
    void syncOwned().then((list) => {
      if (!alive || !list.length) return;
      setRedirecting(true);
      router.replace("/duyen/quan-ly");
    });
    return () => {
      alive = false;
    };
  }, [user, router]);

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const birthDate = String(data.get("date") || "");
    setBusy(true);
    setError("");
    try {
      const person = toPublic({ name, birthDate, gender: gender || null });
      const created = await createProfile({
        name,
        gender: gender || null,
        lookingFor: looking,
        bio: String(data.get("bio") || "").trim().slice(0, 140),
        person,
        slugBase: normalizeName(firstName(name)).toLowerCase() || "duyen",
        city: String(data.get("city") || ""),
        birthYear: Number(birthDate.slice(0, 4)),
      });
      track("duyen_profile_create", { gender: gender || "none", looking, matching: matching ? 1 : 0 });
      if (matching) {
        // Hồ sơ đã tạo; bật se duyên lỗi thì vẫn sang trang quản lý, ở đó có form bật lại
        try {
          await saveMatchSettings({
            enabled: true,
            wantGender: (matchChoice.want || "ca-hai") as WantGender,
            ageGap: matchChoice.gap,
            sameCity: Boolean(draft.city) && matchChoice.sameCity,
            adult: true,
            contacts: readContacts(form),
          });
          track("matchmaking_enable", { from: "create" });
        } catch {
          track("matchmaking_enable_failed", { from: "create" });
        }
      }
      router.push(`/duyen/quan-ly#t=${created.token}`);
    } catch (err) {
      setError(datingError(err));
      setBusy(false);
    }
  }

  if (redirecting)
    return (
      <div className="tarot-setup-panel flex justify-center py-16!">
        <LoaderCircle className="spin text-[#6e4a92]" size={28} />
      </div>
    );

  return (
    <div className="flow-body is-configuring">

      <div
        className="lg:mx-auto lg:grid lg:max-w-[1080px] lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start lg:gap-6"
        onInput={(e) => readDraft(e.currentTarget)}
        onChange={(e) => readDraft(e.currentTarget)}
      >
      <ValidatedForm
        className="tuvi-form tarot-setup-panel lg:max-w-none!"
        check={(form) => {
          const d = new FormData(form);
          const errors: Record<string, string> = {};
          const date = String(d.get("date") || "");
          if (date && !isAdult(date)) errors.date = UNDER_18;
          if (!d.get("terms")) errors.terms = "Hãy xác nhận bạn đủ 18 tuổi và đồng ý với các điều trên.";
          if (matching) {
            if (!gender) errors.gender = "Se duyên cần biết giới tính để giới thiệu đúng người.";
            Object.assign(errors, checkMatchFields(form, matchChoice.want));
          }
          return errors;
        }}
        onValidSubmit={(form) => void submit(form)}
      >
        <label>Tên hiển thị
          <IconField icon={UserRound} name="name" required maxLength={60} placeholder="Minh Anh" />
        </label>
        <label className="mt-4 block">Ngày sinh (dương lịch)
          <IconField icon={CalendarDays} type="date" name="date" required min="1940-01-01" max="2010-12-31" />
        </label>
        <GenderChips name="gender" value={gender} onChange={setGender} label="Giới tính" />
        <label className="mt-4 block">Bạn đang sống ở
          <SearchSelect icon={MapPin} name="city" required placeholder="Gõ để tìm tỉnh, thành" options={CITIES} aliases={CITY_ALIASES} onValueChange={(city) => setDraft((d) => ({ ...d, city }))} />
        </label>
        <p className="tuvi-note">Chỉ hiện tỉnh/thành để người xem biết có ở gần không.</p>

        <LookingChips value={looking} onChange={setLooking} />

        <InterestChips onChange={(bio) => setDraft((d) => ({ ...d, bio }))} />

        <MatchSection
          signedIn={Boolean(user)}
          on={matchOn}
          onToggle={setMatchOn}
          city={draft.city}
          choice={matchChoice}
          onChange={(next) => { setWantTouched(true); setChoice(next); }}
        />

        {/* Điện thoại: xem trước gọn ngay trên nút tạo */}
        <div className="mt-6 lg:hidden">
          <ProfilePreview draft={draft} gender={gender} looking={looking} compact />
        </div>

        <TermsCheckbox />

        {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

        <Button className="tuvi-submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : <Heart size={18} />}
          {busy ? "Đang tạo…" : "Tạo hồ sơ duyên"}
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
          Không cần tài khoản. Ngày sinh không được lưu — chỉ lưu tuổi, cung và con số để tính độ hợp.
        </p>
      </ValidatedForm>

      {/* Máy tính: xem trước nằm cạnh form, trượt theo khi cuộn */}
      <aside className="hidden lg:sticky lg:top-28 lg:block">
        <ProfilePreview draft={draft} gender={gender} looking={looking} />
      </aside>
      </div>

      <p className="mt-5! text-center text-[13px] text-[#6a5c7a]">
        Chỉ muốn thử nhanh với một người? <Link href="/hop-nhau" className="font-medium text-[#5b3f7a] underline underline-offset-2">Xem hợp nhau bao nhiêu %</Link>
      </p>
    </div>
  );
}

/**
 * Se duyên trong form tạo hồ sơ: bật thì Luna đưa hồ sơ vào feed cho người hợp lướt,
 * kèm Zalo/IG/FB để mở khi hai bên cùng kết nối. Chưa đăng nhập thì mời đăng nhập.
 */
function MatchSection({
  signedIn,
  on,
  onToggle,
  city,
  choice,
  onChange,
}: {
  signedIn: boolean;
  on: boolean;
  onToggle: (on: boolean) => void;
  city: string;
  choice: MatchChoice;
  onChange: (next: MatchChoice) => void;
}) {
  return (
    <section className="mt-6 rounded-[24px] border border-[#e6d6f3] bg-[#fbf7fe] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[15px] font-medium text-[#281b44]"><HeartHandshake size={16} className="text-[#6e4a92]" /> Bật se duyên</p>
          <p className="mt-1! text-[12px] leading-[1.6] text-[#6a5c7a]">Người hợp với bạn sẽ thấy hồ sơ này khi lướt. Hai bên cùng kết nối thì mở Zalo, Instagram, Facebook của nhau.</p>
        </div>
        {signedIn ? (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Bật se duyên"
            onClick={() => onToggle(!on)}
            className={cn("relative h-8 w-12 shrink-0 rounded-full transition-colors", on ? "bg-[#6e4a92]" : "bg-[#d9cbe6]")}
          >
            <span className={cn("absolute top-1 left-1 size-6 rounded-full bg-white shadow transition-transform", on && "translate-x-4")} />
          </button>
        ) : null}
      </div>
      {!signedIn ? (
        <div className="mt-3">
          <Button type="button" variant="outline" className="h-10! rounded-full! px-4! text-[14px]!" onClick={() => { track("matchmaking_login_click", { from: "create" }); void signInWithGoogle(); }}>
            Đăng nhập Google để bật
          </Button>
          <p className="mt-2! text-[12px] text-[#8a7b99]">Không đăng nhập vẫn tạo được hồ sơ và chia sẻ link như thường.</p>
        </div>
      ) : on ? (
        <div className="mt-4">
          <MatchFields city={city || null} choice={choice} onChange={onChange} />
        </div>
      ) : null}
    </section>
  );
}

// ───────────────────────── Người xem ghép vào ─────────────────────────

function ProfileView({ profile: owner }: { profile: DatingProfile }) {
  const [result, setResult] = useState<Compatibility | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [visitorMeta, setVisitorMeta] = useState<{ city: string | null; birthYear: number } | null>(null);
  const ownerName = firstName(owner.name);
  useRelatedTools(result ? "duyen" : null);

  useEffect(() => {
    const t = window.setTimeout(() => setIsOwner(readOwned().some((o) => o.slug === owner.slug)), 0);
    track("duyen_profile_view");
    return () => window.clearTimeout(t);
  }, [owner.slug]);

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const typed = String(data.get("vName") || "").trim();
    const g = String(data.get("vGender") || "");
    const visitor = { name: typed || "Bạn", birthDate: String(data.get("vDate") || ""), gender: g === "nam" || g === "nu" ? (g as Gender) : null };
    setBusy(true);
    setNote("");
    const r = compatibilityOf(profileOf(toPublicPerson(owner)), profile(visitor));
    try {
      await addCheck(
        owner.slug,
        { ...toPublic(visitor), displayName: typed || null, city: String(data.get("vCity") || "") || null, birthYear: Number(visitor.birthDate.slice(0, 4)) },
        r.score,
        r.headline,
      );
      track("duyen_check_complete", { anonymous: typed ? 0 : 1 });
    } catch (err) {
      // Kết quả vẫn hiện; chỉ báo là chưa gửi được cho chủ hồ sơ
      setNote(`${datingError(err)} Kết quả chưa gửi được tới ${ownerName}.`);
    }
    try {
      localStorage.setItem("luna.hopnhau.me", JSON.stringify(visitor.name === "Bạn" ? { ...visitor, name: "" } : visitor));
    } catch {}
    setResult(r);
    setVisitorMeta({ city: String(data.get("vCity") || "") || null, birthYear: Number(visitor.birthDate.slice(0, 4)) });
    setBusy(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  if (result) return <VisitorResult owner={owner} result={result} note={note} visitor={visitorMeta} />;

  return (
    <div className="flow-body is-configuring">
      {isOwner ? (
        <div className="tarot-setup-panel mb-5! flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-[14px] text-[#221c2b]">Đây là hồ sơ của bạn.</p>
          <Link href="/duyen/quan-ly" className={buttonVariants()}><Eye size={16} /> Xem ai đã ghép</Link>
        </div>
      ) : null}
      <ValidatedForm className="tuvi-form tarot-setup-panel" onValidSubmit={(form) => void submit(form)}>
        <div className="text-center">
          <p className="eyebrow">HỒ SƠ DUYÊN</p>
          <h2 className="mt-2! font-[family-name:var(--font-serif-app)]! text-[32px]! leading-tight text-[#281b44]">{owner.name}</h2>
          <MetaLine p={owner} />
          <p className="mt-2! text-[13px] font-medium text-[#8a5a9f]">{LOOKING_LABEL[owner.looking_for]}</p>
          <InterestTags bio={owner.bio} className="mt-3" />
        </div>
        <div className="mt-6">
          <LovePortrait person={profileOf(toPublicPerson(owner))} title={`${ownerName} trong tình yêu`} />
        </div>
        <div className="mt-8 border-t border-dashed border-[#e4d6f2] pt-6 text-center">
          <div className="mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#fbe7f1,#eadcf8_60%,#dccbf2)] shadow-[0_12px_32px_#6b4b8233]">
            <LockKeyhole size={20} className="text-[#6e4a92]" />
            <span className="font-[family-name:var(--font-sans-app)] text-[32px] leading-none font-bold text-[#4b2a6e]">?%</span>
          </div>
          <p className="mx-auto mt-4! mb-6! max-w-[420px] text-[14px] leading-[1.7] text-[#6a5c7a]">
            Bạn hợp với {ownerName} bao nhiêu %? Nhập ngày sinh để biết.
          </p>
        </div>
        <PersonFields prefix="v" who="bạn" prefill prefillExcept={owner.name} nameOptional cities={CITIES} />
        <Button className="tuvi-submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : <Heart size={18} />}
          {busy ? "Đang tính…" : `Xem mình hợp với ${ownerName} bao nhiêu %`}
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
          {ownerName} chỉ thấy tên bạn (hoặc &ldquo;Ẩn danh&rdquo;), tuổi, cung và điểm — không thấy ngày sinh.
        </p>
      </ValidatedForm>
    </div>
  );
}

function VisitorResult({
  owner,
  result,
  note,
  visitor,
}: {
  owner: DatingProfile;
  result: Compatibility;
  note: string;
  visitor: { city: string | null; birthYear: number } | null;
}) {
  const ownerName = firstName(owner.name);
  const gap = ageGapText(visitor?.birthYear, owner.birth_year ?? owner.lunar_year, ownerName);
  const place = !owner.city ? null : visitor?.city === owner.city ? `Cùng ở ${owner.city}` : `${ownerName} ở ${owner.city}${visitor?.city ? `, bạn ở ${visitor.city}` : ""}`;
  const story = storyUrl(owner.slug, { s: String(result.score), n: result.b.firstName === "Bạn" ? "" : result.b.firstName });
  async function shareProfile() {
    const r = await shareLink(profileUrl(owner.slug), `Mình hợp với ${ownerName} ${result.score}% 👀 Thử xem bạn được bao nhiêu:`);
    track("duyen_visitor_share", { method: r });
  }
  return (
    <div className="tarot-setup-panel">
      <CompatibilityHeader result={result} />
      {gap || place ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {gap ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f5] px-3 py-1.5 text-[13px] font-medium text-[#9c3b66]"><Cake size={14} /> {gap}</span> : null}
          {place ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3fc] px-3 py-1.5 text-[13px] font-medium text-[#2c5a91]"><MapPin size={14} /> {place}</span> : null}
        </div>
      ) : null}
      {note ? <p className="mt-3! text-center text-[13px] text-[#8a5a1f]">{note}</p> : (
        <p className="mt-3! text-center text-[13px] text-[#2f5d38]"><Check size={14} className="mr-1 inline align-[-2px]" />{ownerName} sẽ thấy bạn trong danh sách những người đã ghép.</p>
      )}

      <div className="mt-6 rounded-[24px] bg-[linear-gradient(100deg,#fcf5f9_0%,#f8eefb_55%,#fdeede_100%)] p-5 text-center ring-1 ring-[#e6d6f3]">
        <p className="flex items-center justify-center gap-2 text-[16px] font-semibold text-[#3a1f5c]"><Crown size={18} className="text-[#c99a2e]" /> Ai hợp với bạn nhất?</p>
        <p className="mt-1! text-[13px] text-[#6a5c7a]">Tạo hồ sơ duyên của bạn, đăng lên story — xem ai ghép vào và hợp bao nhiêu %.</p>
        <Link href="/duyen" className={cn(buttonVariants(), "mt-4")} onClick={() => track("duyen_visitor_create_click")}>
          <Heart size={16} /> Tạo hồ sơ duyên của tôi
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={() => void shareProfile()}><Send size={16} /> Rủ bạn bè ghép với {ownerName}</Button>
        <a href={story} download={`hop-${result.score}.png`} className={buttonVariants({ variant: "outline" })} onClick={() => track("duyen_visitor_story")}>
          <Download size={16} /> Tải ảnh story
        </a>
      </div>

      <CompatibilityDetails result={result} />
      <p className="mt-6! text-center text-[12px] text-[#8a7b99]">Để vui và hiểu nhau hơn, không phải lời phán.</p>
    </div>
  );
}

// ───────────────────────── Chủ hồ sơ ─────────────────────────

function ManageView() {
  const { user, ready } = useAuthUser();
  const [owned, setOwned] = useState<OwnedProfile[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<{ profile: DatingProfile; checks: CompatibilityCheck[] } | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");
  const [copied, setCopied] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [onlyNearby, setOnlyNearby] = useState(false);
  const [editing, setEditing] = useState(false);

  // Token: từ link quản lý (#t=…) — lưu lại trên máy — hoặc hồ sơ đã có trên máy.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("t");
      const list = readOwned();
      setOwned(list);
      setToken(fromHash || list[0]?.token || null);
      if (!fromHash && !list.length) setState("missing");
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // Đăng nhập rồi: gắn hồ sơ vào tài khoản, kéo hồ sơ từ máy khác về.
  useEffect(() => {
    if (!user) return;
    void syncOwned().then((list) => {
      setOwned(list);
      setToken((cur) => cur ?? list[0]?.token ?? null);
    });
  }, [user]);

  const load = useCallback(async (t: string) => {
    try {
      const res = await manage(t);
      if (!res) return setState("missing");
      setData(res);
      setState("ok");
      rememberOwned({ slug: res.profile.slug, name: res.profile.name, token: t });
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const t = window.setTimeout(() => void load(token), 0);
    // Quay lại tab → tải lại danh sách (có người mới ghép chưa)
    const onFocus = () => document.visibilityState === "visible" && void load(token);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [token, load]);

  useEffect(() => {
    if (data) track("duyen_manage_view", { checks: data.checks.length });
  }, [data]);

  if (state === "missing" && !data)
    return (
      <div className="tarot-setup-panel text-center">
        <h2 className="font-[family-name:var(--font-serif-app)]! text-[26px]! text-[#281b44]">Chưa thấy hồ sơ nào trên máy này</h2>
        <p className="mx-auto mt-2! max-w-[420px] text-[14px] leading-[1.7] text-[#6a5c7a]">
          Nếu bạn đã tạo trên máy khác, hãy mở link quản lý bí mật, hoặc đăng nhập Google (nếu đã đăng nhập lúc tạo).
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/duyen" className={buttonVariants()}><Heart size={16} /> Tạo hồ sơ duyên</Link>
          {ready && !user ? <Button variant="outline" onClick={() => void signInWithGoogle()}>Đăng nhập Google</Button> : null}
        </div>
      </div>
    );
  if (!data || !token)
    return (
      <div className="tarot-setup-panel flex justify-center py-16!">
        {state === "error" ? <p className="text-[14px] text-[#8a5a1f]">Không tải được hồ sơ. Kiểm tra kết nối rồi thử lại.</p> : <LoaderCircle className="spin text-[#6e4a92]" size={28} />}
      </div>
    );

  const { profile: p, checks } = data;
  const link = profileUrl(p.slug);
  const secret = manageUrl(window.location.origin, token);
  const top = checks[0];
  const nearby = p.city ? checks.filter((c) => c.city === p.city) : [];
  const shown = onlyNearby ? nearby : checks;
  const signedIn = Boolean(user);

  async function copy(text: string, what: string) {
    await navigator.clipboard.writeText(text);
    setCopied(what);
    window.setTimeout(() => setCopied(""), 2000);
  }
  async function share() {
    const r = await shareLink(link, `Ai hợp với ${firstName(p.name)} nhất? Nhập ngày sinh của bạn để biết 👀`);
    track("duyen_owner_share", { method: r });
  }

  if (editing)
    return (
      <EditProfile
        profile={p}
        token={token}
        onDone={(saved) => {
          setEditing(false);
          if (saved) void load(token);
          window.scrollTo({ top: 0, behavior: "auto" });
        }}
      />
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="tarot-setup-panel text-center">
        {owned && owned.length > 1 ? (
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {owned.map((o) => (
              <button key={o.token} type="button" onClick={() => setToken(o.token)} className={cn("rounded-full border px-3 py-1 text-[12px]!", o.token === token ? "border-[#ac88cf] bg-[#eae0f7]" : "border-[#e4d6f2] bg-white")}>
                {o.name}
              </button>
            ))}
          </div>
        ) : null}
        <p className="eyebrow">HỒ SƠ DUYÊN CỦA BẠN</p>
        <div className="relative mt-2 inline-block">
          <h2 className="mt-0! font-[family-name:var(--font-serif-app)]! text-[30px]! leading-tight text-[#281b44]">{p.name}</h2>
          <button
            type="button"
            onClick={() => { setEditing(true); track("duyen_edit_open"); }}
            className="absolute top-1/2 left-full ml-3 inline-flex h-10 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full bg-[#f1e9fa] px-4 text-[14px]! font-medium whitespace-nowrap text-[#6e4a92] transition-colors hover:bg-[#e4d6f2]"
          >
            <Pencil size={16} /> Sửa
          </button>
        </div>
        <MetaLine p={p} />

        <div className="mx-auto mt-6 flex max-w-[480px] flex-col gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#e4d6f2] bg-[#fdfafc] py-1 pr-1 pl-4">
            <span className="min-w-0 flex-1 truncate text-left text-[13px] text-[#6a5c7a]">{link}</span>
            <Button variant="ghost" className="h-9! rounded-full! px-3! text-[13px]! text-[#5b3f7a]!" onClick={() => void copy(link, "link")}>
              {copied === "link" ? <Check size={15} /> : <Copy size={15} />} {copied === "link" ? "Đã sao chép" : "Sao chép"}
            </Button>
          </div>
          <Button className="h-12! w-full rounded-full! text-[15px]!" onClick={() => void share()}><Send size={16} /> Chia sẻ link</Button>
        </div>
        <div className="mt-8 border-t border-dashed border-[#e4d6f2] pt-6">
          <LovePortrait person={profileOf(toPublicPerson(p))} title="Người xem thấy bạn thế này" />
        </div>
      </div>

      <Matchmaking profile={p} onEditProfile={() => { setEditing(true); window.scrollTo({ top: 0, behavior: "auto" }); }} />

      {checks.length && !signedIn && ready ? (
        <div className="tarot-setup-panel flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-[15px] font-medium text-[#221c2b]">{checks.length} người đã ghép với bạn</p>
            <p className="mt-0.5! text-[13px] text-[#6a5c7a]">Đăng nhập Google để không mất hồ sơ khi đổi máy hay xoá dữ liệu trình duyệt.</p>
          </div>
          <Button onClick={() => { track("duyen_login_click"); void signInWithGoogle(); }}>Đăng nhập Google</Button>
        </div>
      ) : null}

      <div className="tarot-setup-panel">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-[family-name:var(--font-serif-app)]! text-[24px]! text-[#281b44]">Ai hợp với bạn</h3>
          <button type="button" onClick={() => void load(token)} className="flex items-center gap-1 text-[13px]! text-[#6a5c7a]">
            <RefreshCw size={14} /> Tải lại
          </button>
        </div>
        {top ? (
          <p className="mt-1! text-[13px] text-[#6a5c7a]">
            {checks.length} lượt ghép · hợp nhất: <strong className="text-[#3a1f5c]">{top.visitor_name || "Ẩn danh"} {top.score}%</strong>
          </p>
        ) : null}

        {p.city && nearby.length ? (
          <div className="mt-3 flex gap-2">
            {([[false, `Tất cả (${checks.length})`], [true, `📍 Cùng ${p.city} (${nearby.length})`]] as const).map(([v, label]) => (
              <button key={label} type="button" onClick={() => setOnlyNearby(v)} className={cn("rounded-full border px-3 py-1.5 text-[12px]!", onlyNearby === v ? "border-[#ac88cf] bg-[#eae0f7] text-[#221c2b]" : "border-[#e4d6f2] bg-white text-[#5b4a6b]")}>
                {label}
              </button>
            ))}
          </div>
        ) : null}
        {checks.length ? (
          <ol className="mt-4 flex flex-col gap-2">
            {shown.map((c, i) => <CheckRow key={c.id} check={c} rank={i + 1} ownerCity={p.city} onDelete={async () => { await deleteCheck(token, c.id); void load(token); }} />)}
          </ol>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[#e4d6f2] p-6 text-center">
            <Sparkles size={22} className="mx-auto text-[#ac88cf]" />
            <p className="mt-2! text-[14px] text-[#5b5276]">Chưa có ai ghép. Đăng link lên story để bắt đầu nhé!</p>
          </div>
        )}
      </div>

      <div className="tarot-setup-panel text-[13px] text-[#6a5c7a]">
        <p className="flex items-center gap-2 font-medium text-[#3a1f5c]"><KeyRound size={15} /> Link quản lý bí mật</p>
        <p className="mt-1!">Mở link này trên máy khác để xem lại danh sách. Đừng gửi cho ai — ai có link đều xoá được hồ sơ.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void copy(secret, "secret")}>
            {copied === "secret" ? <Check size={16} /> : <Copy size={16} />} {copied === "secret" ? "Đã chép" : "Chép link quản lý"}
          </Button>
          <Button
            variant="outline"
            className="text-[#a33]!"
            onClick={async () => {
              if (!confirmDelete) return setConfirmDelete(true);
              await deleteProfile(token);
              track("duyen_profile_delete");
              window.location.assign("/duyen");
            }}
          >
            <Trash2 size={16} /> {confirmDelete ? "Bấm lần nữa để xoá hẳn" : "Xoá hồ sơ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Sửa hồ sơ: điền sẵn dữ liệu cũ, xem trước như lúc tạo. Ngày sinh để trống = giữ nguyên. */
function EditProfile({ profile: p, token, onDone }: { profile: DatingProfile; token: string; onDone: (saved: boolean) => void }) {
  const [gender, setGender] = useState<Gender | "">(p.gender ?? "");
  const [looking, setLooking] = useState<LookingFor>(p.looking_for);
  const [draft, setDraft] = useState<Draft>({ name: p.name, date: "", city: p.city ?? "", bio: p.bio ?? "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const readDraft = (el: HTMLElement) => {
    const form = el.querySelector("form");
    if (!form) return;
    const d = new FormData(form);
    setDraft({ name: String(d.get("name") || ""), date: String(d.get("date") || ""), city: String(d.get("city") || ""), bio: String(d.get("bio") || "") });
  };

  async function submit(form: HTMLFormElement) {
    const d = new FormData(form);
    const name = String(d.get("name") || "").trim();
    const date = String(d.get("date") || "");
    setBusy(true);
    setError("");
    try {
      await updateProfile(token, {
        name,
        gender: gender || null,
        lookingFor: looking,
        bio: String(d.get("bio") || "").trim().slice(0, 140),
        city: String(d.get("city") || ""),
        person: date ? toPublic({ name, birthDate: date, gender: gender || null }) : null,
        birthYear: date ? Number(date.slice(0, 4)) : null,
      });
      rememberOwned({ slug: p.slug, name, token });
      track("duyen_profile_update", { date_changed: date ? 1 : 0 });
      onDone(true);
    } catch (err) {
      setError(datingError(err));
      setBusy(false);
    }
  }

  return (
    <div
      className="lg:mx-auto lg:grid lg:max-w-[1080px] lg:grid-cols-[minmax(0,1fr)_460px] lg:items-start lg:gap-6"
      onInput={(e) => readDraft(e.currentTarget)}
      onChange={(e) => readDraft(e.currentTarget)}
    >
      <ValidatedForm
        className="tuvi-form tarot-setup-panel lg:max-w-none!"
        check={(form) => {
          const date = String(new FormData(form).get("date") || "");
          return date && !isAdult(date) ? { date: UNDER_18 } : ({} as Record<string, string>);
        }}
        onValidSubmit={(form) => void submit(form)}
      >
        <FormIntro>Sửa hồ sơ duyên. Link và danh sách những người đã ghép vẫn giữ nguyên.</FormIntro>
        <label>Tên hiển thị
          <IconField icon={UserRound} name="name" required maxLength={60} defaultValue={p.name} />
        </label>
        <label className="mt-4 block">Ngày sinh (dương lịch) <span className="font-normal text-[#8a7b99]">(để trống nếu không đổi)</span>
          <IconField icon={CalendarDays} type="date" name="date" min="1940-01-01" max="2010-12-31" />
        </label>
        <GenderChips name="gender" value={gender} onChange={setGender} label="Giới tính" />
        <label className="mt-4 block">Bạn đang sống ở
          <SearchSelect icon={MapPin} name="city" required placeholder="Gõ để tìm tỉnh, thành" options={CITIES} aliases={CITY_ALIASES} defaultValue={p.city ?? ""} onValueChange={(city) => setDraft((d) => ({ ...d, city }))} />
        </label>
        <LookingChips value={looking} onChange={setLooking} />
        <InterestChips defaultValue={parseInterests(p.bio).filter((x) => (INTERESTS as readonly string[]).includes(x))} onChange={(bio) => setDraft((d) => ({ ...d, bio }))} />

        <div className="mt-6 lg:hidden">
          <ProfilePreview draft={draft} gender={gender} looking={looking} current={p} compact />
        </div>

        {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}
        <Button className="tuvi-submit" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={18} /> : <Check size={18} />}
          {busy ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
        <button type="button" onClick={() => onDone(false)} className="mx-auto mt-4 block text-[13px]! text-[#6a5c7a] underline underline-offset-4">
          Huỷ
        </button>
      </ValidatedForm>
      <aside className="hidden lg:sticky lg:top-28 lg:block">
        <ProfilePreview draft={draft} gender={gender} looking={looking} current={p} />
      </aside>
    </div>
  );
}

/** Chọn tối đa 3 sở thích. Giá trị nằm trong ô ẩn `bio` để FormData đọc như ô thường. */
/** Cam kết khi tạo hồ sơ. Chưa có trang điều khoản riêng nên ghi gọn các điều chính ngay đây. */
function TermsCheckbox() {
  return (
    <div className="mt-6">
      <FieldCheckbox name="terms">
        Mình <strong className="font-semibold text-[#3a1f5c]">đủ 18 tuổi</strong>, thông tin trong hồ sơ là của chính mình,
        và mình sẽ cư xử tử tế với người ghép cùng. Hồ sơ giả mạo, quấy rối hay mời chào sẽ bị gỡ.
      </FieldCheckbox>
    </div>
  );
}

function InterestChips({ defaultValue = [], onChange }: { defaultValue?: string[]; onChange?: (bio: string) => void }) {
  const [picked, setPicked] = useState<string[]>(defaultValue);
  const full = picked.length >= MAX_INTERESTS;
  function toggle(item: string) {
    // Cập nhật theo giá trị mới nhất: bấm nhanh liên tiếp không bị mất lượt chọn.
    // onChange chỉ ghi lại một chuỗi, gọi lặp (StrictMode) cũng vô hại.
    setPicked((prev) => {
      const next = prev.includes(item) ? prev.filter((x) => x !== item) : prev.length >= MAX_INTERESTS ? prev : [...prev, item];
      onChange?.(joinInterests(next));
      return next;
    });
  }
  return (
    <div className="mt-4">
      <span className="block text-[13px] font-medium text-[#3d2f4f]">
        Sở thích <span className="font-normal text-[#8a7b99]">(chọn tối đa {MAX_INTERESTS} · {picked.length}/{MAX_INTERESTS})</span>
      </span>
      <input type="hidden" name="bio" value={joinInterests(picked)} />
      <div className="mt-2 flex flex-wrap gap-2">
        {INTERESTS.map((item) => {
          const on = picked.includes(item);
          return (
            <button
              key={item}
              type="button"
              aria-pressed={on}
              disabled={full && !on}
              onClick={() => toggle(item)}
              className={cn(
                "h-9 rounded-full border px-3 text-[13px]! transition-colors disabled:opacity-40",
                on ? "border-[#ac88cf] bg-[#eae0f7] font-medium text-[#221c2b]" : "border-[#e4d6f2] bg-[#f6f0fd] text-[#5b4a6b] hover:border-[#c9a9e0]",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Sở thích hiện thành chip trên hồ sơ / xem trước. */
function InterestTags({ bio, className }: { bio: string | null | undefined; className?: string }) {
  const list = parseInterests(bio);
  if (!list.length) return null;
  return (
    <div className={cn("flex flex-wrap justify-center gap-1.5", className)}>
      {list.map((x) => (
        <span key={x} className="rounded-full border border-[#ecdff5] bg-white/80 px-3 py-1 text-[13px] text-[#4a3a5c]">{x}</span>
      ))}
    </div>
  );
}

/** Chọn "đang tìm": người yêu / bạn bè / cả hai. */
function LookingChips({ value, onChange }: { value: LookingFor; onChange: (v: LookingFor) => void }) {
  return (
    <div className="mt-4">
      <span className="block text-[13px] font-medium text-[#3d2f4f]">Bạn đang tìm</span>
      <div role="radiogroup" aria-label="Bạn đang tìm" className="mt-2 grid grid-cols-3 gap-2">
        {([["yeu", "Người yêu"], ["ban", "Bạn bè"], ["ca-hai", "Cả hai"]] as const).map(([key, text]) => (
          <button
            key={key}
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
    </div>
  );
}

function CheckRow({ check: c, rank, ownerCity, onDelete }: { check: CompatibilityCheck; rank: number; ownerCity: string | null; onDelete: () => Promise<void> }) {
  const prof = useMemo(() => profileOf({ name: c.visitor_name || "Ẩn danh", lunarYear: c.lunar_year, zodiacIndex: c.zodiac_index, lifePath: c.life_path, gender: c.gender }), [c]);
  const [busy, setBusy] = useState(false);
  const when = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(c.created_at));
  return (
    <li className={cn("flex items-center gap-3 rounded-2xl border p-3", rank <= 3 ? "border-[#e6d6f3] bg-[#fcf7fe]" : "border-[#efe7f5] bg-white/70")}>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold", rank === 1 ? "bg-[#f6d98c] text-[#5c4210]" : "bg-[#f1e8f9] text-[#6e4a92]")}>{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[#221c2b]">{c.visitor_name || "Ẩn danh"} <span className="font-normal text-[#8a7b99]">· {c.headline}</span></p>
        <p className="mt-1! flex flex-wrap items-center gap-1.5 text-[12px] text-[#6a5c7a]">
          <span className="rounded-full bg-[#fdf0f5] px-2 py-0.5 text-[#9c3b66]">{c.birth_year ?? c.lunar_year}</span>
          {c.city ? (
            <span className={cn("rounded-full px-2 py-0.5", ownerCity && c.city === ownerCity ? "bg-[#e3f1e5] font-medium text-[#2f5d38]" : "bg-[#eaf3fc] text-[#2c5a91]")}>
              {ownerCity && c.city === ownerCity ? `📍 Cùng ${c.city}` : c.city}
            </span>
          ) : null}
          <span>Tuổi {prof.conGiap} · {prof.zodiac}{prof.cungMenh ? ` · cung ${prof.cungMenh}` : ""} · {when}</span>
        </p>
      </div>
      <span className="text-[18px] font-bold text-[#4b2a6e]">{c.score}%</span>
      <button
        type="button"
        aria-label="Xoá lượt ghép này"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onDelete().catch(() => setBusy(false));
        }}
        className="p-1 text-[#b3a5c2] hover:text-[#a33]"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}
