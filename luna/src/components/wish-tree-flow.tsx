"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpen, BriefcaseBusiness, Coins, Flag, Heart, HeartPulse, House, LoaderCircle, Lock, LockKeyhole, Shuffle, Sparkles, Trash2, UserRound, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FieldCheckbox, FieldError, FieldTextarea, FormIntro, IconField, ValidatedForm, useClearFieldError } from "@/components/form-field";
import { useRelatedTools } from "@/components/related-tools";
import { GoogleMark } from "@/components/auth-menu";
import { LetterIcon, TREE_ASPECT, WishTreeArt } from "@/components/wish-tree-art";
import { signInWithGoogle } from "@/lib/supabase/client";
import { useAuthUser } from "@/lib/saved-results";
import { track } from "@/lib/analytics";
import { DEFAULT_WISH_COLOR, NICKNAME_MAX, WISH_COLORS, WISH_MAX, WISH_MIN, WISH_TOPICS, letterColors, relativeTime, topicOf, type MyWish, type TreeWish, type WishColor, type WishTopic } from "@/lib/wish-tree";
import {
  TREE_PAGE,
  blessWish,
  blessedIds,
  claimWishes,
  deleteWish,
  fetchMine,
  fetchTree,
  hangWish,
  reportWish,
  reportedIds,
  setWishDraft,
  takeWishDraft,
  type WishDraft,
} from "@/lib/wish-tree-client";

const ANONYMOUS = "Một người ẩn danh";

/** Nút nhỏ trong một dòng. `!` vì [data-slot="button"] trong globals.css (ngoài cascade layer) ép cao 54px. */
const SMALL_BUTTON = "h-10! gap-2! rounded-full! px-5! text-[13px]!";

/** Icon cho từng chủ đề ở ô chọn. Để ở đây chứ không ở lib/wish-tree.ts vì file đó dùng cả phía máy chủ. */
const TOPIC_ICONS: Record<WishTopic, LucideIcon> = {
  "tinh-yeu": Heart,
  "cong-viec": BriefcaseBusiness,
  "hoc-tap": BookOpen,
  "suc-khoe": HeartPulse,
  "gia-dinh": House,
  "tai-chinh": Coins,
  "ban-than": Sparkles,
};

/**
 * Cây ước nguyện. Ai cũng xem được cây; muốn treo điều ước thì phải đăng nhập.
 * Viết xong mới bấm treo khi chưa đăng nhập: bản nháp được giữ lại, đăng nhập
 * Google xong quay về trang là tự treo luôn, không phải viết lại.
 */
export function WishTreeFlow() {
  const { user, ready } = useAuthUser();
  const [tree, setTree] = useState<TreeWish[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [treeState, setTreeState] = useState<"loading" | "ready" | "error">("loading");
  const [shaking, setShaking] = useState(false);
  const [mine, setMine] = useState<MyWish[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [result, setResult] = useState<{ wish: MyWish; keptPrivate: boolean } | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  /** Đang tự treo bản nháp sau khi đăng nhập */
  const [autoHanging, setAutoHanging] = useState(false);
  /** Bản nháp tự treo không thành: đổ lại vào form kèm lỗi */
  const [retry, setRetry] = useState<{ draft: WishDraft; error: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const loadTree = useCallback(async (p: number) => {
    try {
      const { wishes, total } = await fetchTree(p);
      setTree(wishes);
      setTotal(total);
      setTreeState("ready");
    } catch {
      setTreeState("error");
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetchTree(0)
      .then(({ wishes, total }) => {
        if (!alive) return;
        setTree(wishes);
        setTotal(total);
        setTreeState("ready");
      })
      .catch(() => alive && setTreeState("error"));
    return () => {
      alive = false;
    };
  }, []);

  function onHung(wish: MyWish, keptPrivate: boolean) {
    setFormOpen(false);
    setResult({ wish, keptPrivate });
    setRetry(null);
    setMine((list) => [wish, ...list.filter((w) => w.id !== wish.id)]);
    setPage(0);
    setFreshId(wish.id);
    setTree((list) => [wish, ...list.filter((w) => w.id !== wish.id)]);
    setTotal((n) => n + 1);
    document.getElementById("wish-tree")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Đăng nhập rồi: gắn điều ước cũ của máy này vào tài khoản, đọc danh sách của mình,
  // và nếu vừa đi đăng nhập giữa chừng thì treo luôn bản nháp.
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    void (async () => {
      if (user) await claimWishes().catch(() => {});
      const list = await fetchMine().catch(() => [] as MyWish[]);
      if (!alive) return;
      setMine(list);
      const draft = user ? takeWishDraft() : null;
      if (!draft) return;
      setAutoHanging(true);
      const res = await hangWish(draft);
      if (!alive) return;
      setAutoHanging(false);
      if ("error" in res) {
        setRetry({ draft, error: res.error });
        setFormOpen(true);
        track("wish_tree_reject");
        return;
      }
      track("wish_tree_hung", { visibility: res.wish.is_public ? "public" : "private", blessing: res.wish.blessing ? 1 : 0, after_login: 1 });
      track("experience_complete", { method: "wish-tree" });
      onHung(res.wish, res.keptPrivate);
    })();
    return () => {
      alive = false;
    };
  }, [ready, user]);

  useRelatedTools(result ? "wish-tree" : null);

  const mineById = new Map(mine.map((w) => [w.id, w]));
  const pages = Math.max(1, Math.ceil(total / TREE_PAGE));
  // Thư của chính mình thì mở ra đủ nội dung, kể cả thư riêng tư
  const opened = openId ? (mineById.get(openId) ?? tree.find((w) => w.id === openId) ?? null) : null;

  async function shake() {
    track("wish_tree_shake");
    setShaking(true);
    setFreshId(null);
    const next = (page + 1) % pages;
    setPage(next);
    await Promise.all([loadTree(next), new Promise((r) => setTimeout(r, 600))]);
    setTimeout(() => setShaking(false), 500);
  }

  return (
    <div className="flow-body wish-tree-flow">
      <section id="wish-tree" className="tarot-setup-panel scroll-mt-24" aria-label="Cây ước nguyện">
        <p className="text-center text-[14px] leading-[1.7] text-[#735f80]">
          {treeState !== "ready"
            ? "Những lá thư ước nguyện của mọi người"
            : total
              ? <>Đang có <strong className="font-semibold text-[#5d4074]">{total.toLocaleString("vi-VN")}</strong> lá thư ước nguyện trên cây. Bấm vào một lá thư để mở.</>
              : "Cây còn trống. Bạn treo lá thư đầu tiên nhé."}
        </p>
        <div className="mt-4">
          {/* Chỉ dựng cây khi đã đọc được danh sách thư; trước đó giữ một khung cùng tỉ lệ để trang không nhảy */}
          {treeState === "ready" ? (
            <WishTreeArt
              wishes={tree}
              mineIds={new Set(mineById.keys())}
              freshId={freshId}
              shaking={shaking}
              onOpen={(w) => { track("wish_tree_open", { visibility: w.is_public ? "public" : "private" }); setOpenId(w.id); }}
            />
          ) : (
            <div
              className="mx-auto flex w-full max-w-[760px] flex-col items-center justify-center gap-3 rounded-[20px] bg-[#f8f1fb] text-[14px] text-[#735f80]"
              style={{ aspectRatio: TREE_ASPECT }}
              aria-live="polite"
            >
              {treeState === "loading" ? (
                <>
                  <LoaderCircle className="spin" size={24} aria-hidden="true" />
                  Đang mở cây…
                </>
              ) : (
                <>
                  <p>Chưa tải được cây ước nguyện.</p>
                  <Button variant="outline" onClick={() => { setTreeState("loading"); void loadTree(page); }}>
                    Thử lại
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            className="h-12 rounded-full px-6 text-[15px]"
            onClick={() => { track("wish_tree_write_open", { signed_in: user ? 1 : 0 }); setFormOpen(true); }}
            disabled={autoHanging}
          >
            <Sparkles size={18} /> {result ? "Viết thêm điều ước" : "Viết điều ước"}
          </Button>
          {pages > 1 ? (
            <Button variant="outline" onClick={() => void shake()} disabled={shaking}>
              <Shuffle size={16} /> Lắc cây xem thư khác
            </Button>
          ) : null}
        </div>
      </section>

      {autoHanging ? (
        <section className="tarot-setup-panel mt-5! flex items-center justify-center gap-3 text-[14px] text-[#735f80]" aria-live="polite">
          <LoaderCircle className="spin" size={18} /> Đang treo điều ước bạn vừa viết lên cây…
        </section>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          data-lenis-prevent
          className="block max-h-[calc(100dvh-32px)] max-w-[min(560px,calc(100%-32px))]! gap-0 overflow-x-hidden overflow-y-auto overscroll-contain rounded-[24px] border-0 bg-[#fffaf9] p-0 ring-1 ring-[#e8ddef]"
        >
          {formOpen ? (
            <WishForm key={retry ? "retry" : "new"} signedIn={!!user} initial={retry?.draft} initialError={retry?.error} onHung={onHung} />
          ) : null}
        </DialogContent>
      </Dialog>

      {mine.length ? (
        <MyWishes
          key={result?.wish.id ?? "list"}
          justHungId={result?.wish.id ?? null}
          wishes={mine}
          signedIn={!!user}
          onDelete={(id) => {
            setMine((list) => list.filter((w) => w.id !== id));
            setTree((list) => list.filter((w) => w.id !== id));
            if (result?.wish.id === id) setResult(null);
          }}
        />
      ) : null}

      <WishDialog
        key={opened?.id ?? "closed"}
        wish={opened}
        mine={opened ? mineById.has(opened.id) : false}
        onClose={() => setOpenId(null)}
        onBlessed={(id, count) => setTree((list) => list.map((w) => (w.id === id ? { ...w, bless_count: count } : w)))}
        onReported={(id) => { setOpenId(null); setTree((list) => list.filter((w) => w.id !== id)); }}
      />
    </div>
  );
}

/* ───────────── Form ───────────── */

function TopicChips({ value, onChange }: { value: WishTopic | ""; onChange: (v: WishTopic) => void }) {
  const clear = useClearFieldError();
  return (
    <div data-field="topic">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Điều ước về">
        {WISH_TOPICS.map((t) => {
          const Icon = TOPIC_ICONS[t.value];
          return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={value === t.value}
            className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 font-[family-name:var(--font-serif-app)] text-[13px] transition-colors ${
              value === t.value ? "border-[#ac88cf] bg-[#eae0f7] text-[#744f93]" : "border-[#e4d6f2] bg-[#f6f0fd] text-[#795493] hover:border-[#cdb4e3]"
            }`}
            onClick={() => { onChange(t.value); clear("topic"); }}
          >
            <Icon size={16} strokeWidth={1.8} style={{ color: t.ink }} aria-hidden="true" />
            {t.label}
          </button>
          );
        })}
      </div>
      <FieldError name="topic" />
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: WishColor; onChange: (v: WishColor) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Màu lá thư">
      {WISH_COLORS.map((c) => {
        const selected = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c.label}
            title={c.label}
            onClick={() => onChange(c.value)}
            className={`flex size-12 items-center justify-center rounded-[12px] border transition-colors ${
              selected ? "border-[#ac88cf] bg-[#eae0f7]" : "border-transparent hover:bg-[#f6f0fd]"
            }`}
          >
            <LetterIcon colors={c} className="w-9" />
          </button>
        );
      })}
    </div>
  );
}

function WishForm({
  signedIn,
  initial,
  initialError = "",
  onHung,
}: {
  signedIn: boolean;
  initial?: WishDraft;
  initialError?: string;
  onHung: (wish: MyWish, keptPrivate: boolean) => void;
}) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [topic, setTopic] = useState<WishTopic | "">(initial?.topic ?? "");
  const [color, setColor] = useState<WishColor>(initial?.color ?? DEFAULT_WISH_COLOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  function goLogin(draft: WishDraft) {
    setWishDraft(draft);
    track("login_start", { provider: "google", from: "wish-tree" });
    setLoading(true);
    void signInWithGoogle();
  }

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const draft: WishDraft = {
      content: content.trim(),
      nickname: String(data.get("nickname") || "").trim(),
      topic: topic as WishTopic,
      color,
      isPublic: !data.get("private"),
    };
    setError("");
    track("wish_tree_submit", { visibility: draft.isPublic ? "public" : "private", topic: draft.topic, signed_in: signedIn ? 1 : 0 });
    if (!signedIn) return goLogin(draft);
    setLoading(true);
    const res = await hangWish(draft);
    setLoading(false);
    if ("error" in res) {
      if (res.needsLogin) return goLogin(draft);
      setError(res.error);
      track("wish_tree_reject");
      return;
    }
    track("wish_tree_hung", { visibility: res.wish.is_public ? "public" : "private", blessing: res.wish.blessing ? 1 : 0 });
    track("experience_complete", { method: "wish-tree" });
    onHung(res.wish, res.keptPrivate);
  }

  return (
    <div>
      <ValidatedForm
        className="tuvi-form min-w-0 px-6 pt-8 pb-6 sm:px-8 [&_label]:min-w-0"
        onValidSubmit={(form) => void submit(form)}
        check={() => {
          const errors: Record<string, string> = {};
          if (content.trim() && content.trim().length < WISH_MIN) errors.content = `Điều ước cần ít nhất ${WISH_MIN} ký tự.`;
          if (!topic) errors.topic = "Hãy chọn một chủ đề cho điều ước.";
          return errors;
        }}
      >
        <DialogTitle className="text-center font-[family-name:var(--font-serif-app)] text-[28px] leading-tight font-normal text-[#4d2d68]">Viết điều ước của bạn</DialogTitle>
        <FormIntro>
          Viết điều bạn mong, gọn trong một hai câu. Điều ước được gấp thành một lá
          thư treo lên cây, và Lunara gửi bạn một lời chúc.
        </FormIntro>

        <label>
          Điều ước
          <FieldTextarea
            name="content"
            required
            maxLength={WISH_MAX}
            value={content}
            onChange={(e) => { setContent(e.target.value); setError(""); }}
            placeholder="Mong năm nay mình đủ can đảm nộp đơn vào công việc mơ ước…"
          />
        </label>
        <p className="tuvi-note">{content.trim().length}/{WISH_MAX} ký tự</p>

        <div className="mt-4">
          <p className="tarot-field-label">Điều ước về</p>
          <TopicChips value={topic} onChange={setTopic} />
        </div>

        <div className="mt-4">
          <p className="tarot-field-label">Màu lá thư</p>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <label className="mt-4 block">
          Tên hiển thị (không bắt buộc)
          <IconField icon={UserRound} name="nickname" maxLength={NICKNAME_MAX} defaultValue={initial?.nickname} placeholder={`Để trống thì hiện là “${ANONYMOUS}”`} />
        </label>

        <div className="mt-4">
          <FieldCheckbox name="private" defaultChecked={initial ? !initial.isPublic : false}>
            <span className="font-medium">Riêng tư</span> — lá thư vẫn treo trên cây, nhưng chỉ bạn mở được.
          </FieldCheckbox>
        </div>

        {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

        <Button className="tuvi-submit" type="submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={18} /> : signedIn ? null : <GoogleMark />}
          {loading ? (signedIn ? "Đang treo lên cây…" : "Đang mở đăng nhập…") : signedIn ? "Treo lên cây" : "Đăng nhập để treo lên cây"}
          {loading ? null : <ArrowRight size={18} />}
        </Button>
        <p className="tuvi-provider-note">
          <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
          {signedIn
            ? "Điều ước được gửi tới dịch vụ AI để viết lời chúc và lọc nội dung không phù hợp. Trên cây chỉ hiện tên hiển thị, không kèm thông tin tài khoản."
            : "Xem cây thì không cần tài khoản. Để treo điều ước, bạn đăng nhập Google — điều ước vừa viết được giữ lại và tự treo lên ngay sau khi đăng nhập."}
        </p>
      </ValidatedForm>
    </div>
  );
}

/* ───────────── Điều ước của tôi ───────────── */

function MyWishes({ wishes, onDelete, signedIn, justHungId }: { wishes: MyWish[]; onDelete: (id: string) => void; signedIn: boolean; justHungId: string | null }) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  // Vừa treo xong thì mở sẵn lời chúc của điều ước đó
  const [expanded, setExpanded] = useState<string | null>(justHungId);

  async function remove(id: string) {
    setBusy(id);
    try {
      await deleteWish(id);
      track("wish_tree_delete");
      onDelete(id);
    } catch {
      /* giữ nguyên dòng, người dùng bấm lại được */
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  return (
    <section className="tarot-setup-panel mt-5!" aria-labelledby="my-wishes-title">
      <h2 id="my-wishes-title" className="font-[family-name:var(--font-serif-app)] text-[24px] text-[#4d2d68]">
        Điều ước của bạn{" "}
        {/* Font serif dùng số kiểu cũ (số thấp như chỉ số dưới) → số đếm dùng font sans */}
        <span className="font-[family-name:var(--font-sans-app)] text-[16px] text-[#a282b4] lining-nums">({wishes.length})</span>
      </h2>
      <p className="mt-1 text-[12px] text-[#887492]">
        {signedIn ? "Gắn với tài khoản của bạn, mở trên máy nào cũng thấy." : "Đăng nhập để xem điều ước của bạn trên mọi máy."}
      </p>
      <ul className="mt-4 flex list-none flex-col gap-3 p-0">
        {wishes.map((w) => {
          const topic = topicOf(w.topic);
          const colors = letterColors(w);
          return (
            <li key={w.id} className="rounded-2xl border border-[#e8ddef] bg-white/60 p-4">
              <div className="flex items-start gap-3">
                {/* Công khai 🌏 · Riêng tư 🔒. Nền theo màu lá thư. */}
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: colors.paper, color: colors.ink }}
                  title={w.is_public ? "Công khai" : "Riêng tư"}
                >
                  <span role="img" aria-label={w.is_public ? "Công khai" : "Riêng tư"} className="text-[16px] leading-none">{w.is_public ? "🌏" : "🔒"}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-[1.6] break-words text-[#4a4257]">{w.content}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#887492]">
                    <span>{topic.label}</span>
                    <span>{relativeTime(w.created_at)}</span>
                    {w.hidden ? (
                      <span className="text-[#a43e53]">Đã ẩn khỏi cây do bị báo cáo</span>
                    ) : w.is_public ? (
                      <span className="flex items-center gap-1"><Heart size={12} fill="currentColor" aria-hidden="true" /> {w.bless_count} lời chúc</span>
                    ) : (
                      <span>Riêng tư</span>
                    )}
                    {w.blessing ? (
                      <button type="button" className="text-[#5b3f7a] underline underline-offset-2" onClick={() => setExpanded(expanded === w.id ? null : w.id)}>
                        {expanded === w.id ? "Ẩn lời chúc" : "Xem lời chúc"}
                      </button>
                    ) : null}
                  </p>
                  {expanded === w.id && w.blessing ? (
                    <p className="mt-2 border-l-2 border-[#e0d5f0] pl-3 text-[13px] leading-[1.7] text-[#5b5276]">{w.blessing}</p>
                  ) : null}
                </div>
                {confirming === w.id ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" className={SMALL_BUTTON} onClick={() => setConfirming(null)}>Giữ lại</Button>
                    <Button className={SMALL_BUTTON} onClick={() => void remove(w.id)} disabled={busy === w.id}>
                      {busy === w.id ? <LoaderCircle className="spin" size={14} /> : null} Xoá hẳn
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-2 text-[#a282b4] hover:bg-[#f6f0fd] hover:text-[#795493]"
                    aria-label="Xoá điều ước"
                    onClick={() => setConfirming(w.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────── Mở một lá thư ───────────── */

function WishDialog({
  wish,
  mine,
  onClose,
  onBlessed,
  onReported,
}: {
  wish: TreeWish | null;
  mine: boolean;
  onClose: () => void;
  onBlessed: (id: string, count: number) => void;
  onReported: (id: string) => void;
}) {
  // Mỗi lá thư mở ra là một lần mount mới (key = id), nên đọc trạng thái ngay lúc khởi tạo
  const [blessed, setBlessed] = useState(() => (wish ? blessedIds().has(wish.id) : false));
  const [reported, setReported] = useState(() => (wish ? reportedIds().has(wish.id) : false));
  const [count, setCount] = useState(wish?.bless_count ?? 0);
  const [busy, setBusy] = useState(false);
  const [askReport, setAskReport] = useState(false);
  const [error, setError] = useState("");

  async function bless() {
    if (!wish || blessed) return;
    setBusy(true);
    setError("");
    try {
      const next = await blessWish(wish.id);
      setBlessed(true);
      setCount(next);
      track("wish_tree_bless");
      onBlessed(wish.id, next);
    } catch {
      setError("Chưa gửi được lời chúc, bạn thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  async function report() {
    if (!wish) return;
    try {
      await reportWish(wish.id);
      setReported(true);
      track("wish_tree_report");
      setTimeout(() => onReported(wish.id), 1200);
    } catch {
      setError("Chưa gửi được báo cáo, bạn thử lại nhé.");
    }
  }

  const topic = wish ? topicOf(wish.topic) : null;
  const colors = wish ? letterColors(wish) : null;
  const sealed = !!wish && !wish.is_public && !mine;
  return (
    <Dialog open={!!wish} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-[min(400px,calc(100%-32px))]! gap-0 rounded-[20px] border-0 p-0 ring-0" showCloseButton>
        {wish && topic && colors ? (
          sealed ? (
            <div className="rounded-[20px] px-6 pt-10 pb-8 text-center" style={{ background: colors.paper, color: colors.ink }}>
              <span className="mx-auto flex size-12 items-center justify-center rounded-full text-white" style={{ background: colors.seal }}>
                <Lock size={20} aria-hidden="true" />
              </span>
              <DialogTitle className="mt-4 font-[family-name:var(--font-serif-app)] text-[22px] leading-[1.4] font-normal">
                Lá thư riêng tư
              </DialogTitle>
              <p className="mt-2 text-[14px] leading-[1.7] opacity-85">
                Người viết muốn giữ điều ước về {topic.label.toLowerCase()} này cho riêng mình,
                nên lá thư được niêm phong. Bạn vẫn có thể thầm chúc họ.
              </p>
              <p className="mt-4 text-[12px] opacity-70">Treo {relativeTime(wish.created_at)}</p>
            </div>
          ) : (
            <>
              <div className="rounded-t-[20px] px-6 pt-8 pb-6" style={{ background: colors.paper, color: colors.ink }}>
                <p className="flex items-center gap-1 text-[12px] tracking-[0.12em] uppercase opacity-70">
                  {topic.label}
                  {wish.is_public ? null : <Lock size={12} aria-label="Riêng tư" />}
                </p>
                <DialogTitle className="mt-2 font-[family-name:var(--font-serif-app)] text-[20px] leading-[1.5] font-normal break-words">
                  {wish.content}
                </DialogTitle>
                <p className="mt-4 text-[12px] opacity-80">
                  — {wish.nickname || ANONYMOUS} · {relativeTime(wish.created_at)}
                </p>
              </div>
              <div className="rounded-b-[20px] bg-[#fffaf9] px-6 pt-5 pb-6">
                {mine ? (
                  <p className="text-center text-[13px] text-[#735f80]">
                    {wish.is_public ? (
                      <>Đây là lá thư của bạn · <Heart size={12} fill="currentColor" className="inline align-[-1px]" aria-hidden="true" /> {count} lời chúc</>
                    ) : (
                      "Lá thư riêng tư của bạn. Người khác chỉ thấy phong thư niêm phong."
                    )}
                  </p>
                ) : (
                  <>
                    <Button className="w-full" onClick={() => void bless()} disabled={busy || blessed}>
                      {busy ? <LoaderCircle className="spin" size={16} /> : <Heart size={16} fill={blessed ? "currentColor" : "none"} />}
                      {blessed ? "Bạn đã gửi lời chúc" : "Gửi lời chúc"}
                      <span className="opacity-80">· {count}</span>
                    </Button>
                    {error ? <p className="mt-2 text-center text-[13px] text-[#a43e53]" role="alert">{error}</p> : null}
                    <div className="mt-4 text-center text-[12px] text-[#8a7b99]">
                      {reported ? (
                        "Đã báo cáo. Cảm ơn bạn giữ cây sạch đẹp."
                      ) : askReport ? (
                        <span className="inline-flex flex-wrap items-center justify-center gap-2">
                          Lá thư này không phù hợp?
                          <button type="button" className="font-medium text-[#a43e53] underline underline-offset-2" onClick={() => void report()}>Báo cáo</button>
                          <button type="button" className="underline underline-offset-2" onClick={() => setAskReport(false)}>Thôi</button>
                        </span>
                      ) : (
                        <button type="button" className="inline-flex items-center gap-1 underline underline-offset-2" onClick={() => setAskReport(true)}>
                          <Flag size={12} aria-hidden="true" /> Báo cáo lá thư không phù hợp
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
