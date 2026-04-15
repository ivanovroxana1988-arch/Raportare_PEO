-- Create livrabil_rows table
-- Stores deliverable verification data

CREATE TABLE IF NOT EXISTS public.livrabil_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  activity_date DATE,
  activity_title TEXT,
  file_exists BOOLEAN DEFAULT false,
  title_match BOOLEAN DEFAULT false,
  issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.livrabil_rows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "livrabil_rows_select_authenticated" ON public.livrabil_rows 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "livrabil_rows_insert_authenticated" ON public.livrabil_rows 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "livrabil_rows_update_authenticated" ON public.livrabil_rows 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "livrabil_rows_delete_authenticated" ON public.livrabil_rows 
  FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_livrabil_rows_verification_id ON public.livrabil_rows(verification_id);
