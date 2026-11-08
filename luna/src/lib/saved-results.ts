"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Lưu kết quả trải nghiệm vào tài khoản (bảng `saved_results`, có RLS).
 * Mỗi feature tự quyết payload là gì — đủ để dựng lại đúng màn hình kết quả.
 */

export type SavedFeature =
  | "tarot"
  | "lenormand"
  | "daily"
  | "personality"
  | "dailycard"
  | "tuvi"
  | "bat-tu"
  | "than-so-hoc"
  | "human-design"
  | "chi-tay"
  | "giac-mo"
  | "xin-xam"
  | "kinh-dich"
  | "phac-hoa";

export type SaveableResult = {
  feature: SavedFeature;
  title: string;
  summary?: string;
  payload: unknown;
};

export type SavedRow = {
  id: string;
  feature: SavedFeature;
  title: string;
  summary: string | null;
  created_at: string;
};

export const FEATURE_LABEL: Record<SavedFeature, string> = {
  tarot: "Tarot",
  lenormand: "Lenormand",
  daily: "Chiêm tinh",
  personality: "Tính cách",
  dailycard: "Lá bài hôm nay",
  tuvi: "Tử Vi",
  "bat-tu": "Bát Tự",
  "than-so-hoc": "Thần số học",
  "human-design": "Human Design",
  "chi-tay": "Chỉ tay",
  "giac-mo": "Giấc mơ",
  "xin-xam": "Xin xăm",
  "kinh-dich": "Kinh Dịch",
  "phac-hoa": "Phác hoạ người ấy",
};

/** Trang mở lại kết quả đã lưu (`?saved=<id>`) */
export const FEATURE_ROUTE: Record<SavedFeature, string> = {
  tarot: "/tarot",
  lenormand: "/lenormand",
  daily: "/chiem-tinh",
  personality: "/tinh-cach",
  dailycard: "/tarot",
  tuvi: "/tu-vi",
  "bat-tu": "/bat-tu",
  "than-so-hoc": "/than-so-hoc",
  "human-design": "/human-design",
  "chi-tay": "/chi-tay",
  "giac-mo": "/giac-mo",
  "xin-xam": "/xin-xam",
  "kinh-dich": "/kinh-dich",
  "phac-hoa": "/phac-hoa",
};

/** Ưu đãi: dùng không giới hạn trong 3 tháng kể từ ngày tạo tài khoản */
export const FREE_MONTHS = 3;

export function freeUntil(user: Pick<User, "created_at">) {
  const d = new Date(user.created_at);
  d.setMonth(d.getMonth() + FREE_MONTHS);
  return d;
}

export const formatViDate = (d: Date | string) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(
    typeof d === "string" ? new Date(d) : d,
  );

export async function saveResult(result: SaveableResult) {
  const { data, error } = await supabaseBrowser()
    .from("saved_results")
    .insert({ feature: result.feature, title: result.title.slice(0, 200), summary: result.summary?.slice(0, 600) ?? null, payload: result.payload })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

/** Cập nhật kết quả đã tự lưu (vd. khi phần luận giải AI về sau). */
export async function updateSaved(id: string, result: SaveableResult) {
  const { error } = await supabaseBrowser()
    .from("saved_results")
    .update({ title: result.title.slice(0, 200), summary: result.summary?.slice(0, 600) ?? null, payload: result.payload })
    .eq("id", id);
  if (error) throw error;
}

export async function listSaved() {
  const { data, error } = await supabaseBrowser()
    .from("saved_results")
    .select("id, feature, title, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as SavedRow[];
}

export async function getSaved(id: string) {
  const { data, error } = await supabaseBrowser().from("saved_results").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as (SavedRow & { payload: unknown }) | null;
}

export async function deleteSaved(id: string) {
  const { error } = await supabaseBrowser().from("saved_results").delete().eq("id", id);
  if (error) throw error;
}

/* ---- Lưu sau khi đăng nhập: kết quả được giữ tạm trên máy qua chuyến đi tới Google ---- */

const PENDING_KEY = "luna:pending-save:v1";
const JUST_SAVED_KEY = "luna:just-saved:v1";

export function setPendingSave(result: SaveableResult) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ ...result, at: Date.now() }));
  } catch {
    /* bộ nhớ đầy (ảnh lớn) → bỏ qua, người dùng vẫn đăng nhập được */
  }
}

export function takePendingSave(): SaveableResult | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    const data = JSON.parse(raw) as SaveableResult & { at: number };
    // Quá 30 phút thì coi như đã bỏ dở
    return Date.now() - data.at < 30 * 60 * 1000 ? data : null;
  } catch {
    return null;
  }
}

export function markJustSaved(id: string) {
  try {
    sessionStorage.setItem(JUST_SAVED_KEY, id);
  } catch {}
}
/** Kết quả này vừa được lưu ngay sau khi đăng nhập? (chỉ đọc, xoá bằng clearJustSaved) */
export function isJustSaved(id: string | null) {
  try {
    return !!id && sessionStorage.getItem(JUST_SAVED_KEY) === id;
  } catch {
    return false;
  }
}
export function clearJustSaved() {
  try {
    sessionStorage.removeItem(JUST_SAVED_KEY);
  } catch {}
}

/** id kết quả đã lưu đang mở (?saved=...) */
export function savedIdFromUrl() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("saved");
}

/** Phiên đăng nhập hiện tại, cập nhật khi đăng nhập / đăng xuất */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

/**
 * Mở lại kết quả đã lưu: nếu URL có `?saved=<id>` của đúng feature này thì
 * tải payload và gọi `apply` để flow dựng lại màn hình kết quả.
 */
export function useRestoreSaved(feature: SavedFeature | SavedFeature[], apply: (payload: never, row: SavedRow) => void) {
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });
  const features = Array.isArray(feature) ? feature : [feature];
  const key = features.join(",");
  useEffect(() => {
    const id = savedIdFromUrl();
    if (!id) return;
    let alive = true;
    getSaved(id)
      .then((row) => {
        if (alive && row && key.split(",").includes(row.feature)) applyRef.current(row.payload as never, row);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);
}
