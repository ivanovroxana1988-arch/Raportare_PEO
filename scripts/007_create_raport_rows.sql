-- Create raport_rows table
-- Stores extracted raport activitate data for verification

CREATE TABLE IF NOT EXISTS public.raport_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  activity_title TEXT NOT NULL,
  description TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT false,
  matches_pontaj BOOLEAN DEFAULT false,
  issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.raport_rows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "raport_rows_select_authenticated" ON public.raport_rows 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "raport_rows_insert_authenticated" ON public.raport_rows 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "raport_rows_update_authenticated" ON public.raport_rows 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "raport_rows_delete_authenticated" ON public.raport_rows 
  FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_raport_rows_verification_id ON public.raport_rows(verification_id);
CREATE INDEX IF NOT EXISTS idx_raport_rows_date ON public.raport_rows(date);
