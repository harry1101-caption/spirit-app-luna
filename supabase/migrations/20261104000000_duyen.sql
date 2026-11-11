-- Se duyên: hồ sơ duyên công khai + những lượt người khác ghép vào.
-- Đã áp dụng lên project bvhlmawkbfphoezhhmnq ngày 2026-11-04 (qua Supabase MCP).
--
-- Không lưu ngày sinh của ai: chỉ lưu năm âm lịch, cung hoàng đạo, Số Đường Đời —
-- đủ để chấm độ hợp (xem src/lib/hop-nhau.ts → PublicPerson).
--
-- Không bắt đăng nhập. Người tạo hồ sơ nhận `manage_token` (bí mật, giữ trên máy
-- + link quản lý); mọi thao tác của chủ hồ sơ đi qua các hàm RPC bên dưới, kiểm token.
-- Đăng nhập Google thì gắn `owner` để mở lại hồ sơ trên máy khác.

create table if not exists public.duyen_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,48}$'),
  owner uuid references auth.users (id) on delete set null,
  manage_token uuid not null default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  gender text check (gender in ('nam', 'nu')),
  looking_for text not null default 'ca-hai' check (looking_for in ('yeu', 'ban', 'ca-hai')),
  bio text check (char_length(bio) <= 140),
  lunar_year int not null check (lunar_year between 1900 and 2100),
  zodiac_index int not null check (zodiac_index between 0 and 11),
  life_path int not null check (life_path between 1 and 33),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists duyen_profiles_owner_idx on public.duyen_profiles (owner);

create table if not exists public.duyen_checks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.duyen_profiles (id) on delete cascade,
  visitor_name text check (char_length(visitor_name) <= 40),
  gender text check (gender in ('nam', 'nu')),
  lunar_year int not null check (lunar_year between 1900 and 2100),
  zodiac_index int not null check (zodiac_index between 0 and 11),
  life_path int not null check (life_path between 1 and 33),
  score int not null check (score between 0 and 100),
  headline text not null check (char_length(headline) <= 60),
  created_at timestamptz not null default now()
);
create index if not exists duyen_checks_profile_idx on public.duyen_checks (profile_id, created_at desc);

-- ── Quyền: đọc công khai đúng các cột không nhạy cảm; còn lại chỉ qua RPC ──
alter table public.duyen_profiles enable row level security;
alter table public.duyen_checks enable row level security;

revoke all on public.duyen_profiles from anon, authenticated;
revoke all on public.duyen_checks from anon, authenticated;
grant select (id, slug, name, gender, looking_for, bio, lunar_year, zodiac_index, life_path, active, created_at)
  on public.duyen_profiles to anon, authenticated;

drop policy if exists "duyen_profiles_public_read" on public.duyen_profiles;
create policy "duyen_profiles_public_read" on public.duyen_profiles
  for select to anon, authenticated using (active);

-- ── RPC ──

-- Tạo hồ sơ. Trả slug + token quản lý (chỉ lần này thấy token).
create or replace function public.duyen_create(
  p_name text, p_gender text, p_looking_for text, p_bio text,
  p_lunar_year int, p_zodiac_index int, p_life_path int, p_slug_base text
) returns table (slug text, manage_token uuid)
language plpgsql security definer set search_path = '' as $$
declare
  base text := left(regexp_replace(lower(coalesce(p_slug_base, '')), '[^a-z0-9]+', '-', 'g'), 32);
  candidate text;
  i int := 0;
begin
  base := trim(both '-' from base);
  if char_length(base) < 2 then base := 'duyen'; end if;
  -- Tuổi tối thiểu 16
  if p_lunar_year > extract(year from now())::int - 16 then
    raise exception 'too_young' using errcode = 'P0001';
  end if;
  -- Người đã đăng nhập: tối đa 5 hồ sơ
  if auth.uid() is not null and (select count(*) from public.duyen_profiles d where d.owner = auth.uid()) >= 5 then
    raise exception 'too_many_profiles' using errcode = 'P0001';
  end if;
  loop
    candidate := base || '-' || substr(md5(gen_random_uuid()::text), 1, 4);
    exit when not exists (select 1 from public.duyen_profiles d where d.slug = candidate);
    i := i + 1;
    if i > 8 then raise exception 'slug_conflict'; end if;
  end loop;
  return query
    insert into public.duyen_profiles as d (slug, owner, name, gender, looking_for, bio, lunar_year, zodiac_index, life_path)
    values (candidate, auth.uid(), trim(p_name), nullif(p_gender, ''), coalesce(nullif(p_looking_for, ''), 'ca-hai'),
            nullif(trim(coalesce(p_bio, '')), ''), p_lunar_year, p_zodiac_index, p_life_path)
    returning d.slug, d.manage_token;
end $$;

-- Người xem ghép vào một hồ sơ. Chặn spam: tối đa 20 lượt / phút / hồ sơ.
create or replace function public.duyen_add_check(
  p_slug text, p_visitor_name text, p_gender text,
  p_lunar_year int, p_zodiac_index int, p_life_path int, p_score int, p_headline text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  pid uuid;
  new_id uuid;
begin
  select d.id into pid from public.duyen_profiles d where d.slug = p_slug and d.active;
  if pid is null then raise exception 'not_found' using errcode = 'P0001'; end if;
  if (select count(*) from public.duyen_checks c where c.profile_id = pid and c.created_at > now() - interval '1 minute') >= 20 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  insert into public.duyen_checks (profile_id, visitor_name, gender, lunar_year, zodiac_index, life_path, score, headline)
  values (pid, nullif(trim(coalesce(p_visitor_name, '')), ''), nullif(p_gender, ''), p_lunar_year, p_zodiac_index, p_life_path,
          greatest(0, least(100, p_score)), left(coalesce(p_headline, ''), 60))
  returning id into new_id;
  return new_id;
end $$;

-- Chủ hồ sơ xem hồ sơ + danh sách người đã ghép.
create or replace function public.duyen_manage(p_token uuid)
returns jsonb
language sql security definer set search_path = '' stable as $$
  select jsonb_build_object(
    'profile', to_jsonb(d) - 'manage_token' - 'owner',
    'checks', coalesce((
      select jsonb_agg(to_jsonb(c) - 'profile_id' order by c.score desc, c.created_at desc)
      from (select * from public.duyen_checks c where c.profile_id = d.id order by c.created_at desc limit 500) c
    ), '[]'::jsonb)
  )
  from public.duyen_profiles d where d.manage_token = p_token;
$$;

create or replace function public.duyen_delete_check(p_token uuid, p_check uuid)
returns void
language sql security definer set search_path = '' as $$
  delete from public.duyen_checks c
  using public.duyen_profiles d
  where c.id = p_check and c.profile_id = d.id and d.manage_token = p_token;
$$;

create or replace function public.duyen_delete(p_token uuid)
returns void
language sql security definer set search_path = '' as $$
  delete from public.duyen_profiles d where d.manage_token = p_token;
$$;

-- Đăng nhập rồi: gắn hồ sơ vào tài khoản để mở lại trên máy khác.
create or replace function public.duyen_claim(p_token uuid)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = 'P0001'; end if;
  update public.duyen_profiles d set owner = auth.uid() where d.manage_token = p_token and d.owner is null;
end $$;

-- Các hồ sơ của tài khoản đang đăng nhập (kèm token để quản lý trên máy mới).
create or replace function public.duyen_mine()
returns table (slug text, name text, manage_token uuid)
language sql security definer set search_path = '' stable as $$
  select d.slug, d.name, d.manage_token from public.duyen_profiles d
  where auth.uid() is not null and d.owner = auth.uid()
  order by d.created_at desc;
$$;

revoke all on function public.duyen_create(text, text, text, text, int, int, int, text) from public;
revoke all on function public.duyen_add_check(text, text, text, int, int, int, int, text) from public;
revoke all on function public.duyen_manage(uuid) from public;
revoke all on function public.duyen_delete_check(uuid, uuid) from public;
revoke all on function public.duyen_delete(uuid) from public;
revoke all on function public.duyen_claim(uuid) from public;
revoke all on function public.duyen_mine() from public;

grant execute on function public.duyen_create(text, text, text, text, int, int, int, text) to anon, authenticated;
grant execute on function public.duyen_add_check(text, text, text, int, int, int, int, text) to anon, authenticated;
grant execute on function public.duyen_manage(uuid) to anon, authenticated;
grant execute on function public.duyen_delete_check(uuid, uuid) to anon, authenticated;
grant execute on function public.duyen_delete(uuid) to anon, authenticated;
grant execute on function public.duyen_claim(uuid) to authenticated;
grant execute on function public.duyen_mine() to authenticated;

-- Supabase tự cấp EXECUTE cho anon trên hàm mới; hai hàm này chỉ dành cho người đã đăng nhập.
revoke execute on function public.duyen_claim(uuid) from anon;
revoke execute on function public.duyen_mine() from anon;

notify pgrst, 'reload schema';
