-- Cây ước nguyện: mỗi người viết một điều ước, treo lên một cây chung.
--
-- Không bắt đăng nhập. Mỗi máy giữ một `device_token` (uuid, bí mật, nằm trong
-- localStorage) — đó là "chìa" để xem lại / xoá điều ước của mình. Đăng nhập
-- Google thì gắn `owner` để mở lại trên máy khác.
--
-- Điều ước được treo qua route /api/wish của Next (lọc từ ngữ + AI kiểm duyệt +
-- AI viết lời chúc). Để không ai gọi thẳng RPC mà lách kiểm duyệt, `wish_create`
-- đòi một khoá máy chủ nằm trong private.app_secrets — khoá này KHÔNG có trong
-- file này, được chèn riêng bằng SQL và đặt vào env WISH_SERVER_KEY.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_secrets (
  name text primary key,
  value text not null
);
revoke all on private.app_secrets from public, anon, authenticated;

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users (id) on delete set null,
  device_token uuid not null,
  nickname text check (char_length(nickname) <= 30),
  content text not null check (char_length(content) between 4 and 200),
  topic text not null check (topic in ('tinh-yeu', 'cong-viec', 'hoc-tap', 'suc-khoe', 'gia-dinh', 'tai-chinh', 'ban-than')),
  is_public boolean not null default true,
  blessing text check (char_length(blessing) <= 600),
  bless_count int not null default 0,
  report_count int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists wishes_public_idx on public.wishes (created_at desc) where is_public and not hidden;
create index if not exists wishes_device_idx on public.wishes (device_token, created_at desc);
create index if not exists wishes_owner_idx on public.wishes (owner, created_at desc);

-- Mỗi máy chúc / báo cáo một điều ước tối đa một lần
create table if not exists public.wish_blessings (
  wish_id uuid not null references public.wishes (id) on delete cascade,
  device_token uuid not null,
  created_at timestamptz not null default now(),
  primary key (wish_id, device_token)
);
create index if not exists wish_blessings_device_idx on public.wish_blessings (device_token, created_at desc);

create table if not exists public.wish_reports (
  wish_id uuid not null references public.wishes (id) on delete cascade,
  device_token uuid not null,
  created_at timestamptz not null default now(),
  primary key (wish_id, device_token)
);

-- ── Quyền: đọc công khai đúng các cột không nhạy cảm; còn lại chỉ qua RPC ──
alter table public.wishes enable row level security;
alter table public.wish_blessings enable row level security;
alter table public.wish_reports enable row level security;

revoke all on public.wishes from anon, authenticated;
revoke all on public.wish_blessings from anon, authenticated;
revoke all on public.wish_reports from anon, authenticated;
grant select (id, nickname, content, topic, bless_count, created_at) on public.wishes to anon, authenticated;

drop policy if exists "wishes_public_read" on public.wishes;
create policy "wishes_public_read" on public.wishes
  for select to anon, authenticated using (is_public and not hidden);

-- ── RPC ──

-- Treo điều ước. Chỉ máy chủ Next gọi (kèm khoá). Giới hạn: 5 điều ước / máy / ngày,
-- 200 điều ước / 10 phút toàn cây.
create or replace function public.wish_create(
  p_key text, p_device uuid, p_nickname text, p_content text, p_topic text, p_public boolean, p_blessing text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  new_id uuid;
begin
  if p_key is null or p_key is distinct from (select s.value from private.app_secrets s where s.name = 'wish_server_key') then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wishes w where w.device_token = p_device and w.created_at > now() - interval '1 day') >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wishes w where w.created_at > now() - interval '10 minutes') >= 200 then
    raise exception 'busy' using errcode = 'P0001';
  end if;
  insert into public.wishes (owner, device_token, nickname, content, topic, is_public, blessing)
  values (auth.uid(), p_device, nullif(trim(coalesce(p_nickname, '')), ''), trim(p_content), p_topic,
          coalesce(p_public, true), nullif(trim(coalesce(p_blessing, '')), ''))
  returning id into new_id;
  return new_id;
end $$;

-- Điều ước của chính mình (máy này + tài khoản đang đăng nhập), kể cả điều ước riêng tư.
create or replace function public.wish_mine(p_device uuid)
returns table (id uuid, nickname text, content text, topic text, is_public boolean, blessing text, bless_count int, hidden boolean, created_at timestamptz)
language sql security definer set search_path = '' stable as $$
  select w.id, w.nickname, w.content, w.topic, w.is_public, w.blessing, w.bless_count, w.hidden, w.created_at
  from public.wishes w
  where w.device_token = p_device or (auth.uid() is not null and w.owner = auth.uid())
  order by w.created_at desc
  limit 100;
$$;

create or replace function public.wish_delete(p_device uuid, p_id uuid)
returns void
language sql security definer set search_path = '' as $$
  delete from public.wishes w
  where w.id = p_id and (w.device_token = p_device or (auth.uid() is not null and w.owner = auth.uid()));
$$;

-- Gửi lời chúc (một trái tim). Trả số lời chúc mới. Chúc lại lần nữa thì không cộng.
create or replace function public.wish_bless(p_device uuid, p_id uuid)
returns int
language plpgsql security definer set search_path = '' as $$
declare
  n int;
begin
  if not exists (select 1 from public.wishes w where w.id = p_id and w.is_public and not w.hidden) then
    raise exception 'not_found' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wish_blessings b where b.device_token = p_device and b.created_at > now() - interval '1 hour') >= 120 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  insert into public.wish_blessings (wish_id, device_token) values (p_id, p_device) on conflict do nothing;
  if found then
    update public.wishes w set bless_count = w.bless_count + 1 where w.id = p_id returning w.bless_count into n;
  else
    select w.bless_count into n from public.wishes w where w.id = p_id;
  end if;
  return n;
end $$;

-- Báo cáo điều ước không phù hợp. 3 máy khác nhau báo cáo thì tự ẩn khỏi cây.
create or replace function public.wish_report(p_device uuid, p_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.wish_reports (wish_id, device_token) values (p_id, p_device) on conflict do nothing;
  if found then
    update public.wishes w set report_count = w.report_count + 1, hidden = w.hidden or w.report_count + 1 >= 3
    where w.id = p_id;
  end if;
end $$;

-- Đăng nhập rồi: gắn điều ước của máy này vào tài khoản.
create or replace function public.wish_claim(p_device uuid)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = 'P0001'; end if;
  update public.wishes w set owner = auth.uid() where w.device_token = p_device and w.owner is null;
end $$;

revoke all on function public.wish_create(text, uuid, text, text, text, boolean, text) from public;
revoke all on function public.wish_mine(uuid) from public;
revoke all on function public.wish_delete(uuid, uuid) from public;
revoke all on function public.wish_bless(uuid, uuid) from public;
revoke all on function public.wish_report(uuid, uuid) from public;
revoke all on function public.wish_claim(uuid) from public;

grant execute on function public.wish_create(text, uuid, text, text, text, boolean, text) to anon, authenticated;
grant execute on function public.wish_mine(uuid) to anon, authenticated;
grant execute on function public.wish_delete(uuid, uuid) to anon, authenticated;
grant execute on function public.wish_bless(uuid, uuid) to anon, authenticated;
grant execute on function public.wish_report(uuid, uuid) to anon, authenticated;
grant execute on function public.wish_claim(uuid) to authenticated;
revoke execute on function public.wish_claim(uuid) from anon;

notify pgrst, 'reload schema';
