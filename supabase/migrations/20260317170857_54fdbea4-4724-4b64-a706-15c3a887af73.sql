
-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Allow authenticated admins to upload files
CREATE POLICY "Admins can upload media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

-- Allow authenticated admins to update files
CREATE POLICY "Admins can update media" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

-- Allow authenticated admins to delete files
CREATE POLICY "Admins can delete media" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'media' AND
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

-- Allow public read access to media files
CREATE POLICY "Public can read media" ON storage.objects
FOR SELECT USING (bucket_id = 'media');
