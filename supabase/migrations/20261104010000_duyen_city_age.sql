-- Se duyên: thêm nơi sống (tỉnh/thành) và năm sinh dương lịch — người xem hồ sơ cần biết
-- "ở gần không, hơn kém mấy tuổi". Chỉ tới cấp tỉnh/thành để giữ riêng tư.
-- Đã áp dụng lên project bvhlmawkbfphoezhhmnq ngày 2026-11-04 (qua Supabase MCP).

alter table public.duyen_profiles
  add column if not exists city text check (char_length(city) <= 40),
  add column if not exists birth_year int check (birth_year between 1900 and 2100);
alter table public.duyen_checks
  add column if not exists city text check (char_length(city) <= 40),
  add column if not exists birth_year int check (birth_year between 1900 and 2100);

grant select (city, birth_year) on public.duyen_profiles to anon, authenticated;

-- Hàm cũ đổi chữ ký → bỏ rồi tạo lại
drop function if exists public.duyen_create(text, text, text, text, int, int, int, text);
drop function if exists public.duyen_add_check(text, text, text, int, int, int, int, text);

create or replace function public.duyen_create(
  p_name text, p_gender text, p_looking_for text, p_bio text,
  p_lunar_year int, p_zodiac_index int, p_life_path int, p_slug_base text,
  p_city text default null, p_birth_year int default null
) returns table (slug text, manage_token uuid)
language plpgsql security definer set search_path = '' as $$
declare
  base text := left(regexp_replace(lower(coalesce(p_slug_base, '')), '[^a-z0-9]+', '-', 'g'), 32);
  candidate text;
  i int := 0;
begin
  base := trim(both '-' from base);
  if char_length(base) < 2 then base := 'duyen'; end if;
  if coalesce(p_birth_year, p_lunar_year) > extract(year from now())::int - 16 then
    raise exception 'too_young' using errcode = 'P0001';
  end if;
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
    insert into public.duyen_profiles as d (slug, owner, name, gender, looking_for, bio, lunar_year, zodiac_index, life_path, city, birth_year)
    values (candidate, auth.uid(), trim(p_name), nullif(p_gender, ''), coalesce(nullif(p_looking_for, ''), 'ca-hai'),
            nullif(trim(coalesce(p_bio, '')), ''), p_lunar_year, p_zodiac_index, p_life_path,
            nullif(trim(coalesce(p_city, '')), ''), p_birth_year)
    returning d.slug, d.manage_token;
end $$;

create or replace function public.duyen_add_check(
  p_slug text, p_visitor_name text, p_gender text,
  p_lunar_year int, p_zodiac_index int, p_life_path int, p_score int, p_headline text,
  p_city text default null, p_birth_year int default null
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
  insert into public.duyen_checks (profile_id, visitor_name, gender, lunar_year, zodiac_index, life_path, score, headline, city, birth_year)
  values (pid, nullif(trim(coalesce(p_visitor_name, '')), ''), nullif(p_gender, ''), p_lunar_year, p_zodiac_index, p_life_path,
          greatest(0, least(100, p_score)), left(coalesce(p_headline, ''), 60),
          nullif(trim(coalesce(p_city, '')), ''), p_birth_year)
  returning id into new_id;
  return new_id;
end $$;

revoke all on function public.duyen_create(text, text, text, text, int, int, int, text, text, int) from public;
revoke all on function public.duyen_add_check(text, text, text, int, int, int, int, text, text, int) from public;
grant execute on function public.duyen_create(text, text, text, text, int, int, int, text, text, int) to anon, authenticated;
grant execute on function public.duyen_add_check(text, text, text, int, int, int, int, text, text, int) to anon, authenticated;

notify pgrst, 'reload schema';
