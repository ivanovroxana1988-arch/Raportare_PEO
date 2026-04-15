-- Create pontaj_rows table
-- Stores imported pontaj Excel data for verification

CREATE TABLE IF NOT EXISTS public.pontaj_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL,
  activity_code TEXT NOT NULL,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pontaj_rows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "pontaj_rows_select_authenticated" ON public.pontaj_rows 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "pontaj_rows_insert_authenticated" ON public.pontaj_rows 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "pontaj_rows_update_authenticated" ON public.pontaj_rows 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "pontaj_rows_delete_authenticated" ON public.pontaj_rows 
  FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pontaj_rows_verification_id ON public.pontaj_rows(verification_id);
CREATE INDEX IF NOT EXISTS idx_pontaj_rows_date ON public.pontaj_rows(date);
