-- Cây ước nguyện, vòng 2:
--  - Điều ước riêng tư cũng treo trên cây, nhưng chỉ lộ chủ đề + thời gian;
--    nội dung và tên chỉ người viết đọc được (qua wish_mine).
--  - Phải đăng nhập mới treo được điều ước. Xem cây thì ai cũng xem được.

-- Đọc cây: mọi điều ước chưa bị ẩn, mới nhất trước. Riêng tư thì trả nội dung/tên là null.
create or replace function public.wish_tree(p_offset int default 0, p_limit int default 16)
returns table (id uuid, topic text, is_public boolean, nickname text, content text, bless_count int, created_at timestamptz, total bigint)
language sql security definer set search_path = '' stable as $$
  select w.id, w.topic, w.is_public,
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

-- Treo điều ước: thêm điều kiện đã đăng nhập; giới hạn 5 điều ước / tài khoản / ngày.
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
  if auth.uid() is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;
  if (select count(*) from public.wishes w where w.owner = auth.uid() and w.created_at > now() - interval '1 day') >= 5 then
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

revoke all on function public.wish_tree(int, int) from public;
grant execute on function public.wish_tree(int, int) to anon, authenticated;

-- Cây giờ đọc qua wish_tree; không cần cho đọc thẳng bảng nữa
revoke select (id, nickname, content, topic, bless_count, created_at) on public.wishes from anon, authenticated;
revoke select on public.wishes from anon, authenticated;
drop policy if exists "wishes_public_read" on public.wishes;

notify pgrst, 'reload schema';
