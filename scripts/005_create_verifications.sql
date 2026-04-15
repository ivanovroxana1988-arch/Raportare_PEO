-- Create verifications table
-- Stores verification sessions for PM dashboard

CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'issues')),
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Ensure unique verification per expert per month/year
  UNIQUE(expert_id, month, year)
);

-- Enable RLS
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view verifications
CREATE POLICY "verifications_select_authenticated" ON public.verifications 
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to manage verifications
CREATE POLICY "verifications_insert_authenticated" ON public.verifications 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "verifications_update_authenticated" ON public.verifications 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "verifications_delete_authenticated" ON public.verifications 
  FOR DELETE TO authenticated USING (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS verifications_updated_at ON public.verifications;
CREATE TRIGGER verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verifications_expert_id ON public.verifications(expert_id);
CREATE INDEX IF NOT EXISTS idx_verifications_month_year ON public.verifications(month, year);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications(status);
