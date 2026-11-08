"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AtSign,
  Ban,
  Cake,
  Globe,
  HeartHandshake,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  PartyPopper,
  Phone,
  Settings2,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldCheckbox, FieldError, IconField, ValidatedForm } from "@/components/form-field";
import { compatibilityOf, firstName, profileOf } from "@/lib/hop-nhau";
import { parseInterests, toPublicPerson, type DatingProfile } from "@/lib/dating-shared";
import {
  blockPerson,
  decide,
  facebookLink,
  instagramLink,
  listMatches,
  getMatchSettings,
  matchError,
  normalizeFacebook,
  normalizeInstagram,
  normalizeZalo,
  REPORT_REASONS,
  reportPerson,
  FEED_PAGE,
  matchFeed,
  saveMatchSettings,
  zaloLink,
  type Contacts,
  type Match,
  type MatchPerson,
  type MatchSettings,
  type ReportReason,
  type Suggestion,
  type WantGender,
} from "@/lib/matchmaking";
import { signInWithGoogle } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/saved-results";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * "Luna se duyên": khối ghép đôi trong trang quản lý hồ sơ duyên.
 * Chưa đăng nhập → mời đăng nhập. Chưa bật → form tham gia. Đã bật → Khám phá (feed) / Đã ghép.
 */
export function Matchmaking({ profile: me, onEditProfile }: { profile: DatingProfile; onEditProfile: () => void }) {
  const { user, ready } = useAuthUser();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<MatchSettings | null>(null);
  const [contacts, setContacts] = useState<Contacts | null>(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getMatchSettings();
      setSettings(res.settings);
      setContacts(res.contacts);
      setState("ok");
    } catch (err) {
      setError(matchError(err));
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const t = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(t);
  }, [user, load]);

  if (!ready) return null;

  if (!user)
    return (
      <Panel>
        <Intro />
        <div className="mt-5 flex justify-center">
          <Button className="h-12! rounded-full! px-6! text-[15px]!" onClick={() => { track("matchmaking_login_click"); void signInWithGoogle(); }}>
            Đăng nhập Google để bắt đầu
          </Button>
        </div>
        <p className="mt-3! text-center text-[12px] text-[#8a7b99]">Cần đăng nhập để Luna biết đúng là bạn, và để giữ an toàn cho mọi người.</p>
      </Panel>
    );

  if (state === "loading")
    return (
      <Panel>
        <div className="flex justify-center py-8"><LoaderCircle className="spin text-[#6e4a92]" size={24} /></div>
      </Panel>
    );

  if (state === "error")
    return (
      <Panel>
        <Intro />
        <p className="mt-4! text-center text-[14px] text-[#8a5a1f]">{error}</p>
      </Panel>
    );

  if (!settings?.enabled || editing)
    return (
      <Panel>
        {editing ? <PanelTitle>Cài đặt se duyên</PanelTitle> : <Intro />}
        <SetupForm
          me={me}
          settings={settings}
          contacts={contacts}
          onEditProfile={onEditProfile}
          onSaved={() => { setEditing(false); void load(); }}
          onCancel={editing ? () => setEditing(false) : undefined}
        />
      </Panel>
    );

  return <MatchHome me={me} onSettings={() => setEditing(true)} />;
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="tarot-setup-panel">{children}</div>;
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-center font-[family-name:var(--font-serif-app)]! text-[24px]! text-[#281b44]">{children}</h3>;
}

function Intro() {
  return (
    <div className="text-center">
      <p className="eyebrow">LUNA SE DUYÊN</p>
      <PanelTitle>Gặp người hợp với bạn</PanelTitle>
      <ul className="mx-auto mt-4 flex max-w-[440px] flex-col gap-2 text-left text-[14px] leading-[1.6] text-[#4a4257]">
        <li className="flex gap-2"><span aria-hidden>✨</span> Lướt hồ sơ những người hợp bạn, xếp theo cung, mệnh, tuổi và con số. Người hợp nhất lên trước.</li>
        <li className="flex gap-2"><span aria-hidden>💜</span> Hai người cùng bấm &quot;Kết nối&quot; thì mới thấy Zalo, Instagram, Facebook của nhau.</li>
        <li className="flex gap-2"><span aria-hidden>🔒</span> Hồ sơ của bạn chỉ hiện cho người đã đăng nhập và đúng tiêu chí của cả hai. Bạn tạm dừng hay xoá lúc nào cũng được.</li>
      </ul>
    </div>
  );
}

/* ── Form tham gia / cài đặt ── */

const GAPS = [3, 5, 10] as const;

/** Lựa chọn se duyên mặc định: muốn gặp giới tính còn lại, chênh 5 tuổi, cùng thành phố nếu có. */
export function defaultMatchChoice(gender: string | null | undefined, city: string | null | undefined, settings?: MatchSettings | null) {
  return {
    want: (settings?.want_gender ?? (gender === "nam" ? "nu" : gender === "nu" ? "nam" : "")) as WantGender | "",
    gap: settings?.age_gap ?? 5,
    sameCity: city ? settings?.same_city ?? true : false,
  };
}
export type MatchChoice = ReturnType<typeof defaultMatchChoice>;

/** Lỗi của phần se duyên trong form (tên ô: want, zalo, instagram, facebook). */
export function checkMatchFields(form: HTMLFormElement, want: string) {
  const f = new FormData(form);
  const errors: Record<string, string> = {};
  if (!want) errors.want = "Hãy chọn bạn muốn gặp ai.";
  const z = String(f.get("zalo") ?? "").trim();
  const ig = String(f.get("instagram") ?? "").trim();
  const fb = String(f.get("facebook") ?? "").trim();
  if (z && !normalizeZalo(z)) errors.zalo = "Số điện thoại Việt Nam gồm 10 số, ví dụ 0901234567.";
  if (ig && !normalizeInstagram(ig)) errors.instagram = "Tên Instagram chỉ gồm chữ, số, dấu chấm và gạch dưới.";
  if (fb && !normalizeFacebook(fb)) errors.facebook = "Dán link trang cá nhân Facebook, ví dụ facebook.com/minh.anh.";
  if (!z && !ig && !fb) errors.zalo = "Cần ít nhất một cách liên lạc để người ghép đôi tìm được bạn.";
  return errors;
}

export function readContacts(form: HTMLFormElement): Contacts {
  const f = new FormData(form);
  return {
    zalo: normalizeZalo(String(f.get("zalo") ?? "")),
    instagram: normalizeInstagram(String(f.get("instagram") ?? "")),
    facebook: normalizeFacebook(String(f.get("facebook") ?? "")),
  };
}

/** Các ô se duyên: muốn gặp ai, chênh tuổi, ở đâu, liên lạc. Dùng chung cho form tạo hồ sơ và cài đặt. */
export function MatchFields({
  city,
  choice,
  onChange,
  contacts,
}: {
  city: string | null | undefined;
  choice: MatchChoice;
  onChange: (next: MatchChoice) => void;
  contacts?: Contacts | null;
}) {
  return (
    <>
      <ChipGroup
        name="want"
        label="Bạn muốn gặp"
        value={choice.want}
        onChange={(v) => onChange({ ...choice, want: v as WantGender })}
        options={[["nam", "Nam"], ["nu", "Nữ"], ["ca-hai", "Cả hai"]]}
      />
      <ChipGroup
        name="gap"
        label="Chênh lệch tuổi"
        value={String(choice.gap)}
        onChange={(v) => onChange({ ...choice, gap: Number(v) })}
        options={GAPS.map((g) => [String(g), `Trong ${g} tuổi`] as const)}
      />
      <ChipGroup
        name="area"
        label="Ở đâu"
        value={city && choice.sameCity ? "same" : "any"}
        onChange={(v) => onChange({ ...choice, sameCity: v === "same" })}
        options={city ? [["same", `Cùng ${city}`], ["any", "Ở đâu cũng được"]] : [["any", "Ở đâu cũng được"]]}
      />

      <p className="mt-6! text-[13px] font-medium text-[#3d2f4f]">
        Liên lạc khi ghép đôi <span className="font-normal text-[#8a7b99]">(ít nhất một)</span>
      </p>
      <p className="mt-1! text-[12px] text-[#8a7b99]">Chỉ người đã kết nối hai chiều với bạn mới thấy. Zalo hiện thành nút mở, không in số ra.</p>
      <label className="mt-3 block">Zalo (số điện thoại)
        <IconField icon={Phone} name="zalo" type="tel" inputMode="tel" placeholder="0901234567" defaultValue={contacts?.zalo ?? ""} />
      </label>
      <label className="mt-4 block">Instagram
        <IconField icon={AtSign} name="instagram" placeholder="minh.anh" defaultValue={contacts?.instagram ?? ""} />
      </label>
      <label className="mt-4 block">Facebook
        <IconField icon={Globe} name="facebook" placeholder="facebook.com/minh.anh" defaultValue={contacts?.facebook ? facebookLink(contacts.facebook) : ""} />
      </label>
    </>
  );
}

function SetupForm({
  me,
  settings,
  contacts,
  onEditProfile,
  onSaved,
  onCancel,
}: {
  me: DatingProfile;
  settings: MatchSettings | null;
  contacts: Contacts | null;
  onEditProfile: () => void;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [choice, setChoice] = useState<MatchChoice>(() => defaultMatchChoice(me.gender, me.city, settings));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const enabled = Boolean(settings?.enabled);

  function check(form: HTMLFormElement) {
    const errors = checkMatchFields(form, choice.want);
    if (!new FormData(form).get("adult")) errors.adult = "Hãy xác nhận bạn đủ 18 tuổi.";
    return errors;
  }

  async function submit(form: HTMLFormElement, enable = true) {
    const f = new FormData(form);
    setBusy(true);
    setError("");
    try {
      await saveMatchSettings({
        enabled: enable,
        wantGender: (choice.want || "ca-hai") as WantGender,
        ageGap: choice.gap,
        sameCity: Boolean(me.city) && choice.sameCity,
        adult: Boolean(f.get("adult")),
        contacts: readContacts(form),
      });
      track(enable ? (enabled ? "matchmaking_settings_save" : "matchmaking_enable") : "matchmaking_pause");
      onSaved();
    } catch (err) {
      setError(matchError(err));
    } finally {
      setBusy(false);
    }
  }

  async function pause() {
    setBusy(true);
    setError("");
    try {
      await saveMatchSettings({
        enabled: false,
        wantGender: (settings?.want_gender ?? "ca-hai") as WantGender,
        ageGap: settings?.age_gap ?? 5,
        sameCity: settings?.same_city ?? false,
        adult: true,
        contacts: contacts ?? { zalo: null, instagram: null, facebook: null },
      });
      track("matchmaking_pause");
      onSaved();
    } catch (err) {
      setError(matchError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ValidatedForm className="tuvi-form mt-6" check={check} onValidSubmit={(form) => void submit(form)}>
      {!me.gender ? (
        <div className="mb-4 rounded-2xl bg-[#fff6e8] px-4 py-3 text-[13px] leading-[1.6] text-[#8a5a1f]">
          Hồ sơ chưa có giới tính, Luna chưa ghép được.{" "}
          <button type="button" onClick={onEditProfile} className="font-medium underline underline-offset-4">Thêm giới tính</button>
        </div>
      ) : null}

      <MatchFields city={me.city} choice={choice} onChange={setChoice} contacts={contacts} />

      <div className="mt-6">
        <FieldCheckbox name="adult" defaultChecked={enabled}>
          Mình đủ 18 tuổi, và đồng ý để Luna giới thiệu hồ sơ này cho người hợp. Mình sẽ cư xử tử tế với người được ghép.
        </FieldCheckbox>
      </div>

      {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

      <Button className="tuvi-submit" type="submit" disabled={busy}>
        {busy ? <LoaderCircle className="spin" size={18} /> : <HeartHandshake size={18} />}
        {busy ? "Đang lưu…" : enabled ? "Lưu cài đặt" : "Bật se duyên"}
      </Button>
      {onCancel ? (
        <div className="mt-3 flex justify-center gap-4 text-[13px]">
          <button type="button" onClick={onCancel} className="text-[#6a5c7a] underline-offset-4 hover:underline">Quay lại</button>
          {enabled ? (
            <button type="button" onClick={() => void pause()} disabled={busy} className="text-[#a33] underline-offset-4 hover:underline">Tạm dừng se duyên</button>
          ) : null}
        </div>
      ) : null}
      <p className="tuvi-provider-note">
        <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
        Hồ sơ chỉ hiện cho người đủ 18 tuổi, đã đăng nhập và hợp tiêu chí của cả hai. Liên lạc chỉ mở khi hai bên cùng kết nối.
      </p>
    </ValidatedForm>
  );
}

function ChipGroup({
  name,
  label,
  value,
  onChange,
  options,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <div className="mt-4 first:mt-0" data-field={name}>
      <span className="block text-[13px] font-medium text-[#3d2f4f]">{label}</span>
      <div role="radiogroup" aria-label={label} className={cn("mt-2 grid gap-2", options.length === 3 ? "grid-cols-3" : options.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
        {options.map(([key, text]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={value === key}
            onClick={() => onChange(key)}
            className={cn(
              "h-10 rounded-full border px-2 text-[13px]! transition-colors",
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

/* ── Đã bật: Khám phá / Đã ghép ── */

function MatchHome({ me, onSettings }: { me: DatingProfile; onSettings: () => void }) {
  const [tab, setTab] = useState<"feed" | "matches">("feed");
  const [feed, setFeed] = useState<Suggestion[]>([]);
  const [feedState, setFeedState] = useState<"loading" | "idle" | "done">("loading");
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState("");
  const seen = useRef<string[]>([]);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setFeedState("loading");
    try {
      const page = await matchFeed(seen.current);
      seen.current = [...seen.current, ...page.map((p) => p.id)];
      setFeed((cur) => [...cur, ...page]);
      setFeedState(page.length < FEED_PAGE ? "done" : "idle");
      setError("");
      track("matchmaking_feed_page", { count: page.length, total: seen.current.length });
    } catch (err) {
      setError(matchError(err));
      setFeedState("idle");
    } finally {
      busy.current = false;
    }
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      setMatches(await listMatches());
    } catch (err) {
      setError(matchError(err));
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => { void loadMore(); void loadMatches(); }, 0);
    return () => window.clearTimeout(t);
  }, [loadMore, loadMatches]);

  // Cuộn gần tới cuối feed thì tải trang tiếp
  useEffect(() => {
    const el = sentinel.current;
    if (!el || tab !== "feed" || feedState !== "idle") return;
    const io = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) void loadMore(); }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [tab, feedState, loadMore]);

  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">LUNA SE DUYÊN</p>
          <h3 className="mt-1! font-[family-name:var(--font-serif-app)]! text-[24px]! text-[#281b44]">Người hợp với bạn</h3>
        </div>
        <button type="button" onClick={onSettings} aria-label="Cài đặt se duyên" title="Cài đặt se duyên" className="inline-flex size-10 items-center justify-center rounded-full bg-[#f1e9fa] text-[#6e4a92] transition-colors hover:bg-[#e4d6f2]">
          <Settings2 size={18} />
        </button>
      </div>

      <div role="tablist" className="mt-4 grid grid-cols-2 gap-2">
        {([["feed", "Khám phá"], ["matches", `Đã ghép${matches ? ` (${matches.length})` : ""}`]] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn("h-10 rounded-full border text-[14px]! transition-colors", tab === key ? "border-[#ac88cf] bg-[#eae0f7] font-medium text-[#221c2b]" : "border-[#e4d6f2] bg-white text-[#5b4a6b]")}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4! text-center text-[14px] text-[#8a5a1f]">{error}</p> : null}

      {tab === "feed" ? (
        feed.length ? (
          <>
            <div className="mt-4 flex flex-col gap-4">
              {feed.map((s) => (
                <SuggestionCard
                  key={s.id}
                  me={me}
                  person={s}
                  match={matches?.find((m) => m.id === s.id)}
                  onMatched={() => void loadMatches()}
                  onRemoved={() => setFeed((cur) => cur.filter((x) => x.id !== s.id))}
                />
              ))}
            </div>
            <div ref={sentinel} aria-hidden />
            {feedState === "loading" ? (
              <Loading />
            ) : feedState === "done" ? (
              <p className="mt-4! text-center text-[12px] text-[#8a7b99]">
                Bạn đã xem hết những người hợp quanh bạn.{" "}
                <button type="button" onClick={onSettings} className="font-medium text-[#6e4a92] underline underline-offset-4">Nới cài đặt</button> để gặp thêm.
              </p>
            ) : null}
          </>
        ) : feedState === "loading" ? (
          <Loading />
        ) : (
          <Empty>
            Chưa có ai hợp quanh bạn lúc này. Ghé lại sau nhé, người mới tham gia mỗi ngày.
            <br />
            Muốn gặp nhiều người hơn? <button type="button" onClick={onSettings} className="font-medium text-[#6e4a92] underline underline-offset-4">Nới cài đặt</button>
          </Empty>
        )
      ) : matches === null ? (
        <Loading />
      ) : matches.length ? (
        <div className="mt-4 flex flex-col gap-3">
          {matches.map((m) => (
            <MatchCard key={m.id} me={me} person={m} onRemoved={() => setMatches((cur) => cur?.filter((x) => x.id !== m.id) ?? null)} />
          ))}
        </div>
      ) : (
        <Empty>Chưa ghép đôi với ai. Khi bạn và một người cùng bấm &quot;Kết nối&quot;, liên lạc của hai bạn sẽ hiện ở đây.</Empty>
      )}
    </Panel>
  );
}

function Loading() {
  return <div className="flex justify-center py-8"><LoaderCircle className="spin text-[#6e4a92]" size={24} /></div>;
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-[#e4d6f2] p-6 text-center">
      <Sparkles size={22} className="mx-auto text-[#ac88cf]" />
      <p className="mt-2! text-[14px] leading-[1.7] text-[#5b5276]">{children}</p>
    </div>
  );
}

function useCompat(me: DatingProfile, person: MatchPerson) {
  return useMemo(() => compatibilityOf(profileOf(toPublicPerson(me)), profileOf(toPublicPerson(person))), [me, person]);
}

function PersonHead({ person, score, headline }: { person: MatchPerson; score: number; headline: string }) {
  const interests = parseInterests(person.bio);
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-serif-app)] text-[24px] leading-tight text-[#281b44]">{person.name}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f5] px-3 py-1 text-[12px] font-medium text-[#9c3b66]">
            <Cake size={13} /> {person.birth_year ?? person.lunar_year}
          </span>
          {person.city ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3fc] px-3 py-1 text-[12px] font-medium text-[#2c5a91]">
              <MapPin size={13} /> {person.city}
            </span>
          ) : null}
          {interests.map((t) => (
            <span key={t} className="rounded-full bg-[#f6f0fd] px-3 py-1 text-[12px] text-[#5b4a6b]">{t}</span>
          ))}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[28px] leading-none font-semibold text-[#6e4a92]">{score}%</p>
        <p className="mt-1! text-[12px] text-[#8a7b99]">{headline}</p>
      </div>
    </div>
  );
}

function SuggestionCard({
  me,
  person,
  match,
  onMatched,
  onRemoved,
}: {
  me: DatingProfile;
  person: Suggestion;
  match?: Match;
  onMatched: () => void;
  onRemoved: () => void;
}) {
  const compat = useCompat(me, person);
  const [decision, setDecision] = useState<boolean | null>(person.decision);
  const [matched, setMatched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const name = firstName(person.name);

  async function choose(like: boolean) {
    setBusy(true);
    setError("");
    try {
      const isMatch = await decide(person.id, like);
      setDecision(like);
      track("matchmaking_decide", { like: like ? 1 : 0, matched: isMatch ? 1 : 0, score: compat.score });
      if (isMatch) {
        setMatched(true);
        onMatched();
      }
    } catch (err) {
      setError(matchError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded-[24px] border border-[#efe4f7] bg-white/85 p-4 shadow-[0_4px_16px_#6b4b8212]">
      {person.liked_me && decision === null ? (
        <p className="mb-3! inline-flex items-center gap-1.5 rounded-full bg-[#fdf0f5] px-3 py-1 text-[12px] font-medium text-[#9c3b66]">💜 {name} đã kết nối với bạn</p>
      ) : null}
      <PersonHead person={person} score={compat.score} headline={compat.headline} />
      <p className="mt-3! text-[14px] leading-[1.7] text-[#4a4257]">{compat.strengths[0]}</p>

      {matched ? (
        <div className="mt-4 rounded-2xl bg-[#eae0f7] px-4 py-3">
          <p className="flex items-center gap-2 text-[14px] font-medium text-[#3a1f5c]">
            <PartyPopper size={18} /> Hai bạn đã kết nối! Làm quen với {name} nhé.
          </p>
          {match ? <ContactLinks person={match} /> : <Loading />}
        </div>
      ) : decision === true ? (
        <p className="mt-4! rounded-2xl bg-[#f6f0fd] px-4 py-3 text-[13px] text-[#5b4a6b]">Đã gửi kết nối. Khi {name} cũng kết nối với bạn, Zalo, Instagram, Facebook của {name} sẽ hiện ở tab Đã ghép.</p>
      ) : decision === false ? (
        <p className="mt-4! text-[13px] text-[#8a7b99]">Đã bỏ qua.</p>
      ) : (
        <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
          <Button variant="outline" className="h-12! rounded-full! text-[14px]!" disabled={busy} onClick={() => void choose(false)}>
            <X size={16} /> Bỏ qua
          </Button>
          <Button className="h-12! rounded-full! text-[15px]!" disabled={busy} onClick={() => void choose(true)}>
            {busy ? <LoaderCircle className="spin" size={16} /> : <HeartHandshake size={16} />} Kết nối
          </Button>
        </div>
      )}
      {error ? <p className="mt-2! text-[13px] text-[#b4475a]">{error}</p> : null}
      <SafetyActions person={person} onRemoved={onRemoved} />
    </article>
  );
}

function ContactLinks({ person }: { person: Match }) {
  const links = [
    person.zalo ? { label: "Zalo", href: zaloLink(person.zalo), cls: "bg-[#e8f1ff] text-[#0b5ed7]" } : null,
    person.instagram ? { label: "Instagram", href: instagramLink(person.instagram), cls: "bg-[#fdeef4] text-[#c13584]" } : null,
    person.facebook ? { label: "Facebook", href: facebookLink(person.facebook), cls: "bg-[#eaf0fb] text-[#1b4fb3]" } : null,
  ].filter((x): x is { label: string; href: string; cls: string } => Boolean(x));

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("matchmaking_contact_open", { channel: l.label })}
          className={cn("inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium", l.cls)}
        >
          Mở {l.label}
        </a>
      ))}
    </div>
  );
}

function MatchCard({ me, person, onRemoved }: { me: DatingProfile; person: Match; onRemoved: () => void }) {
  const compat = useCompat(me, person);

  return (
    <article className="rounded-[24px] border border-[#efe4f7] bg-white/85 p-4 shadow-[0_4px_16px_#6b4b8212]">
      <PersonHead person={person} score={compat.score} headline={compat.headline} />
      <ContactLinks person={person} />
      <p className="mt-3! text-[12px] text-[#8a7b99]">Gợi ý mở lời: &quot;Luna bảo tụi mình hợp {compat.score}% nè 👀&quot;</p>
      <SafetyActions person={person} onRemoved={onRemoved} />
    </article>
  );
}

/** Chặn / báo cáo: bấm hai lần để chắc chắn, không dùng hộp thoại của trình duyệt. */
function SafetyActions({ person, onRemoved }: { person: MatchPerson; onRemoved: () => void }) {
  const [mode, setMode] = useState<"" | "block" | "report">("");
  const [reason, setReason] = useState<ReportReason | "">("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<void>, event: string) {
    setBusy(true);
    setError("");
    try {
      await action();
      track(event);
      onRemoved();
    } catch (err) {
      setError(matchError(err));
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-dashed border-[#efe4f7] pt-3 text-[12px]">
      {mode === "" ? (
        <div className="flex gap-4 text-[#8a7b99]">
          <button type="button" onClick={() => setMode("block")} className="inline-flex items-center gap-1 hover:text-[#5b4a6b]"><Ban size={13} /> Chặn</button>
          <button type="button" onClick={() => setMode("report")} className="inline-flex items-center gap-1 hover:text-[#5b4a6b]"><ShieldAlert size={13} /> Báo cáo</button>
        </div>
      ) : mode === "block" ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[#5b4a6b]">Chặn {firstName(person.name)}? Hai bạn sẽ không thấy nhau nữa.</span>
          <button type="button" disabled={busy} onClick={() => void run(() => blockPerson(person.id), "matchmaking_block")} className="font-medium text-[#a33]">Chặn</button>
          <button type="button" onClick={() => setMode("")} className="text-[#8a7b99]">Thôi</button>
        </div>
      ) : (
        <div>
          <p className="text-[#5b4a6b]">Vì sao bạn báo cáo {firstName(person.name)}?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {REPORT_REASONS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setReason(key)}
                className={cn("rounded-full border px-3 py-1 text-[12px]!", reason === key ? "border-[#ac88cf] bg-[#eae0f7] text-[#221c2b]" : "border-[#e4d6f2] bg-white text-[#5b4a6b]")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => (reason ? void run(() => reportPerson(person.id, reason), "matchmaking_report") : setError("Hãy chọn một lý do."))}
              className="font-medium text-[#a33]"
            >
              Gửi báo cáo và chặn
            </button>
            <button type="button" onClick={() => { setMode(""); setReason(""); setError(""); }} className="text-[#8a7b99]">Thôi</button>
          </div>
        </div>
      )}
      {error ? <p className="mt-2! text-[#b4475a]">{error}</p> : null}
    </div>
  );
}
