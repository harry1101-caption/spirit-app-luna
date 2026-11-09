-- Yêu cầu tư vấn 1-1 với reader, gửi từ form dưới kết quả của mỗi tính năng.
--
-- Không bắt đăng nhập. Ai cũng GHI được (qua route /api/consultation), nhưng
-- không ai ĐỌC được từ client: dữ liệu liên hệ chỉ xem ở Supabase dashboard
-- hoặc bằng service role. Đăng nhập thì gắn `owner` để reader biết là ai.

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users (id) on delete set null,
  feature text not null check (char_length(feature) between 1 and 40),
  name text not null check (char_length(name) between 1 and 60),
  contact text not null check (char_length(contact) between 5 and 120),
  channel text not null check (channel in ('zalo', 'phone', 'facebook', 'video')),
  preferred_time text not null check (preferred_time in ('morning', 'afternoon', 'evening', 'any')),
  note text check (char_length(note) <= 600),
  result_title text check (char_length(result_title) <= 200),
  status text not null default 'new' check (status in ('new', 'contacted', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists consultation_requests_status_idx on public.consultation_requests (status, created_at desc);

alter table public.consultation_requests enable row level security;

revoke all on public.consultation_requests from anon, authenticated;
grant insert (owner, feature, name, contact, channel, preferred_time, note, result_title)
  on public.consultation_requests to anon, authenticated;

drop policy if exists consultation_insert on public.consultation_requests;
create policy consultation_insert on public.consultation_requests
  for insert to anon, authenticated
  with check (owner is null or owner = auth.uid());

-- Chặn spam: một liên hệ gửi tối đa 5 yêu cầu mỗi ngày.
create or replace function public.consultation_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*) from public.consultation_requests
    where contact = new.contact and created_at > now() - interval '1 day'
  ) >= 5 then
    raise exception 'rate_limited';
  end if;
  return new;
end;
$$;

drop trigger if exists consultation_rate_limit on public.consultation_requests;
create trigger consultation_rate_limit
  before insert on public.consultation_requests
  for each row execute function public.consultation_rate_limit();
