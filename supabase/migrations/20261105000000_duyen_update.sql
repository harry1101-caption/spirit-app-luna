-- Se duyên: chủ hồ sơ sửa hồ sơ (giữ nguyên link + danh sách người đã ghép).
-- Ngày sinh không lưu, nên các trường suy ra từ ngày sinh (năm âm, cung, Số chủ đạo, năm sinh)
-- chỉ đổi khi người dùng nhập lại ngày sinh — truyền null là giữ nguyên.
-- Đã áp dụng lên project bvhlmawkbfphoezhhmnq ngày 2026-11-05 (qua Supabase MCP).

create or replace function public.duyen_update(
  p_token uuid, p_name text, p_gender text, p_looking_for text, p_bio text, p_city text,
  p_lunar_year int default null, p_zodiac_index int default null, p_life_path int default null, p_birth_year int default null
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_birth_year is not null and p_birth_year > extract(year from now())::int - 16 then
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

revoke all on function public.duyen_update(uuid, text, text, text, text, text, int, int, int, int) from public;
grant execute on function public.duyen_update(uuid, text, text, text, text, text, int, int, int, int) to anon, authenticated;

notify pgrst, 'reload schema';
