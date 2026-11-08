"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Cloud, LoaderCircle, LockKeyhole, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/supabase/client";
import {
  deleteSaved,
  FEATURE_LABEL,
  FEATURE_ROUTE,
  formatViDate,
  freeUntil,
  listSaved,
  useAuthUser,
  type SavedRow,
} from "@/lib/saved-results";
import { track } from "@/lib/analytics";

/** "Khám phá của tôi" → các kết quả đã lưu trong tài khoản (xem được trên mọi thiết bị) */
export function AccountSavedList({ hideGuest = false }: { hideGuest?: boolean }) {
  const { user, ready } = useAuthUser();
  const [rows, setRows] = useState<SavedRow[] | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  // Đọc giờ sau khi mount: Date.now() lúc render bị Next chặn khi prerender route /kham-pha-cua-toi
  const [now, setNow] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chỉ lấy mốc thời gian một lần sau khi hydrate
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    listSaved()
      .then((r) => alive && setRows(r))
      .catch(() => alive && setError("Chưa tải được kết quả đã lưu. Bạn thử tải lại trang nhé."));
    return () => {
      alive = false;
    };
  }, [user]);

  async function remove(id: string) {
    setDeleting(id);
    try {
      await deleteSaved(id);
      setRows((r) => r?.filter((x) => x.id !== id) ?? null);
      track("result_delete");
    } catch {
      setError("Chưa xoá được, bạn thử lại nhé.");
    } finally {
      setDeleting(null);
    }
  }

  if (!ready) return null;

  if (!user) {
    if (hideGuest) return null;
    return (
      <section className="account-library account-library-guest" aria-labelledby="account-saved-title" data-reveal>
        <div className="account-library-symbol" aria-hidden="true">
          <Cloud size={28} strokeWidth={1.25} />
          <span><LockKeyhole size={13} /></span>
        </div>
        <div className="account-library-copy">
          <p className="library-kicker">Đồng bộ riêng tư</p>
          <h2 id="account-saved-title">Mang những khám phá theo bạn</h2>
          <p>Đăng nhập để lưu kết quả vào tài khoản và đọc lại trên mọi thiết bị. Chỉ mình bạn nhìn thấy.</p>
        </div>
        <Button variant="outline" className="account-library-login" onClick={() => { track("login_start", { provider: "google", from: "history" }); void signInWithGoogle(); }}>
          <UserRound size={15} /> Đăng nhập với Google
        </Button>
      </section>
    );
  }

  return (
    <section className="account-library account-library-signed" aria-labelledby="account-saved-title" data-reveal>
      <header className="account-library-header">
        <div>
          <p className="library-kicker"><Cloud size={14} /> Đồng bộ tài khoản</p>
          <h2 id="account-saved-title">Thư viện trên mây</h2>
        </div>
        <p className="account-library-status">
          {freeUntil(user).getTime() > now
            ? `Dùng không giới hạn đến ${formatViDate(freeUntil(user))}`
            : user.email}
        </p>
      </header>
      {error ? <p className="account-library-error">{error}</p> : null}
      {rows === null ? (
        // Tải lỗi thì chỉ hiện câu báo lỗi phía trên, không quay spinner mãi
        error ? null : <div className="account-library-loading"><LoaderCircle className="spin" size={22} /><span>Đang mở thư viện…</span></div>
      ) : rows.length === 0 ? (
        <div className="account-library-empty">
          <LockKeyhole size={19} strokeWidth={1.3} />
          <p>Chưa có kết quả nào trên mây.</p>
          <span>Ở cuối mỗi trang kết quả, chọn “Lưu vào tài khoản” để giữ lại.</span>
        </div>
      ) : (
        <ul className="account-result-list">
          {rows.map((r, index) => (
            <li key={r.id} className="account-result-item">
              <div className="account-result-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="account-result-content">
                <p className="account-result-meta">{FEATURE_LABEL[r.feature] ?? r.feature} <span>·</span> {formatViDate(r.created_at)}</p>
                <h3>{r.title}</h3>
                {r.summary ? <p className="account-result-summary">{r.summary}</p> : null}
              </div>
              <div className="account-result-actions">
                <a
                  href={`${FEATURE_ROUTE[r.feature] ?? "/"}?saved=${r.id}`}
                  onClick={() => track("saved_result_open", { feature: r.feature })}
                  className="account-result-open"
                >
                  Xem lại <ArrowRight size={15} />
                </a>
                <button
                  type="button"
                  aria-label={`Xoá ${r.title}`}
                  disabled={deleting === r.id}
                  onClick={() => void remove(r.id)}
                  className="account-result-delete"
                >
                  {deleting === r.id ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
