-- Create storage bucket for deliverables
-- This creates a bucket for storing uploaded files

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deliverables',
  'deliverables',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for deliverables bucket

-- Allow authenticated users to upload files
CREATE POLICY "deliverables_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'deliverables');

-- Allow authenticated users to view files
CREATE POLICY "deliverables_view" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'deliverables');

-- Allow authenticated users to update their files
CREATE POLICY "deliverables_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'deliverables');

-- Allow authenticated users to delete files
CREATE POLICY "deliverables_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'deliverables');
