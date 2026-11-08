-- Se duyên: hồ sơ duyên chỉ dành cho người từ 18 tuổi (trước đây 16), cho khớp với ghép đôi.
-- Server chỉ có năm sinh nên chặn theo năm; form trong app kiểm theo đúng ngày sinh và bắt
-- tích ô cam kết. Hồ sơ cũ của người 16–17 tuổi vẫn giữ, nhưng không bật ghép đôi được.

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
  if coalesce(p_birth_year, p_lunar_year) > extract(year from now())::int - 18 then
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

create or replace function public.duyen_update(
  p_token uuid, p_name text, p_gender text, p_looking_for text, p_bio text, p_city text,
  p_lunar_year int default null, p_zodiac_index int default null, p_life_path int default null, p_birth_year int default null
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_birth_year is not null and p_birth_year > extract(year from now())::int - 18 then
    raise exception 'too_young' using errcode = 'P0001';
  end if;
  update public.duyen_profiles d set
    name = trim(p_name),
    gender = nullif(p_gender, ''),
    looking_for = coalesce(nullif(p_looking_for, ''), d.looking_for),
    bio = nullif(trim(coalesce(p_bio, '')), ''),
    city = nullif(trim(coalesce(p_city, '')), ''),
    lunar_year = coalesce(p_lunar_year, d.lunar_year),
    zodiac_index = coalesce(p_zodiac_index, d.zodiac_index),
    life_path = coalesce(p_life_path, d.life_path),
    birth_year = coalesce(p_birth_year, d.birth_year)
  where d.manage_token = p_token;
  if not found then raise exception 'not_found' using errcode = 'P0001'; end if;
end $$;

notify pgrst, 'reload schema';
