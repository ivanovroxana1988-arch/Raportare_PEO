-- Create grup_tinta table
-- Stores target group entries linked to activities

CREATE TABLE IF NOT EXISTS public.grup_tinta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cnp TEXT, -- Romanian personal identification number
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grup_tinta ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view grup_tinta
CREATE POLICY "grup_tinta_select_authenticated" ON public.grup_tinta 
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert grup_tinta
CREATE POLICY "grup_tinta_insert_authenticated" ON public.grup_tinta 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users to update grup_tinta
CREATE POLICY "grup_tinta_update_authenticated" ON public.grup_tinta 
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users to delete grup_tinta
CREATE POLICY "grup_tinta_delete_authenticated" ON public.grup_tinta 
  FOR DELETE TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grup_tinta_activity_id ON public.grup_tinta(activity_id);
CREATE INDEX IF NOT EXISTS idx_grup_tinta_date ON public.grup_tinta(date);
CREATE INDEX IF NOT EXISTS idx_grup_tinta_cnp ON public.grup_tinta(cnp);
