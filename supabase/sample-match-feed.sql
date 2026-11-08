-- DỮ LIỆU MẪU cho feed Se duyên: 5 hồ sơ giả để xem flow "lướt → Kết nối → hiện Zalo/IG/FB".
-- KHÔNG phải migration. Chạy tay sau các migration matchmaking / dating_adults_only / match_feed / sample_profiles.
-- Hồ sơ mẫu có is_sample = true → chỉ hiện trong feed khi chạy `next dev`, production không thấy.
-- Gỡ: chạy khối "GỠ DỮ LIỆU MẪU" ở cuối file.
--
-- Mọi tài khoản mẫu có email *@sample.luna.test để dễ nhận ra và xoá.
-- Hồ sơ mẫu là nữ, năm sinh ±2 và cùng thành phố với hồ sơ duyên của tài khoản Google chủ app,
-- và chấp nhận gặp mọi giới tính.
-- 2 người đầu đã "Kết nối" sẵn với bạn → bấm Kết nối là ghép ngay, thấy liên lạc liền.
-- 3 người sau thì bấm Kết nối chỉ ra trạng thái "Đã gửi kết nối".

do $$
declare
  me public.duyen_profiles;
  mine public.match_settings;
  g text;
  y int;
  rec record;
  uid uuid;
  pid uuid;
begin
  select d.* into me from public.duyen_profiles d
  join auth.users u on u.id = d.owner
  where u.email = 'haohuynh11011999@gmail.com'
  order by d.created_at desc limit 1;
  if me.id is null then raise exception 'Chưa có hồ sơ duyên gắn với tài khoản Google — tạo hồ sơ trong app trước.'; end if;

  select * into mine from public.match_settings s where s.profile_id = me.id;
  -- Tên mẫu đều là tên nữ → hồ sơ mẫu là nữ. Muốn thấy trong feed thì chọn "Bạn muốn gặp: Nữ" hoặc "Cả hai".
  g := 'nu';
  y := coalesce(me.birth_year, me.lunar_year);

  for rec in
    select * from (values
      (1, 'Minh Anh',  y - 1, 3,  1, 'Cà phê · Đọc sách · Mèo',      'minhanh.sample',  true),
      (2, 'Gia Hân',   y + 1, 7,  6, 'Du lịch · Chụp ảnh',           'giahan.sample',   true),
      (3, 'Thảo Vy',   y,     10, 3, 'Nấu ăn · Yoga · Nhạc indie',   'thaovy.sample',   false),
      (4, 'Khánh Linh', y - 2, 0, 9, 'Chạy bộ · Board game',         'khanhlinh.sample', false),
      (5, 'Bảo Ngọc',  y + 2, 5,  22, 'Vẽ · Phim Ghibli · Trà sữa',  'baongoc.sample',  false)
    ) as t(n, name, birth_year, zodiac, life_path, bio, ig, liked_me)
  loop
    uid := gen_random_uuid();
    insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
            'sample' || rec.n || '@sample.luna.test', '', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"sample":true}');

    insert into public.duyen_profiles (slug, owner, name, gender, looking_for, bio, lunar_year, zodiac_index, life_path, city, birth_year, is_sample)
    values ('sample-' || rec.n || '-' || substr(md5(uid::text), 1, 4), uid, rec.name, g, 'yeu', rec.bio,
            rec.birth_year, rec.zodiac, rec.life_path, me.city, rec.birth_year, true)
    returning id into pid;

    insert into public.match_settings (profile_id, enabled, want_gender, age_gap, same_city, adult_confirmed_at)
    values (pid, true, 'ca-hai', 10, false, now());

    insert into public.match_contacts (profile_id, zalo, instagram, facebook)
    values (pid, '090000000' || rec.n, rec.ig, 'sample.luna.' || rec.n);

    if rec.liked_me then
      insert into public.match_likes (from_id, to_id, liked) values (pid, me.id, true);
    end if;
  end loop;
end $$;

-- ── GỠ DỮ LIỆU MẪU ── (xoá user → hồ sơ, cài đặt, like, gợi ý liên quan tự xoá theo)
-- delete from public.duyen_profiles d using auth.users u where u.id = d.owner and u.email like '%@sample.luna.test';
-- delete from auth.users where email like '%@sample.luna.test';
