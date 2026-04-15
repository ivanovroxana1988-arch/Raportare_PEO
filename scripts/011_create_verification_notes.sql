-- Create verification_notes table
-- Stores notes added during verification process

CREATE TABLE IF NOT EXISTS public.verification_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_notes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "verification_notes_select_authenticated" ON public.verification_notes 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "verification_notes_insert_authenticated" ON public.verification_notes 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "verification_notes_update_authenticated" ON public.verification_notes 
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "verification_notes_delete_authenticated" ON public.verification_notes 
  FOR DELETE TO authenticated USING (true);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS verification_notes_updated_at ON public.verification_notes;
CREATE TRIGGER verification_notes_updated_at
  BEFORE UPDATE ON public.verification_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_notes_verification_id ON public.verification_notes(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_notes_category ON public.verification_notes(category);
