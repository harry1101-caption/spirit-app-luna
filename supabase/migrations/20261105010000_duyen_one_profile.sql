-- Se duyên: mỗi tài khoản một hồ sơ (trước đây tối đa 5). Muốn đổi thì sửa, hoặc xoá rồi tạo lại.
-- Khách chưa đăng nhập: app tự chuyển sang hồ sơ đang có trên máy, không cho tạo thêm.
-- Đã áp dụng lên project bvhlmawkbfphoezhhmnq ngày 2026-11-05 (qua Supabase MCP).

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
  if auth.uid() is not null and exists (select 1 from public.duyen_profiles d where d.owner = auth.uid()) then
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
