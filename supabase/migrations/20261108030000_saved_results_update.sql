-- Tự lưu kết quả cho người đã đăng nhập: lưu ngay khi có kết quả, rồi cập nhật
-- lại khi phần luận giải AI về sau → cần quyền UPDATE trên chính bản ghi của mình.

drop policy if exists "saved_results_update_own" on public.saved_results;
create policy "saved_results_update_own" on public.saved_results
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant update (title, summary, payload) on public.saved_results to authenticated;
