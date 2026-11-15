-- Locus: storage buckets for avatars and place photos.
--
-- Both are public-read: a profile picture and a photo of a library are not
-- secrets, and public buckets mean plain CDN URLs with no signing. Writes are
-- locked down by path — a user may only write under their own user id.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('place-photos', 'place-photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Paths look like `<user_id>/<something>.jpg`, so the first path segment is
-- the owner. storage.foldername() returns that as an array.

create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users replace their own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete their own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "place photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'place-photos');

create policy "users upload place photos under their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'place-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete their own place photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'place-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
