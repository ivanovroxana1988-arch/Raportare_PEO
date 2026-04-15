-- Create cross_expert_rows table
-- Stores cross-expert analysis data for detecting overlaps

CREATE TABLE IF NOT EXISTS public.cross_expert_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  expert1_id UUID REFERENCES public.experts(id),
  expert1_name TEXT NOT NULL,
  expert2_id UUID REFERENCES public.experts(id),
  expert2_name TEXT NOT NULL,
  activity1 TEXT NOT NULL,
  activity2 TEXT NOT NULL,
  similarity NUMERIC(5,2) NOT NULL CHECK (similarity >= 0 AND similarity <= 100),
  is_potential_issue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cross_expert_rows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "cross_expert_rows_select_authenticated" ON public.cross_expert_rows 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cross_expert_rows_insert_authenticated" ON public.cross_expert_rows 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "cross_expert_rows_update_authenticated" ON public.cross_expert_rows 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "cross_expert_rows_delete_authenticated" ON public.cross_expert_rows 
  FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cross_expert_rows_verification_id ON public.cross_expert_rows(verification_id);
CREATE INDEX IF NOT EXISTS idx_cross_expert_rows_date ON public.cross_expert_rows(date);
CREATE INDEX IF NOT EXISTS idx_cross_expert_rows_potential_issue ON public.cross_expert_rows(is_potential_issue);
