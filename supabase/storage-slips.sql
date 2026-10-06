-- KIKI: Storage bucket for deposit payment slips
-- Paste into Supabase SQL Editor and click Run. Safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('slips', 'slips', true, 5242880, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "slips_insert" on storage.objects;
create policy "slips_insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'slips');

drop policy if exists "slips_select" on storage.objects;
create policy "slips_select" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'slips');
