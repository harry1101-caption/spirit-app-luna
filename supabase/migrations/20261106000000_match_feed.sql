-- Se duyên → feed: thay cho "mỗi ngày 3 người", người dùng lướt dần danh sách những người hợp
-- (cùng bộ lọc giới tính / tuổi / thành phố của hai bên), bấm "Kết nối" hoặc "Bỏ qua".
-- Liên lạc vẫn chỉ lộ khi HAI BÊN cùng kết nối (list_matches không đổi).
--
-- Mỗi người được trả ra feed cũng được ghi vào match_suggestions (ngày hôm nay), nên
-- decide_match / block_match / report_match vẫn giữ luật "chỉ thao tác được với người
-- mình đã được cho thấy" mà không cần sửa.
--
-- p_seen: id những người client đã tải trong phiên này (để trang sau không lặp lại).

create or replace function public.get_match_feed(p_seen uuid[] default '{}', p_limit int default 10)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public.my_dating_profile_id();
  today date := public.today_in_vietnam();
  my public.duyen_profiles;
  ms public.match_settings;
  my_year int;
  lim int := greatest(1, least(20, coalesce(p_limit, 10)));
  ids uuid[];
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  select * into ms from public.match_settings s where s.profile_id = me;
  if ms is null or not ms.enabled then raise exception 'not_enabled' using errcode = 'P0001'; end if;
  select * into my from public.duyen_profiles d where d.id = me;
  my_year := coalesce(my.birth_year, my.lunar_year);

  -- Chặn lướt vô hạn để gom hồ sơ: tối đa 200 người mới mỗi ngày
  if (select count(*) from public.match_suggestions g where g.profile_id = me and g.day = today) >= 200 then
    return '[]'::jsonb;
  end if;

  select array_agg(pick.id order by pick.sort desc) into ids
  from (
    select c.id,
      -- Người đã kết nối với mình lên trước — để hai bên có cơ hội gặp nhau
      (case when exists (select 1 from public.match_likes l where l.from_id = c.id and l.to_id = me and l.liked) then 1000 else 0 end)
      + public.compatibility_rank_score(my.lunar_year, my.zodiac_index, my.life_path, c.lunar_year, c.zodiac_index, c.life_path)
      -- Nhiễu ổn định trong ngày: cùng ngày thì thứ tự không nhảy giữa các trang
      + (('x' || substr(md5(me::text || c.id::text || today::text), 1, 4))::bit(16)::int % 8) as sort
    from public.duyen_profiles c
    join public.match_settings cs on cs.profile_id = c.id and cs.enabled
    where c.id <> me and c.active and c.owner is not null and c.gender is not null
      and not (c.id = any (coalesce(p_seen, '{}')))
      and (ms.want_gender = 'ca-hai' or c.gender = ms.want_gender)
      and (cs.want_gender = 'ca-hai' or cs.want_gender = my.gender)
      and abs(coalesce(c.birth_year, c.lunar_year) - my_year) <= least(ms.age_gap, cs.age_gap)
      and (not ms.same_city or c.city = my.city)
      and (not cs.same_city or c.city = my.city)
      and not exists (select 1 from public.match_likes l where l.from_id = me and l.to_id = c.id)
      and not exists (select 1 from public.match_blocks b where (b.blocker = me and b.blocked = c.id) or (b.blocker = c.id and b.blocked = me))
      and (select count(*) from public.match_reports r where r.reported = c.id) < 3
    order by sort desc
    limit lim
  ) pick;

  if ids is null then return '[]'::jsonb; end if;

  insert into public.match_suggestions (profile_id, candidate_id, day, rank)
  select me, x.id, today, x.ord from unnest(ids) with ordinality as x(id, ord)
  on conflict do nothing;

  return (
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'name', c.name, 'gender', c.gender, 'looking_for', c.looking_for, 'bio', c.bio,
      'lunar_year', c.lunar_year, 'zodiac_index', c.zodiac_index, 'life_path', c.life_path,
      'city', c.city, 'birth_year', c.birth_year,
      'decision', null,
      'liked_me', exists (select 1 from public.match_likes l where l.from_id = c.id and l.to_id = me and l.liked)
    ) order by x.ord)
    from unnest(ids) with ordinality as x(id, ord)
    join public.duyen_profiles c on c.id = x.id
  );
end $$;

revoke all on function public.get_match_feed(uuid[], int) from public, anon;
grant execute on function public.get_match_feed(uuid[], int) to authenticated;

notify pgrst, 'reload schema';
