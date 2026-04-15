-- Create deliverables table
-- Stores file attachments linked to activities

CREATE TABLE IF NOT EXISTS public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view deliverables
CREATE POLICY "deliverables_select_authenticated" ON public.deliverables 
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert deliverables
CREATE POLICY "deliverables_insert_authenticated" ON public.deliverables 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update deliverables
CREATE POLICY "deliverables_update_authenticated" ON public.deliverables 
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete deliverables
CREATE POLICY "deliverables_delete_authenticated" ON public.deliverables 
  FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_activity_id ON public.deliverables(activity_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_file_type ON public.deliverables(file_type);
