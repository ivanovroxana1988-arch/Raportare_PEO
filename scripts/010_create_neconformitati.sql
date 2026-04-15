-- Create neconformitati table
-- Stores non-conformity issues found during verification

CREATE TABLE IF NOT EXISTS public.neconformitati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pontaj', 'raport', 'livrabil', 'cross-expert', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  affected_date DATE,
  affected_expert_id UUID REFERENCES public.experts(id),
  resolved BOOLEAN DEFAULT false,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.neconformitati ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "neconformitati_select_authenticated" ON public.neconformitati 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "neconformitati_insert_authenticated" ON public.neconformitati 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "neconformitati_update_authenticated" ON public.neconformitati 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "neconformitati_delete_authenticated" ON public.neconformitati 
  FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_neconformitati_verification_id ON public.neconformitati(verification_id);
CREATE INDEX IF NOT EXISTS idx_neconformitati_type ON public.neconformitati(type);
CREATE INDEX IF NOT EXISTS idx_neconformitati_severity ON public.neconformitati(severity);
CREATE INDEX IF NOT EXISTS idx_neconformitati_resolved ON public.neconformitati(resolved);
