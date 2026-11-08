-- Cây ước nguyện: người viết tự chọn màu lá thư. Điều ước cũ (color null) dùng màu theo chủ đề.
-- Giá trị trùng WISH_COLORS trong luna/src/lib/wish-tree.ts.

alter table public.wishes add column if not exists color text
  check (color in ('hong', 'dao', 'vang', 'la', 'troi', 'tim', 'do', 'kem'));

-- Đổi chữ ký / kiểu trả về → phải drop rồi tạo lại
drop function if exists public.wish_create(text, uuid, text, text, text, boolean, text);
drop function if exists public.wish_tree(int, int);
drop function if exists public.wish_mine(uuid);

create function public.wish_create(
  p_key text, p_device uuid, p_nickname text, p_content text, p_topic text, p_public boolean, p_blessing text, p_color text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  new_id uuid;
begin
  if p_key is null or p_key is distinct from (select s.value from private.app_secrets s where s.name = 'wish_server_key') then
    raise exception 'forbidden' using errcode = 'P0001';
  end if;
  if auth.uid() is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wishes w where w.owner = auth.uid() and w.created_at > now() - interval '1 day') >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wishes w where w.created_at > now() - interval '10 minutes') >= 200 then
    raise exception 'busy' using errcode = 'P0001';
  end if;
  insert into public.wishes (owner, device_token, nickname, content, topic, is_public, blessing, color)
  values (auth.uid(), p_device, nullif(trim(coalesce(p_nickname, '')), ''), trim(p_content), p_topic,
          coalesce(p_public, true), nullif(trim(coalesce(p_blessing, '')), ''), nullif(p_color, ''))
  returning id into new_id;
  return new_id;
end $$;

-- Màu lá thư lộ cả với thư riêng tư (người khác vẫn thấy phong thư màu gì), nội dung thì không.
create function public.wish_tree(p_offset int default 0, p_limit int default 16)
returns table (id uuid, topic text, color text, is_public boolean, nickname text, content text, bless_count int, created_at timestamptz, total bigint)
language sql security definer set search_path = '' stable as $$
  select w.id, w.topic, w.color, w.is_public,
         case when w.is_public then w.nickname end,
         case when w.is_public then w.content end,
         case when w.is_public then w.bless_count else 0 end,
         w.created_at,
         count(*) over ()
  from public.wishes w
  where not w.hidden
  order by w.created_at desc
  offset greatest(0, coalesce(p_offset, 0))
  limit least(50, greatest(1, coalesce(p_limit, 16)));
$$;

create function public.wish_mine(p_device uuid)
returns table (id uuid, nickname text, content text, topic text, color text, is_public boolean, blessing text, bless_count int, hidden boolean, created_at timestamptz)
language sql security definer set search_path = '' stable as $$
  select w.id, w.nickname, w.content, w.topic, w.color, w.is_public, w.blessing, w.bless_count, w.hidden, w.created_at
  from public.wishes w
  where w.device_token = p_device or (auth.uid() is not null and w.owner = auth.uid())
  order by w.created_at desc
  limit 100;
$$;

revoke all on function public.wish_create(text, uuid, text, text, text, boolean, text, text) from public;
revoke all on function public.wish_tree(int, int) from public;
revoke all on function public.wish_mine(uuid) from public;
grant execute on function public.wish_create(text, uuid, text, text, text, boolean, text, text) to anon, authenticated;
grant execute on function public.wish_tree(int, int) to anon, authenticated;
grant execute on function public.wish_mine(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
