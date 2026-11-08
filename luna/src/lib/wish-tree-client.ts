"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import type { MyWish, TreeWish, WishColor, WishTopic } from "@/lib/wish-tree";

/**
 * Gọi Supabase cho Cây ước nguyện từ trình duyệt. Treo điều ước thì đi qua
 * /api/wish (có kiểm duyệt); đọc cây, chúc, báo cáo, xoá thì gọi thẳng RPC.
 */

const DEVICE_KEY = "luna:wish-device:v1";
const BLESSED_KEY = "luna:wish-blessed:v1";
const REPORTED_KEY = "luna:wish-reported:v1";

/** Chìa của máy này để xem lại / xoá điều ước mình đã treo. */
export function wishDevice() {
  try {
    let token = localStorage.getItem(DEVICE_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, token);
    }
    return token;
  } catch {
    // Trình duyệt chặn bộ nhớ: vẫn treo được, chỉ không xem lại được trên máy này
    return crypto.randomUUID();
  }
}

function readSet(key: string) {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(key) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}
function addToSet(key: string, id: string) {
  try {
    const set = readSet(key);
    set.add(id);
    // Giữ 500 mục gần nhất là đủ
    localStorage.setItem(key, JSON.stringify([...set].slice(-500)));
  } catch {}
}
export const blessedIds = () => readSet(BLESSED_KEY);
export const reportedIds = () => readSet(REPORTED_KEY);

/** Bằng số điểm treo trên cây (ANCHORS trong wish-tree-art.tsx) */
export const TREE_PAGE = 16;

/** Một lượt thư trên cây, mới nhất trước. `page` để lắc cây xem thư cũ hơn. */
export async function fetchTree(page = 0) {
  const { data, error } = await supabaseBrowser().rpc("wish_tree", { p_offset: page * TREE_PAGE, p_limit: TREE_PAGE });
  if (error) throw error;
  const rows = (data ?? []) as (TreeWish & { total: number })[];
  const wishes: TreeWish[] = rows.map((r) => ({
    id: r.id,
    topic: r.topic,
    color: r.color,
    is_public: r.is_public,
    nickname: r.nickname,
    content: r.content,
    bless_count: r.bless_count,
    created_at: r.created_at,
  }));
  return { wishes, total: Number(rows[0]?.total ?? 0) };
}

export async function fetchMine() {
  const { data, error } = await supabaseBrowser().rpc("wish_mine", { p_device: wishDevice() });
  if (error) throw error;
  return (data ?? []) as MyWish[];
}

export async function blessWish(id: string) {
  const { data, error } = await supabaseBrowser().rpc("wish_bless", { p_device: wishDevice(), p_id: id });
  if (error) throw error;
  addToSet(BLESSED_KEY, id);
  return data as number;
}

export async function reportWish(id: string) {
  const { error } = await supabaseBrowser().rpc("wish_report", { p_device: wishDevice(), p_id: id });
  if (error) throw error;
  addToSet(REPORTED_KEY, id);
}

export async function deleteWish(id: string) {
  const { error } = await supabaseBrowser().rpc("wish_delete", { p_device: wishDevice(), p_id: id });
  if (error) throw error;
}

/** Đã đăng nhập: gắn điều ước của máy này vào tài khoản (gọi lại nhiều lần cũng không sao). */
export async function claimWishes() {
  await supabaseBrowser().rpc("wish_claim", { p_device: wishDevice() });
}

/* ---- Viết xong mới bị hỏi đăng nhập: giữ bản nháp qua chuyến đi tới Google ---- */

export type WishDraft = { content: string; nickname: string; topic: WishTopic; color: WishColor; isPublic: boolean };
const DRAFT_KEY = "luna:wish-draft:v1";

export function setWishDraft(draft: WishDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, at: Date.now() }));
  } catch {}
}

/** Lấy bản nháp (và xoá luôn). Quá 30 phút thì coi như đã bỏ dở. */
export function takeWishDraft(): WishDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    localStorage.removeItem(DRAFT_KEY);
    const { at, ...draft } = JSON.parse(raw) as WishDraft & { at: number };
    return Date.now() - at < 30 * 60 * 1000 ? draft : null;
  } catch {
    return null;
  }
}

export type HangResult = { wish: MyWish; keptPrivate: boolean } | { error: string; field?: "content" | "nickname"; needsLogin?: boolean };

export async function hangWish(input: WishDraft): Promise<HangResult> {
  try {
    const response = await fetch("/api/wish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, device: wishDevice() }),
    });
    const data = await response.json();
    if (!response.ok) return { error: data.error || "Chưa treo được điều ước, bạn thử lại nhé.", field: data.field, needsLogin: response.status === 401 };
    return { wish: data.wish as MyWish, keptPrivate: Boolean(data.keptPrivate) };
  } catch {
    return { error: "Mạng đang chập chờn, bạn thử lại nhé." };
  }
}
