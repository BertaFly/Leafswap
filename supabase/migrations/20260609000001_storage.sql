-- Public bucket for plant photos.
-- Files are stored at {userId}/{timestamp}.{ext} so ownership is
-- enforced by matching the first path segment against auth.uid().

INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Plant photos are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-photos');

CREATE POLICY "Users can upload to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'plant-photos'
    AND auth.uid()::text = split_part(name, '/', 1)
  );
