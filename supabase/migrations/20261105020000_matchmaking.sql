-- Se duyên → ghép đôi: Luna gợi ý 3 người mỗi ngày, hai bên cùng "Muốn làm quen" thì mở
-- Zalo / Instagram / Facebook của nhau. Không có chat.
--
-- Chỉ người ĐÃ ĐĂNG NHẬP và tự bật mới vào vòng ghép (hồ sơ có `owner`). Mọi bảng mới đều
-- đóng hoàn toàn với anon/authenticated; chỉ đi qua RPC security definer bên dưới, nên:
--  - không ai liệt kê được ai đang tham gia (mỗi ngày chỉ thấy 3 người Luna chọn),
--  - liên lạc chỉ lộ cho người đã ghép đôi hai chiều,
--  - chỉ "thích" được người nằm trong gợi ý của mình (không nhắm vào ai cụ thể).
-- Xếp hạng ứng viên tính ngay trong SQL (bản rút gọn của src/lib/hop-nhau.ts, bỏ nhiễu theo tên
-- và cung mệnh) — chỉ dùng để chọn ai; con số % hiện trên thẻ vẫn do TS tính.

-- ── Bảng ──

create table if not exists public.match_settings (
  profile_id uuid primary key references public.duyen_profiles (id) on delete cascade,
  enabled boolean not null default false,
  want_gender text not null default 'ca-hai' check (want_gender in ('nam', 'nu', 'ca-hai')),
  age_gap int not null default 5 check (age_gap between 1 and 30),
  same_city boolean not null default true,
  adult_confirmed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.match_contacts (
  profile_id uuid primary key references public.duyen_profiles (id) on delete cascade,
  -- Số Việt Nam 10 số, chỉ dùng để dựng link zalo.me — giao diện không in số ra
  zalo text check (zalo ~ '^0[0-9]{9}$'),
  instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  -- Tên người dùng Facebook, hoặc "profile.php?id=<số>"
  facebook text check (facebook ~ '^([A-Za-z0-9.]{5,50}|profile\.php\?id=[0-9]{5,20})$'),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_suggestions (
  profile_id uuid not null references public.duyen_profiles (id) on delete cascade,
  candidate_id uuid not null references public.duyen_profiles (id) on delete cascade,
  day date not null,
  rank int not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, candidate_id, day)
);
create index if not exists match_suggestions_day_idx on public.match_suggestions (profile_id, day);
create index if not exists match_suggestions_candidate_idx on public.match_suggestions (candidate_id);

-- liked = true: "Muốn làm quen"; false: "Bỏ qua"
create table if not exists public.match_likes (
  from_id uuid not null references public.duyen_profiles (id) on delete cascade,
  to_id uuid not null references public.duyen_profiles (id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id)
);
create index if not exists match_likes_to_idx on public.match_likes (to_id) where liked;

create table if not exists public.match_blocks (
  blocker uuid not null references public.duyen_profiles (id) on delete cascade,
  blocked uuid not null references public.duyen_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);
create index if not exists match_blocks_blocked_idx on public.match_blocks (blocked);

create table if not exists public.match_reports (
  reporter uuid not null references public.duyen_profiles (id) on delete cascade,
  reported uuid not null references public.duyen_profiles (id) on delete cascade,
  reason text not null check (reason in ('gia-mao', 'quay-rot', 'lua-dao', 'duoi-18', 'khac')),
  created_at timestamptz not null default now(),
  primary key (reporter, reported)
);
create index if not exists match_reports_reported_idx on public.match_reports (reported);

do $$
declare t text;
begin
  foreach t in array array['match_settings', 'match_contacts', 'match_suggestions', 'match_likes', 'match_blocks', 'match_reports'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

-- ── Điểm xếp hạng (0–100) từ các trường công khai — cùng luật với hop-nhau.ts ──

create or replace function public.compatibility_rank_score(ly1 int, z1 int, lp1 int, ly2 int, z2 int, lp2 int)
returns int
language plpgsql immutable set search_path = '' as $$
declare
  b1 int := (((ly1 - 4) % 12) + 12) % 12;
  b2 int := (((ly2 - 4) % 12) + 12) % 12;
  -- Can → hành: Mộc 0, Hỏa 1, Thổ 2, Kim 3, Thủy 4 (hai Can một hành)
  e1 int := ((((ly1 - 4) % 10) + 10) % 10) / 2;
  e2 int := ((((ly2 - 4) % 10) + 10) % 10) / 2;
  -- Nguyên tố cung: Lửa 0, Đất 1, Khí 2, Nước 3
  ze1 int := z1 % 4;
  ze2 int := z2 % 4;
  r1 int := case when lp1 > 9 then case lp1 when 11 then 2 when 22 then 4 else 6 end else lp1 end;
  r2 int := case when lp2 > 9 then case lp2 when 11 then 2 when 22 then 4 else 6 end else lp2 end;
  s_cg int; s_nh int; s_z int; s_lp int;
begin
  s_cg := case
    when b1 = b2 then 78
    when b1 % 4 = b2 % 4 then 94            -- tam hợp
    when (b1 + b2) % 12 = 1 then 91         -- lục hợp
    when abs(b1 - b2) = 6 then 58           -- lục xung
    else 72 end;
  s_nh := case
    when e1 = e2 then 80
    when (e1 + 1) % 5 = e2 or (e2 + 1) % 5 = e1 then 90
    else 60 end;
  s_z := case
    when z1 = z2 then 82
    when abs(z1 - z2) = 6 then 84
    when ze1 = ze2 then 88
    when abs(ze1 - ze2) = 2 then 86         -- Lửa–Khí, Đất–Nước
    else 64 end;
  s_lp := case
    when r1 = r2 then 80
    when (r1 in (1, 5, 7) and r2 in (1, 5, 7)) or (r1 in (2, 4, 8) and r2 in (2, 4, 8)) or (r1 in (3, 6, 9) and r2 in (3, 6, 9)) then 90
    else 66 end;
  return round(s_cg * 0.3 + s_nh * 0.2 + s_z * 0.3 + s_lp * 0.2);
end $$;

-- Hồ sơ của tài khoản đang đăng nhập (mỗi tài khoản một hồ sơ).
create or replace function public.my_dating_profile_id()
returns uuid
language sql security definer set search_path = '' stable as $$
  select d.id from public.duyen_profiles d
  where auth.uid() is not null and d.owner = auth.uid()
  order by d.created_at desc limit 1;
$$;

-- Hôm nay theo giờ Việt Nam
create or replace function public.today_in_vietnam()
returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Asia/Ho_Chi_Minh')::date;
$$;

-- ── RPC cho người dùng ──

-- Cài đặt + liên lạc của chính mình.
create or replace function public.get_match_settings()
returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare
  me uuid := public.my_dating_profile_id();
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  return jsonb_build_object(
    'settings', (select to_jsonb(s) - 'profile_id' from public.match_settings s where s.profile_id = me),
    'contacts', (select to_jsonb(c) - 'profile_id' from public.match_contacts c where c.profile_id = me)
  );
end $$;

-- Bật/tắt + lưu cài đặt và liên lạc.
create or replace function public.save_match_settings(
  p_enabled boolean, p_want_gender text, p_age_gap int, p_same_city boolean,
  p_zalo text, p_instagram text, p_facebook text, p_adult boolean
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public.my_dating_profile_id();
  pr public.duyen_profiles;
  z text := nullif(trim(coalesce(p_zalo, '')), '');
  ig text := nullif(trim(coalesce(p_instagram, '')), '');
  fb text := nullif(trim(coalesce(p_facebook, '')), '');
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  select * into pr from public.duyen_profiles d where d.id = me;
  if p_enabled then
    if coalesce(pr.birth_year, pr.lunar_year) > extract(year from now())::int - 18 then
      raise exception 'under_18' using errcode = 'P0001';
    end if;
    if not coalesce(p_adult, false) then raise exception 'need_adult' using errcode = 'P0001'; end if;
    if pr.gender is null then raise exception 'need_gender' using errcode = 'P0001'; end if;
    if p_same_city and pr.city is null then raise exception 'need_city' using errcode = 'P0001'; end if;
    if z is null and ig is null and fb is null then raise exception 'need_contact' using errcode = 'P0001'; end if;
  end if;

  insert into public.match_contacts as c (profile_id, zalo, instagram, facebook)
  values (me, z, ig, fb)
  on conflict (profile_id) do update set zalo = excluded.zalo, instagram = excluded.instagram, facebook = excluded.facebook, updated_at = now();

  insert into public.match_settings as s (profile_id, enabled, want_gender, age_gap, same_city, adult_confirmed_at)
  values (me, p_enabled, coalesce(nullif(p_want_gender, ''), 'ca-hai'), greatest(1, least(30, coalesce(p_age_gap, 5))), coalesce(p_same_city, true),
          case when p_enabled then now() end)
  on conflict (profile_id) do update set
    enabled = excluded.enabled,
    want_gender = excluded.want_gender,
    age_gap = excluded.age_gap,
    same_city = excluded.same_city,
    adult_confirmed_at = coalesce(excluded.adult_confirmed_at, s.adult_confirmed_at),
    updated_at = now();
end $$;

-- Gợi ý hôm nay: lần đầu gọi trong ngày thì chọn 3 người, những lần sau trả lại đúng 3 người đó.
create or replace function public.get_today_suggestions()
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public.my_dating_profile_id();
  today date := public.today_in_vietnam();
  my public.duyen_profiles;
  ms public.match_settings;
  my_year int;
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  select * into ms from public.match_settings s where s.profile_id = me;
  if ms is null or not ms.enabled then raise exception 'not_enabled' using errcode = 'P0001'; end if;
  select * into my from public.duyen_profiles d where d.id = me;
  my_year := coalesce(my.birth_year, my.lunar_year);

  if not exists (select 1 from public.match_suggestions g where g.profile_id = me and g.day = today) then
    insert into public.match_suggestions (profile_id, candidate_id, day, rank)
    select me, pick.id, today, row_number() over (order by pick.sort desc)
    from (
      select c.id,
        -- Người đã "Muốn làm quen" mình được ưu tiên — để hai bên có cơ hội gặp nhau
        (case when exists (select 1 from public.match_likes l where l.from_id = c.id and l.to_id = me and l.liked) then 1000 else 0 end)
        + public.compatibility_rank_score(my.lunar_year, my.zodiac_index, my.life_path, c.lunar_year, c.zodiac_index, c.life_path)
        + random() * 8 as sort
      from public.duyen_profiles c
      join public.match_settings cs on cs.profile_id = c.id and cs.enabled
      where c.id <> me and c.active and c.owner is not null and c.gender is not null
        -- Giới tính: hai bên đều đúng người mình muốn gặp
        and (ms.want_gender = 'ca-hai' or c.gender = ms.want_gender)
        and (cs.want_gender = 'ca-hai' or cs.want_gender = my.gender)
        -- Tuổi: lọt khoảng chênh của cả hai
        and abs(coalesce(c.birth_year, c.lunar_year) - my_year) <= least(ms.age_gap, cs.age_gap)
        -- Thành phố
        and (not ms.same_city or c.city = my.city)
        and (not cs.same_city or c.city = my.city)
        -- Chưa quyết định về người này, chưa chặn nhau, chưa bị báo cáo nhiều
        and not exists (select 1 from public.match_likes l where l.from_id = me and l.to_id = c.id)
        and not exists (select 1 from public.match_blocks b where (b.blocker = me and b.blocked = c.id) or (b.blocker = c.id and b.blocked = me))
        and (select count(*) from public.match_reports r where r.reported = c.id) < 3
        -- Không lặp lại người đã gợi ý trong 30 ngày
        and not exists (select 1 from public.match_suggestions g where g.profile_id = me and g.candidate_id = c.id and g.day > today - 30)
      order by sort desc
      limit 3
    ) pick;
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'name', c.name, 'gender', c.gender, 'looking_for', c.looking_for, 'bio', c.bio,
      'lunar_year', c.lunar_year, 'zodiac_index', c.zodiac_index, 'life_path', c.life_path,
      'city', c.city, 'birth_year', c.birth_year,
      'decision', (select l.liked from public.match_likes l where l.from_id = me and l.to_id = c.id),
      'liked_me', exists (select 1 from public.match_likes l where l.from_id = c.id and l.to_id = me and l.liked)
    ) order by g.rank)
    from public.match_suggestions g
    join public.duyen_profiles c on c.id = g.candidate_id and c.active
    where g.profile_id = me and g.day = today
      and not exists (select 1 from public.match_blocks b where (b.blocker = me and b.blocked = c.id) or (b.blocker = c.id and b.blocked = me))
  ), '[]'::jsonb);
end $$;

-- "Muốn làm quen" / "Bỏ qua" một người trong gợi ý. Trả { matched } nếu hai bên cùng thích.
create or replace function public.decide_match(p_candidate uuid, p_like boolean)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public.my_dating_profile_id();
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.match_suggestions g where g.profile_id = me and g.candidate_id = p_candidate) then
    raise exception 'not_suggested' using errcode = 'P0001';
  end if;
  insert into public.match_likes (from_id, to_id, liked) values (me, p_candidate, p_like)
  on conflict (from_id, to_id) do update set liked = excluded.liked, created_at = now();
  return jsonb_build_object('matched', p_like and exists (
    select 1 from public.match_likes l where l.from_id = p_candidate and l.to_id = me and l.liked
  ));
end $$;

-- Những người đã ghép đôi hai chiều, kèm liên lạc.
create or replace function public.list_matches()
returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare
  me uuid := public.my_dating_profile_id();
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'name', c.name, 'gender', c.gender, 'looking_for', c.looking_for, 'bio', c.bio,
      'lunar_year', c.lunar_year, 'zodiac_index', c.zodiac_index, 'life_path', c.life_path,
      'city', c.city, 'birth_year', c.birth_year,
      'matched_at', greatest(mine.created_at, theirs.created_at),
      'zalo', ct.zalo, 'instagram', ct.instagram, 'facebook', ct.facebook
    ) order by greatest(mine.created_at, theirs.created_at) desc)
    from public.match_likes mine
    join public.match_likes theirs on theirs.from_id = mine.to_id and theirs.to_id = me and theirs.liked
    join public.duyen_profiles c on c.id = mine.to_id and c.active
    left join public.match_contacts ct on ct.profile_id = c.id
    where mine.from_id = me and mine.liked
      and not exists (select 1 from public.match_blocks b where (b.blocker = me and b.blocked = c.id) or (b.blocker = c.id and b.blocked = me))
  ), '[]'::jsonb);
end $$;

-- Chặn (kiêm huỷ ghép): hai người không bao giờ thấy nhau nữa, liên lạc ẩn lại.
create or replace function public.block_match(p_other uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public.my_dating_profile_id();
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.match_suggestions g where g.profile_id = me and g.candidate_id = p_other) then
    raise exception 'not_suggested' using errcode = 'P0001';
  end if;
  insert into public.match_blocks (blocker, blocked) values (me, p_other) on conflict do nothing;
end $$;

-- Báo cáo (kèm chặn). Bị 3 người báo thì không còn được gợi ý cho ai.
create or replace function public.report_match(p_other uuid, p_reason text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  me uuid := public.my_dating_profile_id();
begin
  if me is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.match_suggestions g where g.profile_id = me and g.candidate_id = p_other) then
    raise exception 'not_suggested' using errcode = 'P0001';
  end if;
  insert into public.match_reports (reporter, reported, reason) values (me, p_other, p_reason)
  on conflict (reporter, reported) do update set reason = excluded.reason;
  insert into public.match_blocks (blocker, blocked) values (me, p_other) on conflict do nothing;
end $$;

-- Đọc một hồ sơ công khai theo slug. Thay cho select thẳng bảng (đang cho phép liệt kê mọi hồ sơ);
-- sau khi bản dùng RPC này lên production, chạy migration thu hồi quyền select trên duyen_profiles.
create or replace function public.get_dating_profile(p_slug text)
returns jsonb
language sql security definer set search_path = '' stable as $$
  select to_jsonb(d) - 'manage_token' - 'owner'
  from public.duyen_profiles d where d.slug = p_slug and d.active;
$$;

-- ── Quyền ──

revoke all on function public.compatibility_rank_score(int, int, int, int, int, int) from public, anon, authenticated;
revoke all on function public.my_dating_profile_id() from public, anon, authenticated;
revoke all on function public.today_in_vietnam() from public, anon, authenticated;

revoke all on function public.get_match_settings() from public, anon;
revoke all on function public.save_match_settings(boolean, text, int, boolean, text, text, text, boolean) from public, anon;
revoke all on function public.get_today_suggestions() from public, anon;
revoke all on function public.decide_match(uuid, boolean) from public, anon;
revoke all on function public.list_matches() from public, anon;
revoke all on function public.block_match(uuid) from public, anon;
revoke all on function public.report_match(uuid, text) from public, anon;

grant execute on function public.get_match_settings() to authenticated;
grant execute on function public.save_match_settings(boolean, text, int, boolean, text, text, text, boolean) to authenticated;
grant execute on function public.get_today_suggestions() to authenticated;
grant execute on function public.decide_match(uuid, boolean) to authenticated;
grant execute on function public.list_matches() to authenticated;
grant execute on function public.block_match(uuid) to authenticated;
grant execute on function public.report_match(uuid, text) to authenticated;

revoke all on function public.get_dating_profile(text) from public;
grant execute on function public.get_dating_profile(text) to anon, authenticated;

notify pgrst, 'reload schema';
