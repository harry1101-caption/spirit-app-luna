-- Kết quả trải nghiệm người dùng chủ động lưu vào tài khoản.
-- Chạy trong Supabase Dashboard → SQL Editor (một lần).

create table if not exists public.saved_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  feature text not null check (char_length(feature) between 1 and 40),
  title text not null check (char_length(title) between 1 and 200),
  summary text check (char_length(summary) <= 600),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  -- Ảnh Phác hoạ ~200KB; chặn bản ghi bất thường
  constraint saved_results_payload_size check (pg_column_size(payload) < 1500000)
);

create index if not exists saved_results_user_created_idx
  on public.saved_results (user_id, created_at desc);

-- Row Level Security: mỗi người chỉ thấy / thêm / xoá kết quả của chính mình
alter table public.saved_results enable row level security;

drop policy if exists "saved_results_select_own" on public.saved_results;
create policy "saved_results_select_own" on public.saved_results
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "saved_results_insert_own" on public.saved_results;
create policy "saved_results_insert_own" on public.saved_results
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "saved_results_delete_own" on public.saved_results;
create policy "saved_results_delete_own" on public.saved_results
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Khách (anon) không có quyền gì trên bảng này
revoke all on public.saved_results from anon;
grant select, insert, delete on public.saved_results to authenticated;
